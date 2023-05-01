import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { MULTISIG_ADDRESSES } from "../utils/accounts"
import { CHAIN_ID } from "../utils/network"
import { BIG_NUMBER_1E18, setTimestamp } from "../test/testUtils"
import {
  GaugeController,
  LiquidityGaugeV5,
  Minter,
  PSC,
} from "../build/typechain"
import { timestampToUTCString } from "../utils/time"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, getChainId, ethers } = hre
  const { deploy, get, getOrNull, execute, read, log } = deployments
  const ERC20ABI = [
    {
      inputs: [
        {
          internalType: "string",
          name: "name_",
          type: "string",
        },
        {
          internalType: "string",
          name: "symbol_",
          type: "string",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "spender",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Approval",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          internalType: "address",
          name: "spender",
          type: "address",
        },
      ],
      name: "allowance",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "spender",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "approve",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "balanceOf",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "decimals",
      outputs: [
        {
          internalType: "uint8",
          name: "",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "spender",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "subtractedValue",
          type: "uint256",
        },
      ],
      name: "decreaseAllowance",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "spender",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "addedValue",
          type: "uint256",
        },
      ],
      name: "increaseAllowance",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "name",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "symbol",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "totalSupply",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "transfer",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "sender",
          type: "address",
        },
        {
          internalType: "address",
          name: "recipient",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "transferFrom",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
  ]

  log(`SEQ: multi sig action kick off`)

  // const PSC_CONTRACT = new web3.eth.Contract(
  //   ERC20ABI,
  //   "0x5B785391Fb04D394364C5230B15cf2026dA1B450",
  // )

  // If we are not on forked mainnet, skip this file
  // if (process.env.FORK_NETWORK !== "mainnet") {
  //   log(`Not running on forked mainnet, skipping...`)
  //   return
  // }

  // Contract name constants
  const PSC_CONTRACT_NAME = "PSC"
  const MINTER_CONTRACT_NAME = "Minter"
  const GAUGECONTROLLER_CONTRACT_NAME = "GaugeController"

  // Time related constants
  const DAY = 86400
  const WEEK = DAY * 7
  const YEAR = WEEK * 52

  // Multisig account is the account that will be used as ownership admin in vepsc contracts.
  const multisigSigner = await ethers.getSigner(
    MULTISIG_ADDRESSES[CHAIN_ID.PULSECHAIN_TESTNET],
  )

  // Get all necessary contracts
  const psc = (await ethers.getContract(PSC_CONTRACT_NAME)) as PSC
  const gaugeController = (await ethers.getContract(
    GAUGECONTROLLER_CONTRACT_NAME,
  )) as GaugeController
  const minter = (await ethers.getContract(MINTER_CONTRACT_NAME)) as Minter

  log(`SEQ: after contracts`, multisigSigner)
  //log(`after the signer >>>>>>>>>>`)
  //log(`failed to connect the contract`)
  //log(`balance `, await psc.connect(multisigSigner))

  /* SEQ 20000 */
  // Enable transfer
  await psc.connect(multisigSigner).enableTransfer()
  log(`SEQ 20000: PSC is now unpaused`)

  /* SEQ 21300 */
  // Send PSC to Minter contract
  // 60_000_000 over 6 months
  await psc
    .connect(multisigSigner)
    .transfer(minter.address, BIG_NUMBER_1E18.mul(10_000_000))
  log(`SEQ 21300: Sent PSC to Minter`)
  console.log("AFTER sending PSC to minter")

  /* SEQ 21400 */
  // Initialize Minter rate and kick off the minter epoch
  // Minter epoch is advanced if possible when new gauges are deployed.
  // If this is the case, we don't need to manually advance the epoch.
  let rewardRate = await minter.rate()
  log(`SEQ 21400: reward rate : ${rewardRate}`)

  // Only manually trigger mining parameters if rate is 0 (uninitialized)
  if (rewardRate.eq(0)) {
    await minter.connect(multisigSigner).update_mining_parameters()
  }
  log(`SEQ 21400: Initialized minter and kicked off reward rate epoch.`)

  rewardRate = await minter.rate()
  const formattedWeeklyRate = ethers.utils.formatUnits(
    rewardRate.mul(WEEK).toString(),
    18,
  )
  log(`Weekly PSC distribution rate via Minter: ${formattedWeeklyRate}`)

  // Call checkpoint in case we need to manually advance the epoch
  await gaugeController.checkpoint()

  // Future epoch's timestamp.
  const gaugeStartTime = await gaugeController.time_total()
  const minterStartTime = await minter.start_epoch_time()

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

  log(
    `GaugeController: The intial weights will kick in @ ${gaugeStartTime} (${timestampToUTCString(
      gaugeStartTime,
    )})`,
  )
  log(
    `Minter: rate epoch started at @ ${minterStartTime} (${timestampToUTCString(
      minterStartTime,
    )}). New rates can be applied every 2 weeks from the start timestamp.`,
  )
  log(`All SEQ 2 multisig actions completed! \n`)

  // Advance the epoch to next timestamp when intial weights kick in
  // Uncomment below line if you want to see the intial weights applied
  await setTimestamp(gaugeStartTime.toNumber())
}

// Always skip this deploy script
//func.skip = async () => true
export default func
