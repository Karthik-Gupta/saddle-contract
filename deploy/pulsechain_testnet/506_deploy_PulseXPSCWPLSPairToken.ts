import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
//import { BIG_NUMBER_1E18 } from "../../test/testUtils"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, getChainId, ethers } = hre
  const { deploy, get, getOrNull, execute, read, log } = deployments
  const { deployer } = await getNamedAccounts()

  await deploy("PulseXPairPSCWPLS", {
    from: deployer,
    log: true,
    skipIfAlreadyDeployed: true,
    args: ["PulseX LP Token", "PLP", 18],
    contract: "GenericERC20NoOwnerFunction",
  })

  /* await execute(
    "PulseXPairPSCWPLS",
    {
      from: deployer,
      log: true,
    },
    "mint",
    deployer,
    BIG_NUMBER_1E18.mul(1000),
  ) */
}
export default func
func.tags = ["vePSC"]
