const { network } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const {
  storeImages,
  storeTokeUriMetadata,
} = require("../utils/uploadToPinata");

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("2");
const IMAGES_LOCATION = "./images/random";

const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_type: "Cutness",
      value: 100,
    },
  ],
};

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  //   address vrfCoordinatorV2,
  //   uint64 subscriptionId,
  //   bytes32 gasLane,
  //   uint32 callbackGasLimit,
  //   string[3] memory tokenUris,
  //   uint256 mintFee
  let vrfCoordinatorV2Address, subscriptionId;

  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mocks"
    );
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;

    // Create subscription
    const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
    const transactionReceipt = await transactionResponse.wait(1);
    subscriptionId = transactionReceipt.events[0].args.subId;

    // Fund subscription
    await vrfCoordinatorV2Mock.fundSubscription(
      subscriptionId,
      VRF_SUB_FUND_AMOUNT
    );
  } else {
    const chainId = network.config.chainId;
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinator;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }

  const gasLane = networkConfig[chainId].gasLane;
  const callbackGasLimit = networkConfig[chainId].callbackGasLimit;
  const mintFee = networkConfig[chainId].mintFee;

  // get IPFS hash images
  // 1. With our own IPFS node: https://docs.ipfs.tech/
  // 2. Pinata
  // 3. NFT Storage

  let tokenUris;

  if (process.env.UPLOAD_TO_PINATA == "true") {
    tokenUris = await handleTokenUris();
  }

  const arguments = [
    vrfCoordinatorV2Address,
    subscriptionId,
    gasLane,
    callbackGasLimit,
    tokenUris,
    mintFee,
  ];
  const randomIpfsNft = await deploy("RandomIpfsNft", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
};

async function handleTokenUris() {
  let tokenUris = [];
  // store the image in IPFS
  // store the metadata in IPFS

  const { responses: imgaeUploadResponses, files } = await storeImages(
    IMAGES_LOCATION
  );

  for (imageUploadIndex in imgaeUploadResponses) {
    let tokenUriMetadata = { ...metadataTemplate };

    tokenUriMetadata.name = files[imageUploadIndex].replace(".png", "");
    tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`;
    tokenUriMetadata.image = `ipfs://${imgaeUploadResponses[imageUploadIndex].IpfsHash}`;
    console.log(`Uploading ${tokenUriMetadata.name}...`);
    // store to JSON
    const metadataUploadResponse = await storeTokeUriMetadata(tokenUriMetadata);
    tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`);
  }
  console.log("Token URIs uploaded!");
  return tokenUris;
}

module.exports.tags = ["all", "randomipfs", "main"];
