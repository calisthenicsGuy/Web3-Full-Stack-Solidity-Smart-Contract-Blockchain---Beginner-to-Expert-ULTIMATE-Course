import React, { useState } from "react";
import { Modal, Input, useNotification } from "web3uikit";
import { useWeb3Contract } from "react-moralis";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import { ethers } from "ethers";

function UpdateListingModal({
  isVisible,
  nftAddress,
  tokenId,
  marketplaceAddress,
  onClose,
}) {
  const { priceToUpdateListingWith, setPriceToUpdateListingWith } = useState(0);
  const dispatch = useNotification();

  const { runContractFunction: updateListing } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "updateListing",
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
      newPrice: ethers.utils.parseEther(
        priceToUpdateListingWith.toString() || "0"
      ),
    },
  });

  const handleUpdateListingSuccess = async (tx) => {
    await tx.wait(1)
    dispatch({
        type: "success",
        message: "Listing updated",
        title: "Listing updated. Please refresh (and movie blocks)",
        position: "topR",
    });
    onClose && onClose();
    setPriceToUpdateListingWith("0");
  };

  return (
    <>
      <Modal
        isVisible={isVisible}
        onCancel={onClose}
        onCloseButtonPressed={onClose}
        onOk={() => {
          updateListing({
            onError: (error) => {
              console.log(error);
            },
            onSuccess: handleUpdateListingSuccess,
          });
        }}
      >
        <Input
          label="Update listing price in L1 Currency (ETH)"
          name="New listing price"
          type="number"
          onChange={(event) => {
            setPriceToUpdateListingWith(event.target.value);
          }}
          onOk={() => {}}
        />
      </Modal>
    </>
  );
}

export default UpdateListingModal;
