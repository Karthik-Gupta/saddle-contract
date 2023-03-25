import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { MULTISIG_ADDRESSES } from "../../utils/accounts"

// Deployment names
const POOL_NAME = "PascalETHPool"
const POOL_LP_TOKEN_NAME = `${POOL_NAME}LPToken`
// Constructor arguments
const TOKEN_NAMES = ["WETH", "STETH"]
const TOKEN_DECIMALS = [18, 18]
const LP_TOKEN_NAME = "Pascal WETH/stETH"
const LP_TOKEN_SYMBOL = "pascalETH"
const INITIAL_A = 10
const SWAP_FEE = 4e6 // 4bps
const ADMIN_FEE = 0
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, getChainId } = hre
  const { execute, get, getOrNull, log, read, save, deploy } = deployments
  const { deployer } = await getNamedAccounts()

  // Manually check if the pool is already deployed
  const pool = await getOrNull(POOL_NAME)
  if (pool) {
    log(`reusing ${POOL_NAME} at ${pool.address}`)
  } else {
    const TOKEN_ADDRESSES = await Promise.all(
      TOKEN_NAMES.map(async (name) => (await get(name)).address),
    )

    await deploy(POOL_NAME, {
      from: deployer,
      log: true,
      contract: "SwapFlashLoan",
      libraries: {
        SwapUtils: (await get("SwapUtils")).address,
        AmplificationUtils: (await get("AmplificationUtils")).address,
      },
      skipIfAlreadyDeployed: true,
    })

    await execute(
      POOL_NAME,
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

    await execute(
      POOL_NAME,
      { from: deployer, log: true },
      "transferOwnership",
      MULTISIG_ADDRESSES[await getChainId()],
    )

    const lpTokenAddress = (await read(POOL_NAME, "swapStorage")).lpToken
    log(`deployed ${POOL_LP_TOKEN_NAME} at ${lpTokenAddress}`)

    await save(`${POOL_LP_TOKEN_NAME}`, {
      abi: (await get("SBTC")).abi, // Generic ERC20 ABI
      address: lpTokenAddress,
    })
  }
}
export default func
func.tags = [POOL_NAME]
func.dependencies = ["SwapUtils", "SwapFlashLoan", "ETHPoolTokens"]
