require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-solhint");
require("@nomiclabs/hardhat-ethers");
require("@chainlink/contracts");
require('hardhat-deploy');
require("dotenv").config;

/** @type import('hardhat/config').HardhatUserConfig */

const rpcUrl = process.env.GOERLI_RPC_URL;
const account = process.env.GOERLI_PRIVATE_KEY;
const apiKey = process.env.ETHERSCAN_API_KEY;
const counMarketApiKey = process.env.COINMARKETCAP_API_KEY;

module.exports = {
  solidity: {
    compilers: [{version: "0.8.7"}, {version: "0.6.0"}],
  },
  defaultNetwork: "hardhat",
  networks: {
    goerli: {
      url: rpcUrl,
      accounts: [account],
      chainId: 5,
      blockConfirmations: 6,
    },
    localhost: {
      url: 'http://127.0.0.1:8545/',
      chainId: 31337,
    }
  },
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
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 1,
    }
  }
};
