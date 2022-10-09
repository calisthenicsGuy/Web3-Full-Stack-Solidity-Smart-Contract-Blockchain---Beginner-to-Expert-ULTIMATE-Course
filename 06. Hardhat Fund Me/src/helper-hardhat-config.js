const networkConfig = {
  5: {
    name: "goerli",
    priceFeedAddress: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
  1: {
    name: "mainnet",
    priceFeedAddress: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  },
  11155111: {
    name: "sepolia",
    priceFeedAddress: "",
  },
  2018: {
    name: "dev",
    priceFeedAddress: "",
  },
  61: {
    name: "classic",
    priceFeedAddress: "",
  },
  63: {
    name: "mordor",
    priceFeedAddress: "",
  },
};

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER
};
