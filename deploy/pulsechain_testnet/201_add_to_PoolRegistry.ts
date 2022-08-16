import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { PoolRegistry } from "../../build/typechain"
import { ZERO_ADDRESS } from "../../test/testUtils"
import { PoolType } from "../../utils/constants"
import { IPoolRegistry } from "../../build/typechain"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre
  const { get, execute, log } = deployments
  const { deployer } = await getNamedAccounts()

  const poolRegistry: PoolRegistry = await ethers.getContract("PoolRegistry")

  const pools: IPoolRegistry.PoolInputDataStruct[] = [
    //base pools
    {
      poolAddress: (await get("TuringUSDPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("TuringUSD"),
      targetAddress: (await get("SwapFlashLoan")).address,
      metaSwapDepositAddress: ZERO_ADDRESS,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    {
      poolAddress: (await get("TuringD4Pool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("TuringD4"),
      targetAddress: (await get("SwapFlashLoan")).address,
      metaSwapDepositAddress: ZERO_ADDRESS,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    {
      poolAddress: (await get("TuringBTCPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("TuringWRenSBTC"),
      targetAddress: (await get("SwapFlashLoan")).address,
      metaSwapDepositAddress: ZERO_ADDRESS,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    {
      poolAddress: (await get("TuringSTETHPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("TuringSTETH"),
      targetAddress: (await get("SwapFlashLoan")).address,
      metaSwapDepositAddress: ZERO_ADDRESS,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    {
      poolAddress: (await get("TuringRETHPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("TuringRETH"),
      targetAddress: (await get("SwapFlashLoan")).address,
      metaSwapDepositAddress: ZERO_ADDRESS,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    {
      poolAddress: (await get("TuringALETHPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("TuringalETH"),
      targetAddress: (await get("SwapFlashLoan")).address,
      metaSwapDepositAddress: ZERO_ADDRESS,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    {
      poolAddress: (await get("TuringEURPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("TuringEUR"),
      targetAddress: (await get("SwapFlashLoan")).address,
      metaSwapDepositAddress: ZERO_ADDRESS,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    //meta pool
    {
      poolAddress: (await get("TuringFRAXMetaPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("TuringFrax-USD"),
      targetAddress: (await get("TuringFRAXMetaPool")).address,
      metaSwapDepositAddress: (await get("TuringFRAXMetaPoolDeposit")).address,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    {
      poolAddress: (await get("TuringMIMMetaPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("TuringMIM-USD"),
      targetAddress: (await get("TuringMIMMetaPool")).address,
      metaSwapDepositAddress: (await get("TuringMIMMetaPoolDeposit")).address,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    {
      poolAddress: (await get("TuringSUSDMetaPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("TuringSUSD-USD"),
      targetAddress: (await get("TuringSUSDMetaPool")).address,
      metaSwapDepositAddress: (await get("TuringSUSDMetaPoolDeposit")).address,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    {
      poolAddress: (await get("TuringFEIMetaPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("TuringFEI-USD"),
      targetAddress: (await get("TuringFEIMetaPool")).address,
      metaSwapDepositAddress: (await get("TuringFEIMetaPoolDeposit")).address,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    {
      poolAddress: (await get("TuringALUSDMetaPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("TuringALUSD-USD"),
      targetAddress: (await get("TuringALUSDMetaPool")).address,
      metaSwapDepositAddress: (await get("TuringALUSDMetaPoolDeposit")).address,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    {
      poolAddress: (await get("TuringTUSDMetaPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("TuringTUSD-USD"),
      targetAddress: (await get("TuringTUSDMetaPool")).address,
      metaSwapDepositAddress: (await get("TuringTUSDMetaPoolDeposit")).address,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    {
      poolAddress: (await get("TuringUSDLMetaPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("TuringUSDL-USD"),
      targetAddress: (await get("TuringUSDLMetaPool")).address,
      metaSwapDepositAddress: (await get("TuringUSDLMetaPoolDeposit")).address,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    {
      poolAddress: (await get("TuringTBTCMetaPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("TuringTBTC-BTC"),
      targetAddress: (await get("TuringTBTCMetaPool")).address,
      metaSwapDepositAddress: (await get("TuringTBTCMetaPoolDeposit")).address,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    {
      poolAddress: (await get("TuringBUSDMetaPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("TuringBUSD-USD"),
      targetAddress: (await get("TuringBUSDMetaPool")).address,
      metaSwapDepositAddress: (await get("TuringBUSDMetaPoolDeposit")).address,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
  ]

  await poolRegistry
    .getPoolDataByName(pools[0].poolName)
    .then(() => {
      log("Skipping adding pools to registry because they are already added")
    })
    .catch(async () => {
      log("Adding pools to registry")

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
