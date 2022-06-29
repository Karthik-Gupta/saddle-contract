import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { execute, get, getOrNull, log, read, save, deploy } = deployments
  const { deployer } = await getNamedAccounts()

  // Constructor arguments
  const TOKEN_ADDRESSES = [
    (await get("WETH")).address,
    (await get("STETH")).address,
  ]
  const TOKEN_DECIMALS = [18, 18]
  const LP_TOKEN_NAME = "Turing WETH/stETH"
  const LP_TOKEN_SYMBOL = "turingSTETH"
  const INITIAL_A = 10
  const SWAP_FEE = 4e6 // 4bps
  const ADMIN_FEE = 0

  const poolDeployment = await getOrNull("TuringSTETHPool")
  if (poolDeployment) {
    log(`reusing TuringSTETHPool at ${poolDeployment.address}`)
  } else {
    await deploy("TuringSTETHPool", {
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
      "TuringSTETHPool",
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

    const lpTokenAddress = (await read("TuringSTETHPool", "swapStorage"))
      .lpToken
    log(`stETH pool LP Token at ${lpTokenAddress}`)

    await save("TuringSTETHPoolLPToken", {
      abi: (await get("SBTC")).abi, // Generic ERC20 ABI
      address: lpTokenAddress,
    })
  }
}
export default func
func.tags = ["STETHPool"]
func.dependencies = ["SwapUtils", "SwapFlashLoan", "STETHPoolTokens"]
