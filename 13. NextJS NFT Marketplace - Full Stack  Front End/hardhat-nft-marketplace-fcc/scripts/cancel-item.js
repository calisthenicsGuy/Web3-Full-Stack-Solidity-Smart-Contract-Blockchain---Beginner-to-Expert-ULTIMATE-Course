const { network, ethers, deployments, getNamedAccounts } = require("hardhat");
const { movieBlocks } = require("../utils/movie-blocks");

const TOKEN_ID = 0;

async function cancel() {
  const nftMarketplace = await ethers.getContract("NftMarketplace");
  const basicNft = await ethers.getContract("BasicNft");

  const txResponse = await nftMarketplace.cancelListing(
    basicNft.address,
    TOKEN_ID
  );
  await txResponse.wait(1);

  console.log("NFT Canceled");

  if (network.config.chainId.toString() == "31337") {
    await movieBlocks(2, (sleepAmount = 1000));
  }
}

cancel()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
