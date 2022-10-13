const { assert, expect } = require("chai");
const { getNamedAccounts, network, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Uint Tests", async () => {
      let raffle, vrfCoordinatorV2Mock;
      let accounts, player, deployer;
      let raffleEntranceFee,
        raffleState,
        raffleInterval,
        raffleRequestConfirmations,
        raffleNumWords;
      const chainId = network.config.chainId;

      beforeEach(async () => {
        accounts = await ethers.getSigners();
        player = accounts[1];
        deployer = await getNamedAccounts().deployer;

        const { deployer } = await getNamedAccounts();
        await deployments.fixture(["all"]);
        raffle = await ethers.getContract("Raffle", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
        raffleEntranceFee = await raffle.getEntranceFee();
        raffleState = await raffle.getRaffleState();
        raffleInterval = await raffle.getInterval();
        raffleRequestConfirmations = await raffle.getRequestConfirmations();
        raffleNumWords = await raffle.getNumWords();
      });

      describe("constructor", async () => {
        it("Should set Entrance Fee correctly", async () => {
          const expectedEntranceFee = networkConfig[chainId]["entranceFee"];

          assert.equal(raffleEntranceFee, expectedEntranceFee.toString());
        });

        it("Should set Interval correctly", async () => {
          const expectedRaffleState = "0";

          assert.equal(raffleState.toString(), expectedRaffleState);
        });

        it("Should set Raffle State correctly", async () => {
          const expectedInterval = networkConfig[chainId]["interval"];

          assert.equal(raffleInterval.toString(), expectedInterval.toString());
        });

        it("Should set Request Confirmations correctly", async () => {
          assert.equal(raffleRequestConfirmations.toString(), "3");
        });

        it("Should set Num Words correctly", async () => {
          assert.equal(raffleNumWords.toString(), "1");
        });
      });

      describe("enterRaffle", async () => {
        // the transaction should be reverted whn not enough ethers was send or raffle state is not open
        it("Should revert the transaction if sended value is smaller than entranceFee", async () => {
          await expect(raffle.eterRaffle()).to.be.revertedWith(
            "Raffle__NotEnoughETHEntered"
          );
        });

        it("Should add players to players array", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          const contractPlayer = await raffle.getPlayer(0);

          assert.equal(
            contractPlayer.address.toString(),
            deployer.address.toString()
          );
        });

        it("Should emit event on enter raffle", async () => {
          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee })
          ).to.emit(raffle, "RaffleEnter");
        });

        it("doesnt allow entrance when raffle is calculating", async () => {
          raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);

          await raffle.checkUpkeep([]);

          await expect(raffle.enterRaffle).to.be.revertedWith(
            "Raffle__NotOpen"
          );
        });
      });

      describe("checkUpKeep", async () => {
        it("returns false if people haven't send any ETH", async () => {
          await network.provider.send("evm_increaseTime", [
            raffleInterval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);

          const { upKeepNeeded } = await raffle.callStatic.checkUpKeep([]);

          assert(!upKeepNeeded);
        });

        it("returns false if raffle isn't open", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            raffleInterval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);

          await raffle.performUpKeep([]); // await raffle.performUpKeep("0x");

          const raffleState = await raffle.getRaffleState();
          const { upKeepNeeded } = await raffle.callStatic.checkUpKeep();

          assert.equal(raffleState.toString(), "1");
          assert(!upKeepNeeded);
        });

        it("returns false if enough time hasn't passed", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            raffleInterval.toNumber() - 1,
          ]);
          await network.provider.send("evm_mine", []);

          const { upKeepNeeded } = await raffle.callStatic.checkUpKeep();
          assert(!upKeepNeeded);
        });

        it("returns true if enough time has passed", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            raffleInterval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);

          const { upKeepNeeded } = await raffle.callStatic.checkUpKeep();
          assert(upKeepNeeded);
        });
      });
    });
