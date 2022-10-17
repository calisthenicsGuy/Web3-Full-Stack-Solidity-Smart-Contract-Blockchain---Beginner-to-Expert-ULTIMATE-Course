const { network, ethers, getNamedAccounts, deployments } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");

const { assert } = require("chai");

!developmentChains.inludes(network.name)
  ? describe.skip
  : describe("Random Ipfs Nft Tests", () => {
      let randomIpfsNft,
        randomIpfsNftSuscriptionId,
        randomIpfsNftGasLane,
        randomIpfsNftCallbackGasLimit,
        randomIpfsNftTokenUris,
        randomIpfsNftMintFee;
      randomIpfsMftTokenCounter;

      let vrfCoordinatorV2Mock;

      let deployer, accounts;

      beforEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        accounts = await ethers.getSigners();

        randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
        randomIpfsNftSuscriptionId = await getSuscriptionId();
        randomIpfsNftGasLane = await getGasLane();
        randomIpfsNftCallbackGasLimit = await getCallbackGasLimit();
        randomIpfsNftTokenUris = await getTokenUris();
        randomIpfsNftMintFee = await getMintFee();
        randomIpfsMftTokenCounter = await randomIpfsNft.getTokenCounter();

        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
      });

      describe("constructor", () => {
        it("initialize variables correctly", async () => {
          const expectedSuscriptionId = networkConfig[chainId].subscriptionId;
          const expectedGasLane = networkConfig[chainId].gasLane;
          const expectedCallbackGasLimit =
            networkConfig[chainId].callbackGasLimit;
          const expectedMintFee = networkConfig[chainId].mintFee;

          const tokenUriOnIndexZero = await randomIpfsNft.getDogTokenUris(0);

          assert.equal(
            randomIpfsNftSuscriptionId.toString(),
            expectedSuscriptionId.toString()
          );
          assert.equal(
            randomIpfsNftGasLane.toString(),
            expectedGasLane.toString()
          );
          assert.equal(
            randomIpfsNftCallbackGasLimit.toString(),
            expectedCallbackGasLimit.toString()
          );
          assert.equal(
            randomIpfsNftMintFee.toString(),
            expectedMintFee.toString()
          );
          assert.equal(randomIpfsMftTokenCounter.toString(), "0");
        });
        assert(tokenUriOnIndexZero.inclides("ipfs://"));
      });

      describe("requestNft tests", () => {
        it("should revert if value is lower than mint fee", async () => {
          await assert
            .expect(
              randomIpfsNft.requestNft({
                value: randomIpfsNftMintFee.subtract(
                  randomIpfsNftMintFee.subtract(1)
                ),
              })
            )
            .to.be.revertedWith("RandomIpfsNft__NeedMoreETHSend");
        });

        it("set sender correctly", async () => {
          const txResponse = await randomIpfsNft.requestNft({
            value: randomIpfsNftMintFee,
          });

          const transactionReceipt = await txResponse.wait(1);
          const actualSender = await transactionReceipt.events[0].args
            .requester;
          const actualRequestId = await transactionReceipt.events[0].args
            .requestId;

          const requesterToRequestId = await randomIpfsNft.s_requestIdToSender(
            requestId
          );

          assert(actualRequestId.toNumber() > 0);
          assert.equal(deployer.address, actualSender.address);
          assert(requesterToRequestId.address == actualSender.address);
        });
      });

      describe("fulfillRandomWords tests", () => {
        beforEach(async () => {
          const txRequestIpfsNftResponse = await randomIpfsNft.requestNft({
            value: randomIpfsNftMintFee,
          });
          await txRequestIpfsNftResponse.wait(1);
        });

        it("set dogBreed, dogOwner and rokenCounter should be increased", async () => {
          const txFulfillRandomWordsResponse =
            await randomIpfsNft.fulfillRandomWords(0, randomIpfsNft.address);
          const txFulfillRandomWordsReceipt =
            await txFulfillRandomWordsResponse.wait(1);

          const dogBreed = txFulfillRandomWordsReceipt.events[0].args.dogBreed;
          const dogOwner = txFulfillRandomWordsReceipt.events[0].args.dogOwner;

          const tokenCounterAfterTransaction =
            await randomIpfsNft.getTokenCounter();

          assert(dogBreed.toString() != null);
          assert.equal(dogOwner.address, deployer.address);
          assert.equal(tokenCounterAfterTransaction.toString(), "1");
        });
      });

      describe("withdraw tests", () => {
        it("revert the transaction if sender is not owner", async () => {
          await randomIpfsNft.connect(accounts[1]);

          await assert
            .expect(randomIpfsNft.withdraw())
            .to.b.revertedWith("Ownable: caller is not the owner");
        });

        it("owner withdraw the balance of contrcat", async () => {
          const startingBalanceOfOwner =
            await randomIpfsNft.provider.getBalance(deployer);
          const startingBalanceOfContract =
            await randomIpfsNft.provider.getBalance(randomIpfsNft.address);

          const txResponse = await randomIpfsNft.withdraw();
          const txReceipt = txResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = txReceipt;
          const withdrawGasCost = gasUsed.mul(effectiveGasPrice);

          const endingBalanceOfOwner = await randomIpfsNft.provider.getBalance(
            deployer
          );

          assert.equal(
            startingBalanceOfContract.add(startingBalanceOfOwner).toString(),
            endingBalanceOfOwner.add(withdrawGasCost).toString()
          );
        });
      });

      describe("getBreedFromModdedRng", () => {
        it("should return pug if moddedRng < 10", async function () {
          const expectedValue = await randomIpfsNft.getBreedFromModdedRng(7);
          assert.equal(0, expectedValue);
        });
        it("should return shiba-inu if moddedRng is between 10 - 39", async function () {
          const expectedValue = await randomIpfsNft.getBreedFromModdedRng(21);
          assert.equal(1, expectedValue);
        });
        it("should return st. bernard if moddedRng is between 40 - 99", async function () {
          const expectedValue = await randomIpfsNft.getBreedFromModdedRng(77);
          assert.equal(2, expectedValue);
        });
        it("should revert if moddedRng > 99", async function () {
          await expect(
            randomIpfsNft.getBreedFromModdedRng(100)
          ).to.be.revertedWith("RandomIpfsNft__RangeOutOfBounds");
        });
      });
    });
