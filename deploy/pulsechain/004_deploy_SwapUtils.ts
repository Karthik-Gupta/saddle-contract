import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { isTestNetwork } from "../../utils/network"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, getChainId } = hre
  const { deploy, getOrNull, log } = deployments
  const { libraryDeployer } = await getNamedAccounts()

  if (isTestNetwork(await getChainId())) {
    await deploy("SwapUtils", {
      from: libraryDeployer,
      log: true,
      skipIfAlreadyDeployed: true,
    })
  }

  const swapUtil = await getOrNull("SwapUtils")
  if (swapUtil) {
    log(`reusing "SwapUtils" at ${swapUtil.address}`)
  } else {
    await deploy("SwapUtils", {
      from: libraryDeployer,
      log: true,
      skipIfAlreadyDeployed: true,
    })
  }
}
export default func
func.tags = ["SwapUtils"]
