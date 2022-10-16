const { assert } = require("chai");
const { network, ethers, deployments, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("BasicNft Unit Tests", () => {
      let basicNft;
      let deployer;
      let basicNftInitialTokenId;

      beforeEach(async () => {
        await deployments.fixture(["all"]);
        deployer = (await getNamedAccounts()).deployer;
        basicNft = await ethers.getContract("BasicNft", deployer);

        basicNftInitialTokenId = await basicNft.getTokenCounter();
      });

      describe("constructor", () => {
        it("initialize tokenCounter correctly", async () => {
          const name = await basicNft.name();
          const symbol = await basicNft.symbol();

          assert.equal(basicNftInitialTokenId.toString(), "0");
          assert.equal(name, "Dogie");
          assert.equal(symbol, "dG");
        });
      });

      describe("Mint NFT", () => {
        beforeEach(async () => {
          const txResponse = await basicNft.nintNft();
          await txResponse.wait(1);
        });

        it("tokenCounter should be increased", async () => {
          const actualTokenCounter = await basicNft.getTokenCounter();

          assert.equal(actualTokenCounter.toString(), "1");
        });

        it("Allows users to mint an NFT, and updates appropriately", async () => {
          const tokenURI = basicNft.tokenURI();

          assert.equal(tokenURI, basicNft.TOKEN_URI);
        });

        it("show the correct balance and owner of the Nft", async () => {
          const deployerAddress = await deployer.address;
          const deployerBalance = await basicNft.balanceOf(deployerAddress);
          const owner = await basicNft.ownerOf("1");

          assert.equal(deployerBalance.toString(), "1");
          assert.equal(owner.toString(), deployerAddress.toString());
        });
      });
    });
