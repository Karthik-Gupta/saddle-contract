import {
  GaugeController,
  LiquidityGaugeV5,
  IPoolRegistry,
  Minter,
  PoolRegistry,
  PSC,
} from "../build/typechain"

import { ethers } from "hardhat"
import { timestampToUTCString } from "../utils/time"
import { BIG_NUMBER_1E18, ZERO_ADDRESS } from "../test/testUtils"
import { MULTISIG_ADDRESSES } from "../utils/accounts"
import { CHAIN_ID } from "../utils/network"
import { PoolType } from "../utils/constants"

// Time related constants
const DAY = 86400
const WEEK = DAY * 7
const YEAR = WEEK * 52

async function main() {
  // at index 0 is hardhat deployer address
  // on localhost network, we use this address as admins for most contracts
  console.log("logging")

  const psc = (await ethers.getContract("PSC")) as PSC
  const minter = (await ethers.getContract("Minter")) as Minter
  const gaugeController = (await ethers.getContract(
    "GaugeController",
  )) as GaugeController
  const poolReg = (await ethers.getContract("PoolRegistry")) as PoolRegistry

  /*
  console.log("psc paused : ", await psc.paused())

  let rewardRate = await minter.rate()
  if (rewardRate.eq(0)) {
    await minter.update_mining_parameters()
    console.log("mining param updated", rewardRate)
  }

  rewardRate = await minter.rate()
  const formattedWeeklyRate = ethers.utils.formatUnits(
    rewardRate.mul(WEEK).toString(),
    18,
  )
  console.log("Weekly PSC distribution rate via Minter:", formattedWeeklyRate)

  // Call checkpoint in case we need to manually advance the epoch
  await gaugeController.checkpoint()

  const gaugeStartTime = await gaugeController.time_total()
  const minterStartTime = await minter.start_epoch_time()
  console.log("after gauge start time: ", gaugeStartTime.toString())
  console.log("after minster start time: ", minterStartTime.toString())

  // Print relative weights of each gauge at the start of the next epoch
  const numberOfGauges = (await gaugeController.n_gauges()).toNumber()
  const gauges: { name: string; address: string; relativeWeight: string }[] = []
  for (let i = 0; i < numberOfGauges; i++) {
    const address = await gaugeController.gauges(i)
    const gaugeContract = (await ethers.getContractAt(
      "LiquidityGaugeV5",
      address,
    )) as LiquidityGaugeV5

    let name: string
    try {
      name = await gaugeContract.name()
    } catch (e) {
      // In case of root gauges, they don't have a name.
      name = address
    }

    const relativeWeight = await gaugeController[
      "gauge_relative_weight(address,uint256)"
    ](address, gaugeStartTime)

    gauges.push({
      name,
      address,
      relativeWeight: relativeWeight.toString(),
    })
  }

  console.table(gauges)

  console.log(
    "GaugeController: The intial weights will kick in @ ",
    gaugeStartTime,
    "(",
    timestampToUTCString(gaugeStartTime),
    ")",
  )
  console.log(
    "Minter: rate epoch started at @ ",
    minterStartTime,
    "(",
    timestampToUTCString(minterStartTime),
    ")",
    ". New rates can be applied every 2 weeks from the start timestamp.",
  )
  console.log("All SEQ 2 multisig actions completed! \n")

  // Advance the epoch to next timestamp when intial weights kick in
  // Uncomment below line if you want to see the intial weights applied
  // await setTimestamp(gaugeStartTime.toNumber())
  */

  // Multisig account is the account that will be used as ownership admin in vepsc contracts.
  const multisigSigner = await ethers.getSigner(
    MULTISIG_ADDRESSES[CHAIN_ID.PULSECHAIN_TESTNET],
  )

  /*
  // Send PSC to Minter contract
  // 60_000_000 over 6 months
  await psc
    .connect(multisigSigner)
    .transfer(minter.address, BIG_NUMBER_1E18.mul(10_000_000))
  console.log(`SEQ 21300: Sent PSC to Minter`)
  console.log("AFTER sending PSC to minter")
  */

  const pools: IPoolRegistry.PoolInputDataStruct[] = [
    //base pools
    {
      poolAddress: (await ethers.getContract("PulseChainUSDPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("PulseChainUSD"),
      targetAddress: (await ethers.getContract("SwapFlashLoan")).address,
      metaSwapDepositAddress: ZERO_ADDRESS,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    {
      poolAddress: (await ethers.getContract("PascalPXDCMetaPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("PascalPXDC-USD"),
      targetAddress: (await ethers.getContract("PascalPXDCMetaPool")).address,
      metaSwapDepositAddress: (
        await ethers.getContract("PascalPXDCMetaPoolDeposit")
      ).address,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
    {
      poolAddress: (await ethers.getContract("PascalUSDLMetaPool")).address,
      typeOfAsset: PoolType.USD,
      poolName: ethers.utils.formatBytes32String("PascalUSDL-USD"),
      targetAddress: (await ethers.getContract("PascalUSDLMetaPool")).address,
      metaSwapDepositAddress: (
        await ethers.getContract("PascalUSDLMetaPoolDeposit")
      ).address,
      isSaddleApproved: true,
      isRemoved: false,
      isGuarded: false,
    },
  ]

  await pools.forEach((pool) => {
    poolReg.connect(multisigSigner).addPool(pool)
  })

  // writing to contract directly using adPool()
  // base pool
  // ["0xC070B77966a58F17E1ce3ca5210b174AE4CE094c",2,"0x50756c7365436861696e55534400000000000000000000000000000000000000","0x0bea00cb5d14f5a808aeee571c84b499a62e6930","0x0000000000000000000000000000000000000000",true,false,false]
  // meta pool
  // ["0x0466Cb515Ec65fdbBcD1492316dB977dE9FBE8A4",2,"0x50617363616c505844432d555344000000000000000000000000000000000000","0x0466Cb515Ec65fdbBcD1492316dB977dE9FBE8A4,0x103e491044b416d9eceA90C58778b20f66237add",true,false,false]
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
