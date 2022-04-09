//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "./openzeppelin/Ownable.sol";

contract Test is Ownable {
    struct Submission {
        bytes32[] answers;
        bool exists;
    }

    uint public duration;
    uint public testEndTime;
    bool public started;
    bool public graded;

    string private file;
    address[] private studentIndex;
    mapping(address => Submission) submissions;
    mapping(address => uint) grades;

    event TestGraded();

    /// The Test has already ended
    error TestAlreadyEnded(uint endTime);

    /// The Test has not yet ended
    error TestNotEnded(uint endTime);

    /// The Test is already graded
    error TestAlreadyGraded();

    /// The Test is not yet graded
    error TestNotGraded();

    /// The Test has not yet started
    error TestNotStarted();

    /// The Test has already started
    error TestAlreadyStarted();

    constructor(uint _duration) {
        duration = _duration;
        started = false;
        graded = false;
    }

    modifier hasStarted() {
        if (!started) {
            revert TestNotStarted();
        }
        _;
    }

    modifier notStarted() {
        if (started) {
            revert TestAlreadyStarted();
        }
        _;
    }

    modifier hasEnded() {
        if (block.timestamp < testEndTime) {
            revert TestNotEnded(testEndTime);
        }
        _;
    }

    modifier notEnded() {
        if (block.timestamp >= testEndTime) {
            revert TestAlreadyEnded(testEndTime);
        }
        _;
    }

    modifier hasGraded() {
        if (!graded) {
            revert TestNotGraded();
        }
        _;
    }

    modifier notGraded() {
        if (graded) {
            revert TestAlreadyGraded();
        }
        _;
    }

    function startTest(string memory _file) external onlyOwner notStarted {
        testEndTime = block.timestamp + duration;
        file = _file;
        started = true;
    }

    function getTestFile() external view hasStarted returns (string memory) {
        return file;
    }

    function submitAnswers(bytes32[] memory submission)
        external
        hasStarted
        notEnded
    {
        require(
            !submissions[msg.sender].exists,
            "Student has already submitted"
        );
        submissions[msg.sender].answers = submission;
        submissions[msg.sender].exists = true;
        studentIndex.push(msg.sender);
    }

    function gradeTest(bytes32[] memory correctResponses)
        external
        onlyOwner
        hasStarted
        hasEnded
        notGraded
    {
        // grade the sumbissions of every student
        for (uint i = 0; i < studentIndex.length; i++) {
            address student = studentIndex[i];
            bytes32[] memory answers = submissions[student].answers;
            uint grade = 0;
            for (uint j = 0; j < answers.length; j++) {
                if (answers[j] == correctResponses[j]) {
                    grade++;
                }
            }
            grades[student] = grade;
        }

        graded = true;
        emit TestGraded();
    }

    function getGrade(address student) external view hasGraded returns (uint) {
        return grades[student];
    }
}
