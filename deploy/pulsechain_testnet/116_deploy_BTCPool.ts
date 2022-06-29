import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy, get, log, read, save, getOrNull, execute } = deployments
  const { deployer } = await getNamedAccounts()

  // Constructor arguments
  const TOKEN_ADDRESSES = [
    (await get("WBTC")).address,
    (await get("RENBTC")).address,
    (await get("SBTC")).address,
  ]
  const TOKEN_DECIMALS = [8, 8, 18]
  const LP_TOKEN_NAME = "Turing WBTC/renBTC/sBTC"
  const LP_TOKEN_SYMBOL = "turingWRenSBTC"
  const INITIAL_A = 200
  const SWAP_FEE = 4e6 // 4bps
  const ADMIN_FEE = 0

  const poolDeployment = await getOrNull("TuringBTCPool")
  if (poolDeployment) {
    log(`reusing TuringBTCPool at ${poolDeployment.address}`)
  } else {
    await deploy("TuringBTCPool", {
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
      "TuringBTCPool",
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

    const lpTokenAddress = (await read("TuringBTCPool", "swapStorage")).lpToken
    log(`BTC pool LP Token at ${lpTokenAddress}`)

    await save("TuringBTCPoolLPToken", {
      abi: (await get("SBTC")).abi, // Generic ERC20 ABI
      address: lpTokenAddress,
    })
  }
}
export default func
func.tags = ["TuringBTCPool"]
func.dependencies = ["SwapUtils", "SwapFlashLoan", "BTCPoolTokens"]
