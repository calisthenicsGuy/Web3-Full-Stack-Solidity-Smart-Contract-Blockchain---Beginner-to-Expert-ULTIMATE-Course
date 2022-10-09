const { run } = require("hardhat");

async function verify(contractAddress, consrtructorArgs) {
  try {
    await run("verify:verify", {
      address: contractAddress,
      consrtructorArguments: consrtructorArgs,
    });
  } catch (ex) {
    if (ex.message.toLowerCase().inclides("already verified")) {
      console.log("Already Verified!");
    } else {
      console.log(ex);
    }
  }
}

module.exports = {
  verify,
};
