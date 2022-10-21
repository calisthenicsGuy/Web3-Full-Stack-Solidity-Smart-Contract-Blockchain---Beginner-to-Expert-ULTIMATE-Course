const { assert, expect, Assertion } = require("chai");
const { network, ethers, getNamedAccounts, deployments } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Nft Marketplace Tests", () => {
      let nftMarketplace, basicNft, basicNftAddress;
      let deployer, deployerAddress, player, playerAddress;
      const PRICE = ethers.utils.parseEther("0.1");
      const TOKEN_ID = 0;

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        deployerAddress = deployer.address;

        player = (await getNamedAccounts()).player;
        playerAddress = player.address;

        await deployments.fixture(["all"]);

        nftMarketplace = await ethers.getContract("NftMarketplace");

        basicNft = await ethers.getContract("BasicNft");
        basicNftAddress = basicNft.address;

        await basicNft.mintNft();
        await basicNft.approve(nftMarketplace.address, TOKEN_ID);
      });

      describe("list item tests", () => {
        it("should revert the transaction if price is equal or lower than zero", async () => {
          await expect(
            nftMarketplace.listItem(basicNft.address, TOKEN_ID, 0)
          ).to.be.revertedWith("NftMarketplace__PriceMustBeAboveZero");
        });

        it("should update s_listing mapping", async () => {
          const listing = await nftMarketplace.getListing(
            basicNft.address,
            TOKEN_ID
          );

          assert(listing.price.toString() == PRICE.toString());
          assert(listing.seller.toString() == deployerAddress.toString());
        });
      });

      describe("buying of listing", () => {
        let playerConnectedNftMarketplace;

        beforeEach(async () => {
          playerConnectedNftMarketplace = await nftMarketplace.connect(player);
        });

        it("transaction should be revert if given price is less than the price if NFT", async () => {
          await expect(
            playerConnectedNftMarketplace.buyItem(basicNftAddress, TOKEN_ID, {
              value: PRICE - 0.01,
            }).to.be.revertedWith(`revert NftMarketplace__PriceNotMet(
              ${basicNftAddress},
              ${TOKEN_ID},
              ${PRICE})`)
          );
        });

        it("should revert the transaction if item is not listed", async () => {
          await expect(
            playerConnectedNftMarketplace.buyItem
          ).to.be.revertedWith(
            `NftMarketplace__NotLisetd(${basicNftAddress}, ${TOKEN_ID})`
          );
        });

        it("item should be listed", async () => {
          const txResponse = await nftMarketplace.listItem(
            basicNft.address,
            TOKEN_ID,
            PRICE
          );
          const txReceipt = await txResponse.wait(1);
          const txEvent = await await txReceipt.args.events[0];

          assert.equal(txEvent.seller.toString() == deployerAddress.toString());
          assert.equal(
            txEvent.nftAddress.toString() == basicNftAddress.toString()
          );
          assert.equal(txEvent.tokenId.toString() == TOKEN_ID.toString());
          assert.equal(txEvent.price.toString() == PRICE.toString());

          const listing = await nftMarketplace.getListing(
            basicNft.address,
            TOKEN_ID
          );

          assert.equal(listing.price.toString(), PRICE.toString());
          assert.equal(listing.tokenId.toString(), TOKEN_ID.toString());
        });

        it("item should be buyed", async () => {
          const startingProceedsOfOwner = await nftMarketplace.getProceeds(
            deployerAddress
          );

          const txResponse = await playerConnectedNftMarketplace.buyItem(
            basicNftAddress,
            TOKEN_ID,
            { value: PRICE }
          );
          const txReceipt = await txResponse.wait(1);
          const txEvent = await txReceipt.args.events[0];

          assert.equal(txEvent.buyer.toString() == playerAddress.toString());
          assert.equal(txEvent.tokenId.toString() == TOKEN_ID.toString());
          assert.equal(txEvent.price.toString() == PRICE.toString());

          const endingProceedsOfOldOwner = await nftMarketplace.getProceeds(
            deployer.address
          );

          assert(startingProceedsOfOwner < endingProceedsOfOldOwner);
          assert.equal(endingProceedsOfOldOwner.toString(), PRICE.toString());
        });
      });

      describe("cancel listing tests", () => {
        it("item should be canceled (deleted)", async () => {
          const txResponse = await nftMarketplace.cancelListing(
            basicNftAddress,
            TOKEN_ID
          );
          const txReceipt = await txResponse.wait(1);
          const event = await txReceipt.args.events[0];

          assert.equal(event.seller.toString() == deployerAddress.toString());
          assert.equal(
            (await nftMarketplace
              .getListing(basicNftAddress, TOKEN_ID)
              .toString()) == "0"
          );
        });
      });

      describe("update listing tests", () => {
        it("should revert the transaction if new price is equal or less than zero", async () => {
          await expect(
            nftMarketplace.updateListing(basicNftAddress, TOKEN_ID, 0)
          ).to.be.revertedWith("NftMarketplace__PriceMustBeAboveZero");
        });

        it("should update the price of nft", async () => {
          const NEW_PRICE = await ethers.utils.parseEther("0.2");
          const txResponse = await nftMarketplace.updateListing(
            basicNftAddress,
            TOKEN_ID,
            NEW_PRICE
          );
          await txResponse.wait(1);
          
          const listing = await nftMarketplace.getListing(
            basicNftAddress,
            TOKEN_ID
          );

          assert.equal(listing.price.toString() = NEW_PRICE.toString());
        });
      });

      describe("withdraw proceeds tests", () => {
        it("should revert the transaction if owner od NFT does not have any proceeds", async () => {
          await expect(nftMarketplace.withdrawProceeds()).to.be.revertedWith("NftMarketplace__BalanceCannotBeZero");
        });

        it("should set the proceeds of owner to zero", async () => {
          await nftMarketplace.listItem(
            basicNft.address,
            TOKEN_ID,
            PRICE
          );

          const buyingOfItemTxResponse = await playerConnectedNftMarketplace.buyItem(
            basicNft.address,
            TOKEN_ID,
            { value: PRICE }
          );
          await buyingOfItemTxResponse.wait(1);

          const withdrawProceedsTxResponse = await nftMarketplace.withdrawProceeds();
          await withdrawProceedsTxResponse.wait(1);

          assert.equal(await getProceeds(deployerAddress).toString() == "0");
        });

        it("nftMarketplace should allow to sell and buy one nft more than one times", async () => {
          await nftMarketplace.listItem(
            basicNft.address,
            TOKEN_ID,
            PRICE
          );

          const buyingOfItemTxResponse = await playerConnectedNftMarketplace.buyItem(
            basicNft.address,
            TOKEN_ID,
            { value: PRICE }
          );
          await buyingOfItemTxResponse.wait(1);

          const withdrawProceedsTxResponse = await nftMarketplace.withdrawProceeds();
          await withdrawProceedsTxResponse.wait(1);

          assert.equal(await nftMarketplace.getProceeds(deployerAddress).toString() == "0");

          console.log("-------------------------------------------------------------");

          await nftMarketplace.listItem(
            basicNft.address,
            TOKEN_ID,
            PRICE
          );

          const buyingOfItemTwiceTxResponse = await nftMarketplace.buyItem(
            basicNft.address,
            TOKEN_ID,
            { value: PRICE }
          );
          await buyingOfItemTwiceTxResponse.wait(1);

          const withdrawProceedsTwiceTxResponse = await playerConnectedNftMarketplace.withdrawProceeds();
          await withdrawProceedsTwiceTxResponse.wait(1);

          assert.equal(await playerConnectedNftMarketplace.getProceeds(playerAddress).toString() == "0");
        });
      });
    });
