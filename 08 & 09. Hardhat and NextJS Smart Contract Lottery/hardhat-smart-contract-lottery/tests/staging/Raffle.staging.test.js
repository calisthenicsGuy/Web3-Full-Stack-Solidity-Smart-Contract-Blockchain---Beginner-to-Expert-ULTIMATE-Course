const { assert, expect } = require("chai");
const { getNamedAccounts, network, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Uint Tests", async () => {
      let raffle;
      let deployer;
      let raffleEntranceFee;

      beforeEach(async () => {
        deployer = await getNamedAccounts().deployer;
        raffle = await ethers.getContract("Raffle", deployer);
        raffleEntranceFee = await raffle.getEntranceFee();
      });

      it("works with live Chainlink Keepers and Chainlink VRF, we get a random winner", async () => {
        // enter the rafffle
        console.log("Setting up test...");

        const startingTimeStamp = await raffle.getLastTimeStamp();
        const accounts = await ethers.getSigners();

        console.log("Setting up Listener...");

        new Promise(async (resolve, reject) => {
          // setting the listner before entering the raffle
          raffle.once("WinnerPicked", async () => {
            try {
              console.log("WinnerPicked event fired!");

              const recentWinner = await raffle.getRecentWinner();
              const winnerEndingBalance = await accounts[0].getBalance();
              const raffleState = await raffle.getRaffleState();
              const endingTimeStamp = await raffle.getLastTimeStamp();

              await expect(raffle.getPlayers(0)).to.be.reverted;
              assert.equal(recentWinner.toString(), accounts[0].address);
              assert.equal(
                winnerEndingBalance.toString(),
                winnerStartingBalance.add(raffleEntranceFee).toString()
              );
              assert.equal(raffleState.toString(), "0");
              assert(endingTimeStamp > startingTimeStamp);
              resolve();
            } catch (error) {
              console.log(error.message);
              reject(error);
            }
          });

          // enter the raffle
          const transactionResponse = await raffle.enterRaffle({
            value: raffleEntranceFee,
          });
          const transactionReceipt = await transactionResponse.wait(1);
          console.log("Ok, Time to wait...");
          const winnerStartingBalance = await accounts[0].getBalance();
          // and this code WONT complete until our listener has finished listening!
        });
      });
    });
