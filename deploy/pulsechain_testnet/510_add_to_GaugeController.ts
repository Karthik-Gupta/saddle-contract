import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { MULTISIG_ADDRESSES } from "../../utils/accounts"
import { BIG_NUMBER_1E18 } from "../../test/testUtils"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, getChainId, ethers } = hre
  const { deploy, get, getOrNull, execute, read, log } = deployments
  const { deployer } = await getNamedAccounts()

  // read n_gauge_types
  const n_gauge_types = await read("GaugeController", "n_gauge_types")
  if (n_gauge_types.toNumber() < 1) {
    // add a default gauge type
    await execute(
      "GaugeController",
      { from: deployer, log: true },
      "add_type(string,uint256)",
      "Liquidity",
      BIG_NUMBER_1E18,
    )
  }

  const minterAddress = (await get("Minter")).address

  // TODO: set production initial weight values
  // TODO: add crosschain root gauges
  const newGaugeArr = [
    { lpToken: "PascalUSDPoolLPToken", gaugeType: 0, initialWeight: 5500 },
    { lpToken: "PulseChainUSDPoolLPToken", gaugeType: 0, initialWeight: 8995 },
    { lpToken: "PascalBTCPoolLPToken", gaugeType: 0, initialWeight: 5500 },
    /* { lpToken: "PascalETHPoolLPToken", gaugeType: 0, initialWeight: 5500 }, */
    {
      lpToken: "PascalFRAXMetaPoolLPToken",
      gaugeType: 0,
      initialWeight: 5500,
    },
    {
      lpToken: "PascalFEIMetaPoolLPToken",
      gaugeType: 0,
      initialWeight: 5500,
    },
    {
      lpToken: "PascalCSTMetaPoolLPToken",
      gaugeType: 0,
      initialWeight: 5500,
    },
    {
      lpToken: "PascalPXDCMetaPoolLPToken",
      gaugeType: 0,
      initialWeight: 5500,
    },
    {
      lpToken: "PascalUSDLMetaPoolLPToken",
      gaugeType: 0,
      initialWeight: 5500,
    },
    {
      lpToken: "PascalTBTCMetaPoolLPToken",
      gaugeType: 0,
      initialWeight: 5500,
    },
    {
      lpToken: "PascalBUSDMetaPoolLPToken",
      gaugeType: 0,
      initialWeight: 5500,
    },
    { lpToken: "PulseXPairPSCWPLS", gaugeType: 0, initialWeight: 36000 },
  ]

  for (let i = 0; i < newGaugeArr.length; i++) {
    const newGauge = newGaugeArr[i]
    const lpToken = newGauge.lpToken
    const deploymentName = `LiquidityGaugeV5_${lpToken}`
    const lpTokenAddress = (await get(lpToken)).address

    const gaugeDeploymentResult = await deploy(deploymentName, {
      from: deployer,
      log: true,
      skipIfAlreadyDeployed: true,
      contract: "LiquidityGaugeV5",
      args: [
        lpTokenAddress,
        minterAddress,
        MULTISIG_ADDRESSES[await getChainId()],
      ],
    })

    try {
      // Try reading the gauge type of the newly deployed gauge
      // If this call is reverted, this implies the gauge was not added yet
      await read(
        "GaugeController",
        "gauge_types",
        gaugeDeploymentResult.address,
      )
      log(
        `${deploymentName} was already added to GaugeController. Skipping adding it again.`,
      )
    } catch {
      // The gauge is not yet added to the gauge controller.
      // Add it now.
      await execute(
        "GaugeController",
        { from: deployer, log: true },
        "add_gauge(address,int128,uint256)",
        gaugeDeploymentResult.address,
        newGauge.gaugeType,
        newGauge.initialWeight,
      )
    }
  }
}
export default func
