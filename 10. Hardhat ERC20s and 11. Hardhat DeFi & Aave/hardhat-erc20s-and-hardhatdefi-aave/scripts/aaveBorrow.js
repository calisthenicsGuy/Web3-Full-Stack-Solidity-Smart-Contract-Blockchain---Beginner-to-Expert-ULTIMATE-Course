const { network, ethers } = require("hardhat");
const { applyErrorMessageTemplate } = require("hardhat/internal/core/errors");
const { getWeth, AMOUNT } = require("./getWeth");

async function main({ getNamedAccounts, deployments }) {
  // 1. Deposit
  // 2. Borrow
  // 3. Repay

  const { deployer } = getNamedAccounts();

  await getWeth();

  const lendingPool = await gettingLendingPool(deployer);
  console.log(`LendingPool address: ${lendingPool.address}`);

  const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  await approve(wethTokenAddress, lendingPool.address, AMOUNT, deployer);

  console.log("Depositing...");
  await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0);
  console.log("Deposited!");

  let { availableBorrowsEth, totalDebtEth } = await getBorrowUserData(
    lendingPool,
    account
  );

  const daiPraice = await getDaiPrice();
  const amountDaiToBorrow =
    availableBorrowsEth * 0.95 * (1 / daiPraice.toNumber());
  console.log(`You can borrow ${amountDaiToBorrow} DAI.`);
  const amountToBorrowWei = ethers.utils.parseEther(
    amountDaiToBorrow.toString()
  );

  const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  await borrowDai(daiTokenAddress, lendingPool, amountToBorrowWei, deployer);

  await getBorrowUserData(lendingPool, deployer);

  await repay(amountDaiToBorrow, daiTokenAddress, lendingPool, deployer);
  await getBorrowUserData(lendingPool, deployer);
}

async function gettingLendingPool(account) {
  const contractAddress = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";
  const lendingPoolAddressesProvider = await ethers.getContractAt(
    "ILendingPoolAddressesProvider",
    contractAddress,
    account
  );

  const lendingPoolAddress =
    await lendingPoolAddressesProvider.getLendingPool();

  const lendingPool = await ethers.getContractAt(
    "ILendingPool",
    lendingPoolAddress,
    account
  );

  return lendingPool;
}

async function approve(erc20Address, spenderAddress, amountToSpend, account) {
  const erc20Token = await ethers.getContractAt("IERC20".erc20Address, account);

  const transactionResponse = erc20Address.approve(
    spenderAddress,
    amountToSpend
  );
  transactionResponse.wait(1);

  console.log("Approved!");
}

async function getBorrowUserData(lendingPool, account) {
  const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
    await lendingPool.getUserAccountData(account);

  console.log(`You have ${totalCollateralETH} worth od ETH deposited.`);
  console.log(`You have total ${totalDebtETH} worth of ETH borrowed.`);
  console.log(`You can borrow ${availableBorrowsETH} woth of ETH.`);
  return { totalDebtETH, availableBorrowsETH };
}

async function getDaiPrice() {
  const daiETHPriceFeed = await ethers.getContractAt(
    "AggregatorV3Interface",
    "0x773616E4d11A78F511299002da57A0a94577F1f4"
  );

  const price = (await daiETHPriceFeed.latestRoundData())[1];
  console.log(`The DAI / ETH Price is ${price.toString()}`);

  return price;
}

async function borrowDai(
  daiAddress,
  lendingPool,
  amountDaiToBorrowWei,
  account
) {
  const borrowTx = await lendingPool.borrow(
    daiAddress,
    amountDaiToBorrowWei,
    1,
    0,
    account
  );

  await borrowTx.wait(1);
  console.log(`You just borrowed ${amountDaiToBorrowWei}.`);
}

async function repay(amount, daiAddress, lendingPool, account) {
  await approve(daiAddress, lendingPool.address, amount, account);

  const repayTx = await lendingPool.repay(daiAddress, amount, 1, account);
  await repayTx.wait(1);
  console.log("Repaid");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
