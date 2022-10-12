const { network } = require("hardhat");

module.exports = async function ({ getNameAccounts, deployments}) {
    const { deploy, log } = deployments;
    const { deployer } = getNameAccounts();

    const raffle = await deploy("Raffle", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    
};
