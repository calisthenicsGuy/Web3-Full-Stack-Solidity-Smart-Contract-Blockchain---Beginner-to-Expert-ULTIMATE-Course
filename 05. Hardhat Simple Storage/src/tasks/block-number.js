const { task } = require('hardhat/config')

task("block-number", "Print the current block number.").setAction(
    async (taskArgs, hre) => {
        const blockNumber = await hre.ethers.provider.getBlockNumber();
        console.log(`Block number: ${blockNumber}`);
    }
)

module.exports = {}