const { network, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
  INITIAL_SUPPLY,
} = require("../helper-hardhat-config");
const { verify } = require("../helper-functions");

async function main({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const myToken = await ethers.getContract("MyToken", {
    from: deployer,
    args: [INITIAL_SUPPLY],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    const contractAddress = myToken.address;
    verify(contractAddress, [INITIAL_SUPPLY])
  }
}

main();

module.exports.tags = ["all", "token"]