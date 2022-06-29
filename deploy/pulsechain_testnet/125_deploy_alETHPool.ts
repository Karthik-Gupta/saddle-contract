import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { execute, get, getOrNull, log, read, save, deploy } = deployments
  const { deployer } = await getNamedAccounts()

  // Constructor arguments
  const TOKEN_ADDRESSES = [
    (await get("WETH")).address,
    (await get("ALETH")).address,
    (await get("SETH")).address,
  ]
  const TOKEN_DECIMALS = [18, 18, 18]
  const LP_TOKEN_NAME = "Turing WETH/alETH/sETH"
  const LP_TOKEN_SYMBOL = "turingalETH"
  const INITIAL_A = 60
  const SWAP_FEE = 4e6 // 4bps
  const ADMIN_FEE = 0

  const poolDeployment = await getOrNull("TuringALETHPool")
  if (poolDeployment) {
    log(`reusing TuringALETHPool at ${poolDeployment.address}`)
  } else {
    await deploy("TuringALETHPool", {
      from: deployer,
      log: true,
      contract: "SwapFlashLoan",
      libraries: {
        SwapUtils: (await get("SwapUtils")).address,
        AmplificationUtils: (await get("AmplificationUtils")).address,
      },
      skipIfAlreadyDeployed: true,
    })
    const receipt = await execute(
      "TuringALETHPool",
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

    const lpTokenAddress = (await read("TuringALETHPool", "swapStorage"))
      .lpToken
    log(`alETH pool LP Token at ${lpTokenAddress}`)

    await save("TuringALETHPoolLPToken", {
      abi: (await get("SBTC")).abi, // Generic ERC20 ABI
      address: lpTokenAddress,
    })
  }
}
export default func
func.tags = ["ALETHPool"]
func.dependencies = ["SwapUtils", "SwapFlashLoan", "ALETHPoolTokens"]
