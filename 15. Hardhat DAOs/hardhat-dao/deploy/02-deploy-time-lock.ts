import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import {
  networkConfig,
  developmentChains,
  MIN_DELAY,
} from "../helper-hardhat-config";
import { ethers } from "hardhat";

const deployTimeLock: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const args = [MIN_DELAY, [], []];

  log("Deploying TimeLock and waiting for confirmations...");

  const timeLock = await deploy("TimeLock", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(timeLock.address, args);
  }
};

export default deployTimeLock;
deployTimeLock.tags = ["all", "timelock"];
