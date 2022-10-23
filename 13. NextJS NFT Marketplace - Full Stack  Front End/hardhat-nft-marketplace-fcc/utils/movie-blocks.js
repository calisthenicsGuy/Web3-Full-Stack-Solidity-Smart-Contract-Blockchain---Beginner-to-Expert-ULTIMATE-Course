import { network } from "hardhat";

function sleep(tiimeInMs) {
  return new Promise((resolve) => setTimeout(resolve, tiimeInMs));
}

async function movieBlocks(amount, sleepAmount = 0) {
  console.log("Moving blocks...");

  for (let index = 0; index < amount; index++) {
    await network.provider.request({
      method: "evm_mine",
      params: [],
    });

    if (sleepAmount) {
      console.log(`Sleeping for ${sleepAmount}`);
      sleep(sleepAmount);
    }
  }
}

module.exports = {
  sleep,
  movieBlocks,
};
