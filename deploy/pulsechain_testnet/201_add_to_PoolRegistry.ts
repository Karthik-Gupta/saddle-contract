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
      poolAddress: (await get("PascalUSDPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("PascalUSD"),
      targetAddress: (await get("SwapFlashLoan")).address,
      metaSwapDepositAddress: ZERO_ADDRESS,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    {
      poolAddress: (await get("PulseChainUSDPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("PulseChainUSD"),
      targetAddress: (await get("SwapFlashLoan")).address,
      metaSwapDepositAddress: ZERO_ADDRESS,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    {
      poolAddress: (await get("PascalBTCPool")).address,
      typeOfAsset: PoolType.BTC,
      poolName: ethers.utils.formatBytes32String("PascalBTC"),
      targetAddress: (await get("SwapFlashLoan")).address,
      metaSwapDepositAddress: ZERO_ADDRESS,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    {
      poolAddress: (await get("PascalETHPool")).address,
      typeOfAsset: PoolType.ETH,
      poolName: ethers.utils.formatBytes32String("PascalETH"),
      targetAddress: (await get("SwapFlashLoan")).address,
      metaSwapDepositAddress: ZERO_ADDRESS,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
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
    //meta pool
    {
      poolAddress: (await get("PascalFRAXMetaPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("PascalFrax-USD"),
      targetAddress: (await get("PascalFRAXMetaPool")).address,
      metaSwapDepositAddress: (await get("PascalFRAXMetaPoolDeposit")).address,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    {
      poolAddress: (await get("PascalFEIMetaPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("PascalFEI-USD"),
      targetAddress: (await get("PascalFEIMetaPool")).address,
      metaSwapDepositAddress: (await get("PascalFEIMetaPoolDeposit")).address,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    {
      poolAddress: (await get("PascalCSTMetaPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("PascalCST-USD"),
      targetAddress: (await get("PascalCSTMetaPool")).address,
      metaSwapDepositAddress: (await get("PascalCSTMetaPoolDeposit")).address,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    {
      poolAddress: (await get("PascalPWCMetaPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("PascalPWC-USD"),
      targetAddress: (await get("PascalPWCMetaPool")).address,
      metaSwapDepositAddress: (await get("PascalPWCMetaPoolDeposit")).address,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    {
      poolAddress: (await get("PascalUSDLMetaPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("PascalUSDL-USD"),
      targetAddress: (await get("PascalUSDLMetaPool")).address,
      metaSwapDepositAddress: (await get("PascalUSDLMetaPoolDeposit")).address,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    {
      poolAddress: (await get("PascalTBTCMetaPool")).address,
      typeOfAsset: PoolType.BTC,
      poolName: ethers.utils.formatBytes32String("PascalTBTC-BTC"),
      targetAddress: (await get("PascalTBTCMetaPool")).address,
      metaSwapDepositAddress: (await get("PascalTBTCMetaPoolDeposit")).address,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    {
      poolAddress: (await get("PascalBUSDMetaPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("PascalBUSD-USD"),
      targetAddress: (await get("PascalBUSDMetaPool")).address,
      metaSwapDepositAddress: (await get("PascalBUSDMetaPoolDeposit")).address,
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
