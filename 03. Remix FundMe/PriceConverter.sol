// SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice() internal view returns (uint256) {
      AggregatorV3Interface priceFeed = AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e);
      (, int price,,,) = priceFeed.latestRoundData();

      return uint256(price * 1e10);
      // exapmle:
        // price = 136444000000
        // return: 136444000000 * 1e10 (10000000000)
    }

    function getConversionRate(uint256 amount) internal view returns (uint256) {
      uint256 currentPricePerEther = getPrice();
      uint256 ethAmountInUsd = (currentPricePerEther * amount) / 1000000000000000000;
      
      return ethAmountInUsd;
    }
}