import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { PoolRegistry } from "../../../build/typechain"
import { ZERO_ADDRESS } from "../../../test/testUtils"
import { PoolType } from "../../../utils/constants"
import { IPoolRegistry } from "../../../build/typechain"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre
  const { get, execute, log } = deployments
  const { deployer } = await getNamedAccounts()

  const poolRegistry: PoolRegistry = await ethers.getContract("PoolRegistry")

  const pools: IPoolRegistry.PoolInputDataStruct[] = [
    //base pools
    {
      poolAddress: (await get("PascalEuroPool")).address,
      typeOfAsset: PoolType.OTHERS,
      poolName: ethers.utils.formatBytes32String("PascalEuro"),
      targetAddress: (await get("SwapFlashLoan")).address,
      metaSwapDepositAddress: ZERO_ADDRESS,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
  ]

  await poolRegistry
    .getPoolDataByName(pools[0].poolName)
    .then(async () => {
      log("Removing pools from registry")

      const batchCall = await Promise.all(
        pools.map(
          async (pool) =>
            await poolRegistry.populateTransaction.removePool(pool.poolAddress),
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
    .catch(async () => {
      log("Skipping adding pools to registry because they are already removed")
    })
}
export default func
