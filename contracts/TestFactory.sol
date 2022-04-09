//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "./Test.sol";

contract TestFactory {
    Test[] public tests;
    event TestCreated(Test Test);

    function createTest(uint duration) external returns (Test) {
        require(
            duration >= 1 minutes,
            "Test duration is too short, minimum 1 minute"
        );

        Test newTest = new Test(duration);
        newTest.transferOwnership(msg.sender);
        tests.push(newTest);
        emit TestCreated(newTest);

        return newTest;
    }
}
