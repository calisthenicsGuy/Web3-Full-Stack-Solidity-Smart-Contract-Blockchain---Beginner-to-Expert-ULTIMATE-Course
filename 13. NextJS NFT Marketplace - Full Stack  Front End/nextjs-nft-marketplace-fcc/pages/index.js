import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useMoralisQuery, useMoralis } from "react-moralis";
import NFTBox from "../components/NFTBox";

export default function Home() {
  const { isWeb3Enabled } = useMoralis();

  const { data: listedNfts, isFetching: fetchingListedNfts } = useMoralisQuery(
    "ActiveItem",
    (query) => query.limit(10).descending("tokenId")
  );

  return (
    <div className={styles.container}>
      {fetchingListedNfts ? (
        <div>Loading...</div>
      ) : (
        listedNfts.map((nft) => {
          const { price, nftAddress, tokenId, marketplaceAddress, seller } =
            nft.attributes;

          <NFTBox
            key={`${nftAddress}${tokenId}`}
            price={price}
            nftAddress={nftAddress}
            tokenId={tokenId}
            marketplaceAddress={marketplaceAddress}
            seller={seller}
          />;
        })
      )}
    </div>
  );
}
