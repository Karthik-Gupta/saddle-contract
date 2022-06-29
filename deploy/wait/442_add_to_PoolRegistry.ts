import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { PoolRegistry } from "../../build/typechain"
import { ZERO_ADDRESS } from "../../test/testUtils"
import { PoolType } from "../../utils/constants"
import { IPoolRegistry } from "../../build/typechain/"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre
  const { get, execute, log } = deployments
  const { deployer } = await getNamedAccounts()

  const poolRegistry: PoolRegistry = await ethers.getContract("PoolRegistry")

  await poolRegistry
    .getPoolDataByName(ethers.utils.formatBytes32String("USDPool"))
    .then(() => {
      log("Skipping adding pools to registry because they are already added")
    })
    .catch(async () => {
      log("Adding pools to registry")
      const pools: IPoolRegistry.PoolInputDataStruct[] = [
        {
          // USDv2 pool
          poolAddress: (await get("TuringUSDPoolLPToken")).address,
          typeOfAsset: PoolType.USD,
          poolName: ethers.utils.formatBytes32String("USDPool"),
          targetAddress: (await get("SwapFlashLoan")).address,
          metaSwapDepositAddress: ZERO_ADDRESS,
          isSaddleApproved: true,
          isRemoved: false,
          isGuarded: false,
        },
      ]

      const batchCall = await Promise.all(
        pools.map(
          async (pool) => await poolRegistry.populateTransaction.addPool(pool),
        ),
      )

      const batchCallData = batchCall
        .map((x) => x.data)
        .filter((x): x is string => !!x)

      await execute(
        "PoolRegistry",
        { from: deployer, log: true },
        "batch",
        batchCallData,
        true,
      )
    })
}
export default func
