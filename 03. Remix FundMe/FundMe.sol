// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import './PriceConverter.sol';

error NotOwner();
error NotEnoughAmount();

contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 50;
    address public immutable i_owner;

    address[] public funders;
    mapping(address => uint256) addressToAmountFunded;

    constructor() {
        i_owner = msg.sender;
    }

    modifier onlyMinimumAmountOfUsd () {
        // if (msg.value.getConversionRate() < MINIMUM_USD) { revert NotEnoughAmount(); }
        require(msg.value.getConversionRate() > MINIMUM_USD, "Didn't sent enough!");
        _;
    }

    function fund() public payable onlyMinimumAmountOfUsd() {
        // Want to be able to sent a mimimum fund amount in USD
        addressToAmountFunded[msg.sender] += msg.value;
        funders.push(msg.sender);
    }

    modifier onlyOwner() {
      // if (msg.sender != i_owner) { revert NotOwner(); }
      require(msg.sender == i_owner, "Only owner of the contract can execute this function!");
      _;
    }

    function withdraw() public onlyOwner() {
      for (uint256 i = 0; i < funders.length; i++) {
        addressToAmountFunded[funders[i]] = 0;
      }

      funders = new address[](0);

      // // transfer
        // payable(msg.sender).transfer(address(this).balance);
      // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
      // // call
      (bool isSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
      require(isSuccess, "Call failed");
    }

    function getVersion() public view returns(uint256) {
        return AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e).version();
    }
}