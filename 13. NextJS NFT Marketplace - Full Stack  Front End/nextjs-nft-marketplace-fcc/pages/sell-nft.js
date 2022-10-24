import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { Form, useNotification, Button } from "web3uikit";
import { useMoralis, useWeb3Contract } from "react-moralis";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import basicNftAbi from "../constants/BasicNft.json";
import { ethers } from "ethers";
import networkMapping from "../constants/networkMapping.json";
import { useEffect, useState } from "react";

export default function SellNft() {
  const { chainId, account } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : "31337";
  const nftMarketplaceAddress = networkMapping[chainString].NftMarketplace[0];

  const { runContractFunction } = useWeb3Contract();

  const { proceeds, setProceeds } = useState("0");

  const { runContractFunction: listingItem } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: nftMarketplaceAddress,
    functionName: "listItem",
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
      price: price,
    },
  });

  const { runContractFunction: withdrawProceeds } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: nftMarketplaceAddress,
    functionName: "withdrawProceeds",
    params: {},
  });

  const dispatch = useNotification();

  const approoveAndList = async (data) => {
    console.log("Approving...");
    const nftAddress = data.data[0].inputResult;
    const tokenId = data.data[1].inputResult;
    const price = ethers.utils
      .parseEther(data.data[2].inputResult, "ether")
      .toString();

    const approvingOptions = {
      abi: basicNftAbi,
      contractAddress: nftAddress,
      functionName: "approve",
      params: {
        to: nftMarketplaceAddress,
        tokenId: tokenId,
      },
    };

    await runContractFunction({
      params: approvingOptions,
      onSuccess: handleApproveSuccess,
      onError: (error) => console.log(error),
    });
  };

  const handleListingItemSuccess = async (tx) => {
    await tx.wait(1);

    dispatch({
      type: "success",
      message: "NFT listing",
      title: "NFT listing. Please refresh (and movie blocks)",
      position: "topR",
    });
  };

  const handleApproveSuccess = async (tx) => {
    await tx.wait(1);

    listingItem({
      onError: (error) => {
        console.log(error);
      },
      onSuccess: handleListingItemSuccess,
    });
  };

  async function setupUI() {
    const returnedProceeds = await runContractFunction({
      params: {
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "getProceeds",
        params: {
          seller: account,
        },
      },
      onError: (error) => console.log(error),
    });
    if (returnedProceeds) {
      setProceeds(returnedProceeds.toString());
    }
  }
  useEffect(() => {
    setupUI();
  }, []);

  const handleWithdrawProceedsSuccess = async (tx) => {
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "Withdrawing proceeds",
      title: "Withdrawing proceeds. Please refresh (and movie blocks)",
      position: "topR",
    });
  };

  const withdrawProceedsButtonClick = () => {
    withdrawProceeds({
      onError: (error) => {
        console.log(error);
      },
      onSuccess: handleWithdrawProceedsSuccess,
    });
  };

  return (
    <>
      <div className={styles.container}>
        <Form
          onSubmit={approoveAndList}
          data={[
            {
              name: "NFT Address",
              type: "text",
              inputWidth: "50%",
              value: "",
              key: "nftAddress",
            },
            {
              name: "TokenID",
              type: "text",
              value: "",
              key: "tokenId",
            },
            {
              name: "Price (in ETH)",
              type: "number",
              value: "",
              key: "price",
            },
          ]}
          title="Sell your NFT!"
        />
      </div>
      <hr />
      {proceeds.toString() != "0" && (
        <Button onClick={withdrawProceedsButtonClick}>
          Withdraw Proceeds ( {proceeds} )
        </Button>
      )}
    </>
  );
}
