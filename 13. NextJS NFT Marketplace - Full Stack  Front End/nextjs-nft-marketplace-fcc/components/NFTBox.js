import React, { useEffect, useState } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import basicNftAbi from "../constants/BasicNft.json";
import Image from "next/image";
import { Card, useNotification } from "web3uikit";
import { ethers } from "ethers";
import UpdateListingModal from "./UpdateListingModal";

const truncateStr = (fullStr, strLen) => {
  if (fullStr.length <= strLen) return fullStr;

  const separator = "...";
  const separatorLength = separator.length;

  const charsToShow = strLen - separatorLength;
  const fronChars = fullStr.substring(0, Math.ceil(charsToShow / 2));
  const backChars = fullStr.substring(
    fullStr.length - Math.floor(charsToShow / 2)
  );

  return fronChars + separator + backChars;
};

function NFTBox({ price, nftAddress, tokenId, marketplaceAddress, seller }) {
  const { isWeb3Enabled, account } = useMoralis();

  const [imageURI, setImageURI] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenDescription, setTokenDescription] = useState("");

  const dispatch = useNotification();

  const { runContractFunction: getTokenURI } = useWeb3Contract({
    abi: basicNftAbi,
    contractAddress: nftAddress,
    functionName: "tokenURI",
    params: {
      tokenId: tokenId,
    },
  });

  const { runContractFunction: buyItem } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "buyItem",
    msgValue: price,
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
    },
  });

  const [showModal, setShowModal] = useState(false);
  const hideModal = () => {
    setShowModal(false);
  };

  async function updateUI() {
    const tokenURI = await getTokenURI();

    if (tokenURI) {
      const requestURL = tokenURI.replace("ipfs://", "https//ipfs.io/ipfs");
      const tokenURIResponse = await (await fetch(requestURL)).json();
      const imageURI = tokenURIResponse.image;
      const imageURIURL = imageURI.replace("ipfs://", "https//ipfs.io/ipfs");
      setImageURI(imageURIURL);

      setTokenName(tokenURIResponse.name);
      setTokenDescription(tokenURIResponse.description);
    }
  }

  useEffect(() => {
    updateUI();
  }, [isWeb3Enabled]);

  const isOwnedByUser = seller === account || seller === undefined;
  const formattedSellerAddress = isOwnedByUser
    ? "you"
    : truncateStr(seller || "", 15);

  const handleBuyItemSuccess = async (tx) => {
    await tx.wait(1);
    dispatch({
        type: "success",
        message: "Item bought",
        title: "Item bought. Please refresh (and movie blocks)",
        position: "topR",
    });
  };

  const updateModalVisability = () => {
    isOwnedByUser
      ? setShowModal(true)
      : buyItem({
          onError: (error) => {
            console.log(error);
          },
          onSuccess: handleBuyItemSuccess,
        });
  };

  return (
    <>
      <div>
        {imageURI ? (
          <div>
            <UpdateListingModal
              isVisible={showModal}
              nftAddress={nftAddress}
              tokenId={tokenId}
              marketplaceAddress={marketplaceAddress}
              onClose={hideModal}
            />
            <Card
              title={tokenName}
              description={tokenDescription}
              onClick={updateModalVisability}
            >
              <div className="p-2"></div>
              <div className="flex flex-col items-end grap-2">
                <div>#{tokenIdK}</div>
                <div className="italic text-sm">
                  Owned by {formattedSellerAddress}
                </div>
                <Image
                  loader={() => imageURI}
                  src={imageURI}
                  height="200"
                  width="200"
                />
                <div className="fontBold">
                  {ethers.utils.formatUnits(price, "ether")} ETH
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </>
  );
}

export default NFTBox;
