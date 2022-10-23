const { Moralis } = require("moralis/.");

Moralis.Cloud.afterSave("ItemListed", async (request) => {
  const confirmed = request.object.get("confirmed");
  const logger = Moralis.Cloud.getLogger();
  logger.info("Looking for confirmed Tx.");

  if (confirmed) {
    logger.info("Found Item");
    const ActiveItem = Moralis.Object.extend("ActiveItem");

    const query = new Moralis.Query(ActiveItem);

    activeItem.equalTo("marketplaceAddress", request.object.get("address"));
    activeItem.equalTo("nftAddress", request.object.get("nftAddress"));
    activeItem.equalTo("tokenId", request.object.get("tokenId"));
    activeItem.equalTo("seller", request.object.get("seller"));

    const updatedItem = query.first();

    if (updatedItem) {
      logger.info(
        `Deleting already listed ${equest.object.get(
          "tokenId"
        )} at address ${equest.object.get("nftAddress")}`
      );

      await updatedItem.destroy();
      logger.info("Deleted.");
    }

    const activeItem = new ActiveItem();
    activeItem.set("marketplaceAddress", request.object.get("address"));
    activeItem.set("nftAddress", request.object.get("nftAddress"));
    activeItem.set("price", request.object.get("price"));
    activeItem.set("tokenId", request.object.get("tokenId"));
    activeItem.set("seller", request.object.get("seller"));

    logger.info(
      `Adding address ${request.object.get(
        "address"
      )}. Token Id: ${request.object.get("tokenId")}`
    );

    logger.info("Saving...");
    await activeItem.save();
  }
});

Moralis.Cloud.afterSave("ItemCanceled", async (request) => {
  const confirmed = request.object.get("confirmed");
  const logger = Moralis.Cloud.getLogger();

  logger.info(`Marketplace | Object: ${request.object}`);

  if (confirmed) {
    logger.info("Found Item");

    const ActiveItem = Moralis.Object.extend("ActiveItem");
    const query = new Moralis.Query(ActiveItem);

    query.equalTo("marketplaceAddress", request.object.get("address"));
    query.equalTo("nftAddress", request.object.get("nftAddress"));
    query.equalTo("tokenId", request.object.get("tokenId"));

    logger.info(`Marketplace | Query: ${query}`);

    const canceledItem = await query.first();

    logger.info(`Marketplace | Canceled Item: ${canceledItem}`);

    if (canceledItem) {
      logger.info(
        `Deleteing ${request.object.get(
          "tokenId"
        )} at adress ${request.object.get("nftAddress")}`
      );

      await canceledItem.destroy();
    } else {
      logger.info(
        `No item found with tokenId: ${request.object.get(
          "tokenId"
        )} and adress: ${request.object.get("nftAddress")}`
      );
    }
  }
});

Moralis.Cloud.afterSave("ItemBought", async (request) => {
  const confirmed = request.object.get("confirmed");
  const logger = Moralis.Cloud.getLogger();

  logger(`Marketplace | Object: ${request.object}`);

  if (confirmed) {
    logger.info("Found bought item");

    const ActiveItem = Moralis.Object.extend("ActiveItem");
    const query = new Moralis.Query(ActiveItem);

    query.equalTo("marketplaceAddress", request.object.get("address"));
    query.equalTo("nftAddress", request.object.get("nftAddress"));
    query.equalTo("tokenId", request.object.get("tokenId"));

    logger.info(`Marketplace | Query: ${query}`);

    const boughtItem = await query.first();

    if (boughtItem) {
      logger.info(
        `Deleting NFT with ${request.object.get(
          "tokenId"
        )} at address ${request.object.get("nftAddress")}}`
      );

      await boughtItem.destroy();
      logger.info("Deleted.");
    } else {
      logger.info(
        `No item found with tokenId: ${request.object.get(
          "tokenId"
        )} and adress: ${request.object.get("nftAddress")}`
      );
    }
  }
});
