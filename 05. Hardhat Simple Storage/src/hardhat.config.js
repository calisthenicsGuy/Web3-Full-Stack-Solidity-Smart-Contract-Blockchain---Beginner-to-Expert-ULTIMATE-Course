require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/8YWLCZAtENKvi_a1cHXQoZDIiyyhxkXI",
      accounts: ['fa1ab72dcbd6dfd1f4be5f9a51e70f621f7b088a27b5e6fe688573c59a5fa45b'],
      chainId: 5,
    },
  },
  solidity: "0.8.7",
};
