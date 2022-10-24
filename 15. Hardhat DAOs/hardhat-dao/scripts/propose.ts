import { ethers, network } from "hardhat";
import {
  developmentChains,
  VOTING_DELAY,
  proposalsFile,
  FUNC,
  PROPOSAL_DESCRIPTION,
  NEW_STORE_VALUE,
} from "../helper-hardhat-config";
import * as fs from "fs";
import { moveBlocks } from "../utils/move-blocks";

export async function propose(
  functionToCall: string,
  functionArgs: any[],
  proposalDescription: string
) {
  const governor = await ethers.getContract("GovernorContract");
  const box = await ethers.getContract("Box");

  const encodedFunctionCall = await box.interface.encodeFunctionData(
    functionToCall,
    functionArgs
  );

  const proposeTx = await governor.propose(
    [box.address],
    [0],
    [encodedFunctionCall],
    proposalDescription
  );
  const txReceipt = await proposeTx.wait(1);
  const proposalId = txReceipt.events[0].args.proposalId;

  let proprsalsIds = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
  proprsalsIds[network.config.chainId!.toString()].push(proposalId.toString());
  fs.writeFileSync(proposalsFile, JSON.stringify(proprsalsIds));

  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_DELAY + 1);
  }
}

propose(FUNC, [NEW_STORE_VALUE], PROPOSAL_DESCRIPTION);
