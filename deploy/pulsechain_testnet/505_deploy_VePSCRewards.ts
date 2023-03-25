import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { MULTISIG_ADDRESSES } from "../../utils/accounts"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, getChainId, ethers } = hre
  const { deploy, get, getOrNull, execute, read, log } = deployments
  const { deployer } = await getNamedAccounts()

  await deploy("VePSCRewards", {
    from: deployer,
    log: true,
    skipIfAlreadyDeployed: true,
    args: [
      (await get("VotingEscrow")).address,
      (await get("PSC")).address,
      MULTISIG_ADDRESSES[await getChainId()], // admin
    ],
  })

  // Set vePSC.reward_pool to the deployed VePSCRewards contract
  const currentRewardPool = await read("VotingEscrow", "reward_pool")
  if (currentRewardPool === ethers.constants.AddressZero) {
    await execute(
      "VotingEscrow",
      { from: deployer, log: true },
      "set_reward_pool",
      (
        await get("VePSCRewards")
      ).address, // ownership admin
    )
  }
}
export default func
func.tags = ["vePSC"]
