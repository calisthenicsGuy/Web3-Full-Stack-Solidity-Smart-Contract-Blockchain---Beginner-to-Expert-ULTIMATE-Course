import React, { useEffect, useState } from "react";
import { useWeb3Contract } from "react-moralis";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import basicNftAbi from "../constants/BasicNft.json";
import Image from "next/image";

function NFTBox({ price, nftAddress, tokenId, marketplaceAddress, seller }) {
  const [imageURI, setImageURI] = useState("");
  const { runContractFunction: getTokenURI } = useWeb3Contract({
    abi: basicNftAbi,
    contractAddress: nftAddress,
    functionName: "tokenURI",
    params: {
      tokenId: tokenId,
    },
  });

  async function updateUI() {
    const tokenURI = await getTokenURI();

    if (tokenURI) {
      const requestURL = tokenURI.replace("ipfs://", "https//ipfs.io/ipfs");
      const tokenURIResponse = await (await fetch(requestURL)).json();
      const imageURI = tokenURIResponse.image;
      const imageURIURL = imageURI.replace("ipfs://", "https//ipfs.io/ipfs");
      setImageURI(imageURIURL);
    }
  }

  useEffect(() => {
    updateUI();
  }, [isWeb3Enabled]);

  return (
    <>
      <div>
        {imageURI ? (
          <Image
            loader={() => imageURI}
            src={imageURI}
            height="200"
            width="200"
          />
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </>
  );
}

export default NFTBox;
