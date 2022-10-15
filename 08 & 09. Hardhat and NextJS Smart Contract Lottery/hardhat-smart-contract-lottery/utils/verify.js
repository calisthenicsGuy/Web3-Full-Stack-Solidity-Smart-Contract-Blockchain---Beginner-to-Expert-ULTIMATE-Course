const { run } = require("hardhat");

const verify = async (contrcatAddress, args) => {
    console.log("Verifying contract...");

    try {
        await run("verify:verify", {
            address: contrcatAddress,
            constructorArguments: args
        });
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("Contract is already verified!");
        } else {
            console.log(error.message);
        }
    }
}

module.export = { verify };