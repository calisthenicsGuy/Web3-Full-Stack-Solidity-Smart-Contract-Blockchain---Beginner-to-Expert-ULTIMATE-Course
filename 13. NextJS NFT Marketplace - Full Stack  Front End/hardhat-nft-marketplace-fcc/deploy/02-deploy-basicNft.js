const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async function ({ deployments, getNamedAccounts }) {
  const { log, deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  //   const WAIT_BLOCK_CONFIRMATIONS = network.config.blockConfirmations
  //     ? network.config.blockConfirmations
  //     : 1;

  const basicNft = await deploy("BasicNft", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  log("----------------------------------------------------");

  const basicNftTwo = await deploy("BasicNftTwo", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.name.blockConfirmations || 1,
  });

  log("----------------------------------------------------");

  const chainId = network.config.chainId;

  if (
    !(chainId == 31337) &&
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(basicNft.address, []);
    await verify(basicNftTwo.address, []);
  }

  log("----------------------------------------------------");
};

module.exports.tags = ["all", "basicnft"];
