import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { MULTISIG_ADDRESSES } from "../../utils/accounts"
import { isMainnet } from "../../utils/network"

// Deployment names
const POOL_NAME = "PascalUSDPool"
const POOL_LP_TOKEN_NAME = `${POOL_NAME}LPToken`
// Constructor arguments
const TOKEN_NAMES = ["DAI", "USDC", "USDT"]
const TOKEN_DECIMALS = [18, 6, 6]
const LP_TOKEN_NAME = "Pascal DAI/USDC/USDT"
const LP_TOKEN_SYMBOL = "pascalUSD"
const INITIAL_A = 200
const SWAP_FEE = 80e6 // 80bps
const ADMIN_FEE = 50e8 // 50% of swap fee
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, getChainId } = hre
  const { execute, get, getOrNull, log, read, save } = deployments
  const { deployer } = await getNamedAccounts()

  // Manually check if the pool is already deployed
  const pool = await getOrNull(POOL_NAME)
  if (pool) {
    log(`reusing ${POOL_NAME} at ${pool.address}`)
  } else {
    const TOKEN_ADDRESSES = await Promise.all(
      TOKEN_NAMES.map(async (name) => (await get(name)).address),
    )

    // Since this will be the first pool on chain, we initialize the target contract.
    await execute(
      "SwapFlashLoan",
      { from: deployer, log: true },
      "initialize",
      TOKEN_ADDRESSES,
      TOKEN_DECIMALS,
      LP_TOKEN_NAME,
      LP_TOKEN_SYMBOL,
      INITIAL_A,
      SWAP_FEE,
      ADMIN_FEE,
      (
        await get("LPToken")
      ).address,
    )

    await save(`${POOL_NAME}`, {
      abi: (await get("SwapFlashLoan")).abi,
      address: (await get("SwapFlashLoan")).address,
    })

    const lpTokenAddress = (await read(POOL_NAME, "swapStorage")).lpToken
    log(` deployed ${POOL_LP_TOKEN_NAME} at ${lpTokenAddress}`)

    await save(`${POOL_LP_TOKEN_NAME}`, {
      abi: (await get("LPToken")).abi, // LPToken ABI
      address: lpTokenAddress,
    })

    const currentOwner = await read(POOL_NAME, "owner")
    const chainId = await getChainId()

    if (isMainnet(chainId) && currentOwner != MULTISIG_ADDRESSES[chainId]) {
      await execute(
        POOL_NAME,
        { from: deployer, log: true },
        "transferOwnership",
        MULTISIG_ADDRESSES[chainId],
      )
    }
  }
}
export default func
func.tags = [POOL_NAME]
func.dependencies = ["SwapUtils", "SwapFlashLoan", "USDPoolTokens"]
