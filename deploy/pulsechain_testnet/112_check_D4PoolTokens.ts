import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { isTestNetwork } from "../../utils/network"
import { BigNumber } from "ethers"

const USD_TOKENS_ARGS: { [token: string]: any[] } = {
  ALUSD: ["Alchemix USD", "alUSD", "18"],
  FEI: ["Fei Protocol", "FEI", "18"],
  FRAX: ["Frax", "FRAX", "18"],
  MIM: ["Magic Internet Money", "MIM", "18"],
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, getChainId } = hre
  const { deploy, execute, getOrNull, log } = deployments
  const { deployer } = await getNamedAccounts()

  for (const token in USD_TOKENS_ARGS) {
    const token_contracts = await getOrNull(token)
    if (!token_contracts) {
      await deploy(token, {
        from: deployer,
        log: true,
        contract: "GenericERC20",
        args: USD_TOKENS_ARGS[token],
        skipIfAlreadyDeployed: true,
      })
      // If it's on hardhat, mint test tokens
      if (isTestNetwork(await getChainId())) {
        const decimals = USD_TOKENS_ARGS[token][2]
        await execute(
          token,
          { from: deployer, log: true },
          "mint",
          deployer,
          BigNumber.from(10).pow(decimals).mul(1000000),
        )
      }
    } else {
      log(`reusing ${token} at ${token_contracts.address}`)
    }
  }
}
export default func
func.tags = ["D4PoolTokens"]
