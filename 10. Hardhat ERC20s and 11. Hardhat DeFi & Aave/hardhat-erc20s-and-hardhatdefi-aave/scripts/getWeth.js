const { getNamedAccounts, deployments, ethers } = require("hardhat");

const AMOUNT = ethers.utils.parseEther("0.02");

async function getWeth() {
  const { deployer } = getNamedAccounts;

  const contractAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const iWeth = await ethers.getContractAt("IWeth", contractAddress, deployer);
  const transactionResponse = await iWeth.deposit({ value: AMOUNT });
  await transactionResponse.wait(1);

  const wethBalance = await iweth.balanceOf(deployer);

  console.log(`Got ${wethBalance.toString()} WETH.`);

}

module.exports = { getWeth, AMOUNT };
