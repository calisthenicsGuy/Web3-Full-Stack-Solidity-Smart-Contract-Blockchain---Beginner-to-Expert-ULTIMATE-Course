const { deployments, ethers } = require("hardhat");
let fundMe;
describe("FundMe", async function() {
    foreEach(async () => {
        await deployments.fixture(["all"]);
        fundMe = ethers.getContract("FundMe");
    });

    describe("constructor", async function() {

    })
})