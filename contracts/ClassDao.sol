//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "hardhat/console.sol";
import "./openzeppelin/Ownable.sol";
import "./TestFactory.sol";
import "./Test.sol";

contract ClassDao is Ownable {
    // student struct
    struct Student {
        address studentAddress;
        string name;
        uint[] grades;
        uint attendences;
    }

    string public className;
    address public professor;

    mapping(address => Student) students;
    address[] private studentIndex;

    Test[] public testsGiven;
    TestFactory private testFactory;

    event TestStarted(Test Test);

    /// Student not present
    error StudentMissing();

    modifier studentPresent(address student) {
        if (students[student].studentAddress == address(0)) {
            revert StudentMissing();
        }
        _;
    }

    constructor(string memory _className, TestFactory _testFactory) {
        professor = msg.sender;
        className = _className;
        testFactory = _testFactory;
        console.log("Class created: ", className);
    }

    function addStudent(address student, string memory name)
        external
        onlyOwner
    {
        require(student != address(0), "Student cannot be the zero address");
        require(
            students[student].studentAddress == address(0),
            "Student already registered"
        );
        require(bytes(name).length > 0, "Name cannot be empty");

        students[student].studentAddress = student;
        students[student].name = name;
        students[student].grades = new uint[](0);
        students[student].attendences = 0;
        studentIndex.push(student);

        console.log("Adding student:", name);
    }

    function addAttendence(address student)
        external
        onlyOwner
        studentPresent(student)
    {
        students[student].attendences++;
        console.log("Adding attendence");
    }

    function getStudent(address student)
        external
        view
        returns (Student memory)
    {
        Student memory studentInfo = students[student];
        studentInfo.grades = getStudentTestResults(student);

        return studentInfo;
    }

    function getStudentTestResults(address student)
        public
        view
        returns (uint[] memory)
    {
        uint[] memory results = new uint[](testsGiven.length);
        for (uint i = 0; i < testsGiven.length; i++) {
            Test test = testsGiven[i];
            results[i] = test.getGrade(student);
        }

        return results;
    }

    function startTest(string memory file, uint duration) external onlyOwner {
        require(bytes(file).length > 0, "Test file cannot be empty");

        Test test = testFactory.createTest(duration);
        test.startTest(file);
        testsGiven.push(test);

        emit TestStarted(test);
        console.log("Test started:", address(test));
    }
}
