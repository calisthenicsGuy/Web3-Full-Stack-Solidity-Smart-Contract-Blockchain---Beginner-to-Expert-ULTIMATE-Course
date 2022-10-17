const { network, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");

const BASE_FEE = ethers.utils.parseEther("0.25"); // 0.25 is the premium. It cost 0.25 per request.
const GAS_PRICE_LINK = 1e9; // 1000000000 // link per gas. calculated value base on the gas price of the chain.

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { log, deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  if (developmentChains.includes(network.name)) {
    log("Local network detected! Deploying mocks...");
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args: [BASE_FEE, GAS_PRICE_LINK],
    });
    log("Mocks deployed!");
    log("---------------------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
