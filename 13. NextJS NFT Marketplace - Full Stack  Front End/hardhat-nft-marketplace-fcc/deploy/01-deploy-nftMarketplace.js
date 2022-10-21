const { network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
require("dotenv");

module.exports = async function ({ deployments, getNamedAccounts }) {
  const { log, deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  log("----------------------------------------------------");

  const args = [];

  const nftMarketplace = await deploy("NftMarketplace", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  log("----------------------------------------------------");

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(nftMarketplace.address, args);
  }

  log("----------------------------------------------------");
};

module.exports.tags = ["all", "nftmarketplace"];
