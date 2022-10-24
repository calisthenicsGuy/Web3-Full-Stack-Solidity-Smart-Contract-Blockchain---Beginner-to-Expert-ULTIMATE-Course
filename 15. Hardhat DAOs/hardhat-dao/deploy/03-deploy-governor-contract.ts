import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import {
  networkConfig,
  developmentChains,
  VOTING_DELAY,
  VOTING_PERIOD,
  QUORUM_PERCENTAGE,
} from "../helper-hardhat-config";
import { ethers } from "hardhat";

const deployGovernorContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const governanceToken = await ethers.getContract("GovernanceToken");
  const timeLock = await ethers.getContract("TimeLock");

  const args = [
    governanceToken,
    timeLock,
    VOTING_DELAY,
    VOTING_PERIOD,
    QUORUM_PERCENTAGE,
  ];

  log("----------------------------------------------------");
  log("Deploying GovernorContract and waiting for confirmations...");

  const governorContract = await deploy("GovernorContract", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });

  log(`GovernorContract at ${governorContract.address}`);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(governorContract.address, []);
  }
};

export default deployGovernorContract;
deployGovernorContract.tags = ["all", "governor"];
