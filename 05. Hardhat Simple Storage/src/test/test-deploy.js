const { ethers } = require("hardhat");
const { assert } = require("chai"); 

// run test by key word: npx hardhat test --grep store
describe("SimpleStorage", function() {
  let simpleStorageFactory, simpleStorage;

  beforeEach(async function() {
    simpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await simpleStorageFactory.deploy();
    await simpleStorage.deployTransaction.wait(1);
  });

  it("Should start with favorite number of 0", async () => {
    // Arrange
    // Act
    // Assert

    const favoriteNumber = await simpleStorage.retrieve();
    const expectedValue = "0";

    assert.equal(favoriteNumber.toString(), expectedValue);
  });

  it("Should update favorite number when we call store", async () => {
    const expectedFavoriteNumberAfterUpdate = "5";

    const transactionResponse = await simpleStorage.store(expectedFavoriteNumberAfterUpdate);
    await transactionResponse.wait(1);

    const favoriteNumber = await simpleStorage.retrieve();

    assert.equal(favoriteNumber.toString(), expectedFavoriteNumberAfterUpdate)
  });
});