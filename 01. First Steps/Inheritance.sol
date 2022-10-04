// SPDX-License-Identifier: MID
pragma solidity ^0.8.8;

contract Ownable {
    address owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "must be owner");
        _;
    }
}

contract SecretVault {
    string secret;

    constructor(string memory _secret) {
        _secret = secret;
    }

    function viewSecret() public view returns(string memory) {
        return secret;
    }
}

contract MyContarct is Ownable {
    address secretVault;

    constructor(string memory _secret) {
        SecretVault _secretVault = new SecretVault(_secret);
        secretVault = address(_secretVault);
        super;
    }

    function viewSecret() public view onlyOwner returns(string memory) {
        return SecretVault(secretVault).viewSecret();
    }
}