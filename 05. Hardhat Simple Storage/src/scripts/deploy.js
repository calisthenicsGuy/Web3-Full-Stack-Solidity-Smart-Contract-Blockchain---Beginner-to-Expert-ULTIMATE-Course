// imports
const { ethers, run, network } = require("hardhat");
require("dotenv").config();

// async main function
async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
  console.log("Deploying contract...");
  const simpleStorage = await SimpleStorageFactory.deploy();
  await simpleStorage.deployed();
  console.log(`Deployed contract to: ${simpleStorage.address}`);

  // console.log(network.config);
  if (network.config.chainId == 5 && process.env.ETHERSCAN_API_KEY) {
    await simpleStorage.deployTransaction.wait(6);
    await verify(simpleStorage.address, []);
  }

  const currentValue = await simpleStorage.retrieve();
  console.log(`Current value: ${currentValue}`);

  // Update the currentValue
  const transactionResponse = await simpleStorage.store(5);
  await transactionResponse.wait(1);
  const updatedCurrentValue = await simpleStorage.retrieve();

  // console.log(transactionResponse);
  console.log(`Updated current value is ${updatedCurrentValue}`);

  const transactionResponse1 = await simpleStorage.addPerson(
    "expectedPersonName",
    15
  );
  await transactionResponse1.wait(1);
}

async function verify(contractAddress, args) {
  console.log("Verifying contrcat...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (ex) {
    if (ex.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!");
    } else {
      console.log(ex);
    }
  }
}

// main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
