const { network } = require('hardhat');
const { developmentChains, DECIMALS, INITIAL_ANSWER } = require('../helper-hardhat-config');

module.exports = async({ getNameAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNameAccounts();
    
    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        });
        log("Mocs deployed!");
        log("----------------------------------------------");
    }
}

module.exports.tags = ["all", "mocks"]