import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { isTestNetwork } from "../../utils/network"
import { BigNumber } from "ethers"

const TOKENS_ARGS: { [token: string]: any[] } = {
  EURS: ["Stasis EURO", "EURS", "2"],
  EURT: ["Euro Tether", "EURT", "6"],
  EUROC: ["Euro Coin", "EUROC", "6"],
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, getChainId } = hre
  const { deploy, execute } = deployments
  const { deployer } = await getNamedAccounts()

  for (const token in TOKENS_ARGS) {
    await deploy(token, {
      from: deployer,
      log: true,
      contract: "GenericERC20",
      args: TOKENS_ARGS[token],
      skipIfAlreadyDeployed: true,
    })
    // If it's on hardhat, mint test tokens
    /* if (isTestNetwork(await getChainId())) {
      const decimals = TOKENS_ARGS[token][2]
      await execute(
        token,
        { from: deployer, log: true },
        "mint",
        deployer,
        BigNumber.from(10).pow(decimals).mul(100000000),
      )
    } */
  }
}
export default func
func.tags = ["EURPoolTokens"]
