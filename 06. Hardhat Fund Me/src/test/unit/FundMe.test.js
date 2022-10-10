const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");

describe("FundMe", function () {
  let fundMe;
  let deployer;
  let mockV3Aggregator;
  const sendValue = ethers.utils.parseEther("1");
  beforeEach(async () => {
    // const accounts = await ethers.getSigners();;
    // const accountZero = accounts[0];
    // const { deployer } = getNamedAccounts;
    deployer = await getNamedAccounts().deployer;
    await deployments.fixture(["all"]);
    fundMe = ethers.getContract("FundMe");
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });

  describe("constructor", async function () {
    it("sets the aggregator addresses correctly", async () => {
      const response = await fundMe.getPriceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });

  describe("fund", async function () {
    it("fails if we don't send enough ETH", async () => {
      await expect(fundMe.fund()).to.be.revertedWith(
        "You need to spend more ETH!"
      );
    });

    it("update the amount funded data structure", async () => {
      await fundMe.fund({ value: sendValue });

      const response = await fundMe.getAddressToAmountFunded(deployer);
      assert.equal(response.toString(), sendValue.toString());
    });

    it("add funder to array of getFunder", async () => {
      await fundMe.fund({ value: sendValue });
      const funderZero = await fundMe.getFunder(0);

      assert.equal(funderZero, deployer);
    });
  });

  describe("withdraw", async function () {
    beforeEach(async function () {
      await fundMe.fund({ value: sendValue });
    });

    it("withdraw ETH from a sungle founder", async () => {
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCoast = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCoast).toString()
      );
    });

    it("is allows us to withdraw with multiple funders", async () => {
      const accounts = await ethers.getSigners();
      for (i = 1; i < 6; i++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[i]);
        await fundMeConnectedContract.fund({ value: sendValue });
      }

      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );
      
      const transactionResponse = await fundMe.withdraw();
      
      const transactionReceipt = await transactionResponse.wait();
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const withdrawGasCost = gasUsed.mul(effectiveGasPrice);
      console.log(`GasCost: ${withdrawGasCost}`);
      console.log(`GasUsed: ${gasUsed}`);
      console.log(`GasPrice: ${effectiveGasPrice}`);
      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);
      
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(withdrawGasCost).toString()
      );
      
      await expect(fundMe.getFunder(0)).to.be.reverted;

      for (i = 1; i < 6; i++) {
        assert.equal(
          await fundMe.getAddressToAmountFunded(accounts[i].address),
          0
        );
      }
    });
    it("Only allows the owner to withdraw", async function () {
      const accounts = await ethers.getSigners();
      const fundMeConnectedContract = await fundMe.connect(accounts[1]);
      await expect(fundMeConnectedContract.withdraw()).to.be.revertedWith(
        "FundMe__NotOwner"
      );
    });
  });
});
