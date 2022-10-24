const {
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config");
const { network, deployments, deployer, ethers } = require("hardhat");

async function main() {
  const boxProxyAdmin = await ethers.getContract("BoxProxyAdmin");
  const transparentProxy = await ethers.getContract("Box_Proxy");

  const proxyBoxV1 = await ethers.getContractAt(
    "Box",
    transparentProxy.address
  );
  const proxyBoxV1Version = await proxyBoxV1.version();
  console.log(proxyBoxV1Version.toString());

  const boxV2 = await ethers.getContract("BoxV2");
  const upgradeTx = await boxProxyAdmin.upgrade(
    transparentProxy.address,
    boxV2.address
  );
  await upgradeTx.wait(1);

  const proxyBoxV2 = await ethers.getContractAt(
    "BoxV2",
    transparentProxy.address
  );
  const proxyBoxV2Version = await proxyBoxV2.version();
  console.log(proxyBoxV2Version.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
