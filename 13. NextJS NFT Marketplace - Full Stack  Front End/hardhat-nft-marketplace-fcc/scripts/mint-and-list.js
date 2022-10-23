const { network, ethers, deployments, getNamedAccounts } = require("hardhat");
const { movieBlocks } = require("../utils/movie-blocks");

async function mintAndList() {
  const { deployer } = await getNamedAccounts();
  const BASIC_NFT_TOKEN_ID = 0;
  const BASIC_NFT_TWO_TOKEN_ID = 0;
  const PRICE = await ethers.utils.parseEther("0.1");

  const nftMarketplace = await ethers.getContract("NftMarketplace", deployer);
  const basicNft = await ethers.getContract("BasicNft", deployer);
  const basicNftTwo = await ethers.getContract("BasicNftTwo", deployer);

  console.log("Mint first NFT...");
  const mintBasicNftTxResponse = await basicNft.mintNft();
  await mintBasicNftTxResponse.wait(1);
  console.log("Approve first NFT...");
  await basicNft.approve(nftMarketplace.address, BASIC_NFT_TOKEN_ID);

  console.log("Mint second NFT...");
  const mintBasicNftTwoTxResponse = await basicNftTwo.mintNft();
  await mintBasicNftTwoTxResponse.wait(1);
  console.log("Approve second NFT...");
  await basicNftTwo.approve(nftMarketplace.address, BASIC_NFT_TWO_TOKEN_ID);

  console.log("Listing first NFT");
  await nftMarketplace.listItem(basicNft.address, BASIC_NFT_TOKEN_ID, PRICE);
  console.log("Listing second NFT");
  await nftMarketplace.listItem(
    basicNftTwo.address,
    BASIC_NFT_TWO_TOKEN_ID,
    PRICE
  );

  console.log("--------------------------------------------------");

  if (network.config.chainId.toString() === "31337") {
    await movieBlocks(2, (sleepAmount = 1000));
  }
}

mintAndList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
