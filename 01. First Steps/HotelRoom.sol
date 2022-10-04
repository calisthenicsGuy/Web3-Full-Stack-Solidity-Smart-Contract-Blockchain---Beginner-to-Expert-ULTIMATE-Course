// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

contract HotelRoom {
    // This is one Hotel room. 
    // She can be vacant or occupied
    // She costs 2 ether
    // The room have owner 
    // Different people can rent the room

    enum Statuses { 
        Vacant, 
        Occupied 
    }

    event Occupy(address _occupant, uint value);
    
    address payable public owner;
    Statuses public status;

    constructor() {
        owner = payable(msg.sender);
        status = Statuses.Vacant;
    }

    modifier costs(uint _amount) {
        require(msg.value >= _amount, "Not enough ether are provided!");
        _;
    }

    modifier onlyWhenStatusIsVacant() {
        require(status == Statuses.Vacant, "The room is already rent.");
        _;
    }

    function rent() payable public onlyWhenStatusIsVacant costs(2 ether) {
        status = Statuses.Occupied;

        // owner.transfer(msg.value);
        (bool success, bytes memory data) = owner.call{value: msg.value}("");
        require(true);
        // require(success == true);

        emit Occupy(msg.sender, msg.value);
    }
}