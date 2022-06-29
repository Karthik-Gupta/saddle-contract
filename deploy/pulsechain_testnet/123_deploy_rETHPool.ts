import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { execute, get, getOrNull, log, read, save, deploy } = deployments
  const { deployer } = await getNamedAccounts()

  // Constructor arguments
  const TOKEN_ADDRESSES = [
    (await get("WETH")).address,
    (await get("RETH")).address,
  ]
  const TOKEN_DECIMALS = [18, 18]
  const LP_TOKEN_NAME = "Turing WETH/rETH"
  const LP_TOKEN_SYMBOL = "turingRETH"
  const INITIAL_A = 10
  const SWAP_FEE = 4e6 // 4bps
  const ADMIN_FEE = 0
  const poolDeployment = await getOrNull("TuringRETHPool")
  if (poolDeployment) {
    log(`reusing TuringRETHPool at ${poolDeployment.address}`)
  } else {
    await deploy("TuringRETHPool", {
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
      "TuringRETHPool",
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

    const lpTokenAddress = (await read("TuringRETHPool", "swapStorage")).lpToken
    log(`rETH pool LP Token at ${lpTokenAddress}`)

    await save("TuringRETHPoolLPToken", {
      abi: (await get("SBTC")).abi, // Generic ERC20 ABI
      address: lpTokenAddress,
    })
  }
}
export default func
func.tags = ["RETHPool"]
func.dependencies = ["SwapUtils", "SwapFlashLoan", "RETHPoolTokens"]
