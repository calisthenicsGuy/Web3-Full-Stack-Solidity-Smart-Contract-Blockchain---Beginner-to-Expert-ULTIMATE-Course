const { network, ethers, getNamedAccounts, deployments } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");

const { assert } = require("chai");

!developmentChains.inludes(network.name)
  ? describe.skip
  : describe("Dynamic Svg Nft Tests", () => {});
