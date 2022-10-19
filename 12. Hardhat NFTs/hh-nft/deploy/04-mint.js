const { ethers, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async function ({ getNamedAccounts }) {
  const { deployer } = await getNamedAccounts();

  // Basic Nft
  const basicNft = await ethers.getContract("BasicNft", deployer);
  const basicMintTxResponse = await basicNft.mintNft();
  const basicMintTxReceipt = await basicMintTxResponse.wait(1);
  console.log(`Basic NFT index 0 has tokenURI: ${await basicNft.tokenURI(0)}`);

  // Random Ipfs Nft
  const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
  const mintFee = await randomIpfsNft.getMintFee();

  await new Promise(async (resolve, reject) => {
    setTimeout(resolve, 300000);
    randomIpfsNft.once("NftMinted", async function () {
      resolve();

      const requestNftTxResponse = await randomIpfsNft.requestNft({
        value: mintFee,
      });
      const requestNftTxReceipt = await requestNftTxResponse.wait(1);

      if (developmentChains.includes(network.name)) {
        const requestId =
          await requestNftTxReceipt.events[1].args.requestId.toString();
        const vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
        await vrfCoordinatorV2Mock.fulfillRandomWords(
          requestId,
          randomNft.address
        );
      }
    });
  });

  console.log(
    `Random IPFS NFT index tokenURI: ${await randomIpfsNft.tokenURI(0)}`
  );

  // Dynamic Svg Nft
  const highValue = ethers.utils.parseEther("4000");
  const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer);
  const dynamicMintTxResponse = await dynamicSvgNft.mintNft(
    highValue.toString()
  );
  const dynamicMintTxReceipt = await dynamicMintTxResponse.wait(1);
  console.log(
    `Dynamic Svg Nft index 0 tokenURI: ${await dynamicSvgNft.tokenURI(0)}`
  );
};

module.exports.tags = ["all", "mint"];
