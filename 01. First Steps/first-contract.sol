// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

contract FirstContract {
    // boolean, uint, int, address, bytes
    // bool hasFavoriteNumber = true;
    // string favoriteNumberInText = "13"'
    // int256 favoriteInt = -1;
    // bytes32 favoriteBytse = "cat";
    // uint favoriteNumber = 13;

    uint256 private favoriteNumber;

    function setFavoriteNumber(uint256 _favoriteNumber) public {
        favoriteNumber = _favoriteNumber;
    }

    // when we read from blockchain we do not spend any gas, but if we call view or pure function from 'gas price function' we will pay also for view or pure functions

    // view function 
    function viewFavoriteNumber() public view returns(uint256) {
        return favoriteNumber;
    }

    // pure function
    function add() public pure returns(uint256) {
        return(1 + 1);
    }

    // arrays and data structures
    struct Person {
        string name;
        uint256 age;
        uint256 favoriteNumber;
        string favoriteColor;
    }

    // Person public person1 = Person({ name: "Rado", age: 16, favoriteNumber: 3, favoriteColor: "red"});

    Person[] private people;

    // mappings
    mapping(string => uint256) public nameToFavNumber;

    function addPerson(string memory _name, uint256 _age, uint256 _favoriteNumber, string memory _favoriteColor) public {
        people.push(Person({name: _name, age: _age, favoriteNumber: _favoriteNumber, favoriteColor: _favoriteColor}));
        nameToFavNumber[_name] = _age;
    }

    function viewParticularPersonName(uint256 _index) public view returns(string memory) {
        return people[_index].name;
    }

    // calldata: memory type that can't be changed
    // memory: memory type that can be changed
    // storage: type that create new type instance of given struct type but they are have same reference 
}