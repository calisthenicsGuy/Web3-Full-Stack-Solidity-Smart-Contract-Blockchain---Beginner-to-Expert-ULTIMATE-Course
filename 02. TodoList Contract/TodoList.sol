// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

contract TodList {
    string public todoListName;

    struct Todo {
        string text;
        bool isCompleted;
    }

    Todo[] private todoList;

    constructor(string memory _todoListName) {
        todoListName = _todoListName;
    }

    function createTask(string calldata _text) external {
        todoList.push(Todo({text: _text, isCompleted: false}));
    }

    function getTask(uint _index) external view returns(string memory, bool) {
        Todo storage todo = todoList[_index];
        return (todo.text, todo.isCompleted);
    }

    modifier onlyNotCompletedTask(uint _index) {
        require(todoList[_index].isCompleted == false, "The task is already comletede");
        _;
    }

    function comleteTask(uint _index) external onlyNotCompletedTask(_index) {
        todoList[_index].isCompleted = true;
    }

    function editTask(uint _index, string memory _newText) external {
        todoList[_index].text = _newText;
    }

    function toggleTask(uint _index) external {
        todoList[_index].isCompleted = !todoList[_index].isCompleted;
    }
}