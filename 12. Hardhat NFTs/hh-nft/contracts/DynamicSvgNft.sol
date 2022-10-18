// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";

error ERC721Metadata__URI_QueryFor_NonExistentToken();

contract DynamicSvgNft is ERC721 {
    uint256 private s_tokenCounter;
    string private i_lowImageUri;
    string private i_highImageUri;
    string private constant BASE64_ENCODED_SVG_PREFIX =
        "data:image/svg+xml;base64,";

    AggregatorV3Interface internal immutable i_priceFeed;
    mapping(uint256 => int256) public s_tokenIdToHighValue;

    event CreatedNft(uint256 tokenId, int256 highValue);

    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg
    ) ERC721("Dynamic Svg NFT", "DSN") {
        s_tokenCounter = 0;
        i_lowImageUri = svgToImageUri(lowSvg);
        i_highImageUri = svgToImageUri(highSvg);

        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function svgToImageUri(string memory svg)
        public
        pure
        returns (string memory)
    {
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );

        return
            string(
                abi.encodePacked(BASE64_ENCODED_SVG_PREFIX, svgBase64Encoded)
            );
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function mintNft(int256 highValue) public {
        s_tokenIdToHighValue[s_tokenCounter] = highValue;
        s_tokenCounter++;

        _safeMint(msg.sender, s_tokenCounter);

        emit CreatedNft(s_tokenCounter, highValue);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        if (!_exists(tokenId)) {
            revert ERC721Metadata__URI_QueryFor_NonExistentToken();
        }

        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        string memory imageUri = i_lowImageUri;
        if (price >= s_tokenIdToHighValue[tokenId]) {
            imageUri = i_highImageUri;
        }

        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(), // You can add whatever name here
                                '", "description":"An NFT that changes based on the Chainlink Feed", ',
                                '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                                imageUri,
                                '"}'
                            )
                        )
                    )
                )
            );
    }
}
