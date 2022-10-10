// SPDX-License-Identifier: MIT
// 1. Pragma
pragma solidity 0.8.7;

// 2. Imports
import "./PriceConverter.sol";

// 3. Errors
error FundMe__NotOwner();

// 4. Interfaces, Libraries

// 5. Contracts

/// @title A contrcat for crowd funding
/// @author Radoslav Radev
/// @notice  This contract is deom a sample funding contract
/// @dev This implemets price feeds as library
contract FundMe {
    // 1. Type declaration
    using PriceConverter for uint256;

    // 2. State Variables
    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funders;
    address public immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;
    AggregatorV3Interface private s_priceFeed;

    // 3. Events and modifiers
    modifier onlyOwner {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    // 4. Functions
    //// constructor
    //// receive
    //// fallback
    //// external 
    //// public
    //// inernal
    //// private
    //// view / pure

    constructor(address s_priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(s_priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \ 
    //         yes  no
    //         /     \
    //    receive()?  fallback() 
    //     /   \ 
    //   yes   no
    //  /        \
    //receive()  fallback()

    function fund() public payable {
        require(msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD, "You need to spend more ETH!");
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }
    
    function withdraw() public onlyOwner {
        address[] memory funders = s_funders;

        for (uint256 funderIndex=0; funderIndex < funders.length; funderIndex++){
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    // View / Pure Functions
    function getFunder(uint256 index) view returns(address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(address _funder) view returns(uint256) {
        return s_addressToAmountFunded[_funder];
    }

    function getPriceFeed() view returns(AggregatorV3Interface) {
        return s_priceFeed;
    }
}