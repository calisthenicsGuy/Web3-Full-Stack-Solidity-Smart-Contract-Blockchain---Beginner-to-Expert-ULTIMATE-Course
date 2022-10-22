const { network, ethers } = require("hardhat");
require("dotenv").config();
const fs = require("fs");

const frontendContractFiles = "../../constants/networkMapping.json";

module.exports = async function () {
  if (process.env.UPDATE_FRONT_END) {
    console.log("Writing to front end...");
    await updateContractAddresses();
    await updateAbi();
    console.log("Front end written!");
  }
};

async function updateContractAddresses() {
  const nftMarketplace = await ethers.getContract("NftMarketplace");
  const chainId = network.config.chainId.toString();

  const contractAddresses = JSON.parse(
    fs.readFileSync(frontendContractFiles, "utf-8")
  );

  if (chainId in contractAddresses) {
    if (
      !contractAddresses[chainId]["NftMarketplace"].includes(
        nftMarketplace.address
      )
    );
    contractAddresses[chainId]["NftMarketplace"].push(nftMarketplace.address);
  } else {
    contractAddresses[chainId] = { NftMarketplace: [nftMarketplace.address] };
  }

  fs.writeSync(frontendContractFiles, JSON.stringify(contractAddresses));
}

async function updateAbi() {}

module.exports.tags = ["all", "frontend"];
