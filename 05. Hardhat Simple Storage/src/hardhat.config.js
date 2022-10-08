require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()
require("@nomiclabs/hardhat-etherscan");
require("./tasks/block-number");
require("hardhat-gas-reporter");
require('solidity-coverage')

/** @type import('hardhat/config').HardhatUserConfig */

const rpcUrl = process.env.GOERLI_RPC_URL;
const account = process.env.GOERLI_PRIVATE_KEY;
const apiKey = process.env.ETHERSCAN_API_KEY;
const counMarketApiKey = process.env.COINMARKETCAP_API_KEY;

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    goerli: {
      url: rpcUrl,
      accounts: [account],
      chainId: 5,
    },
    localhost: {
      url: 'http://127.0.0.1:8545/',
      chainId: 31337,
    }
  },
  solidity: "0.8.7",
  etherscan: {
    apiKey: apiKey
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: counMarketApiKey,
    // token: "MATIC",
  }
};
