const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const fs = require("fs");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  let ethUsdPriceFeedAddress;

  if (developmentChains.includes(network.name)) {
    // Find ETH/USD price feed
    const EthUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = EthUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = network.config[chainId].ethUsdPriceFeed;
  }

  const lowSVG = fs.readFileSync("./images/dynamicNft/frown.svg", {
    encoding: "utf8",
  });
  const highSVG = fs.readFileSync("./images/dynamicNft/happy.svg", {
    encoding: "utf8",
  });

  const args = [, lowSVG, highSVG];
  const dynamicSvgNft = await deploy("DynamicSvgNft", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(dynamicSvgNft.address, args);
  }
};

module.exports.tags = ["all", "dynamicsvg", "main"];
