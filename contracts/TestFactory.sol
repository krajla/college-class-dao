//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "./Test.sol";

contract TestFactory {
    Test[] public tests;
    uint public minTestDuration;

    event TestCreated(Test Test);

    constructor(uint _minTestDuration) {
        minTestDuration = _minTestDuration;
    }

    function createTest(uint duration) external returns (Test) {
        require(duration >= minTestDuration, "Test duration is too short");

        Test newTest = new Test(duration);
        newTest.transferOwnership(msg.sender);
        tests.push(newTest);
        emit TestCreated(newTest);

        return newTest;
    }
}
