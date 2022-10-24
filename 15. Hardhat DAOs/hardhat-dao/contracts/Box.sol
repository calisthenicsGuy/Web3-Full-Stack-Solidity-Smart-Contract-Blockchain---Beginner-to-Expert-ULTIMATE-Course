// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Box is Ownable {
    uint256 private value;

    event ValueChanged(uint256 newValue);

    function stote(uint256 newValue) external {
        value = newValue;
        emit ValueChanged(value);
    }

    function retrive() public view returns (uint256) {
        return value;
    }
}
