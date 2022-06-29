import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { MULTISIG_ADDRESSES } from "../../utils/accounts"
import { isMainnet } from "../../utils/network"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, getChainId } = hre
  const { execute, get, getOrNull, log, read, save } = deployments
  const { deployer } = await getNamedAccounts()

  // Manually check if the pool is already deployed
  const turingUSDPool = await getOrNull("TuringUSDPool")
  if (turingUSDPool) {
    log(`reusing "TuringUSDPool" at ${turingUSDPool.address}`)
  } else {
    // Constructor arguments
    const TOKEN_ADDRESSES = [
      (await get("DAI")).address,
      (await get("USDC")).address,
      (await get("USDT")).address,
    ]
    const TOKEN_DECIMALS = [18, 6, 6]
    const LP_TOKEN_NAME = "Turing DAI/USDC/USDT"
    const LP_TOKEN_SYMBOL = "turingUSD"
    const INITIAL_A = 200
    const SWAP_FEE = 4e6 // 4bps
    const ADMIN_FEE = 50e8

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

    await save("TuringUSDPool", {
      abi: (await get("SwapFlashLoan")).abi,
      address: (await get("SwapFlashLoan")).address,
    })

    const lpTokenAddress = (await read("TuringUSDPool", "swapStorage")).lpToken
    log(` Turing USD pool LP Token at ${lpTokenAddress}`)

    await save("TuringUSDPoolLPToken", {
      abi: (await get("LPToken")).abi, // LPToken ABI
      address: lpTokenAddress,
    })

    const currentOwner = await read("TuringUSDPool", "owner")
    const chainId = await getChainId()

    if (isMainnet(chainId) && currentOwner != MULTISIG_ADDRESSES[chainId]) {
      await execute(
        "TuringUSDPool",
        { from: deployer, log: true },
        "transferOwnership",
        MULTISIG_ADDRESSES[chainId],
      )
    }
  }
}
export default func
func.tags = ["TuringUSDPool"]
func.dependencies = ["SwapUtils", "SwapFlashLoan", "USDPoolTokens"]
