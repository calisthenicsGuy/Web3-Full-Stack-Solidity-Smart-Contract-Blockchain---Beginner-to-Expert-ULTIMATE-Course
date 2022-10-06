// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

contract ConditionalsAndLoops {
    uint256[] array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    function viewSumOfEvenNumbersFromArray() public view returns(uint256) {
        uint256 sum = 0;

        for(uint256 i = 0; i < array.length; i++) {
            if (array[i] % 2 == 0) {
                sum += array[i];
            }
        }

        return sum;
    }
    
    function checkIfNumberIsEven(uint256 _num) public pure returns(bool) {
        if (_num % 2 == 0) {
            return true;
        } else {
            return false;
        }
    }
}