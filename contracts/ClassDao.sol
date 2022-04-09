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

    function addGrade(address student, uint grade)
        external
        onlyOwner
        studentPresent(student)
    {
        students[student].grades.push(grade);
        console.log("Adding grade:", grade);
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
        return students[student];
    }

    function startTest(string memory file, uint duration)
        external
        onlyOwner
        returns (Test)
    {
        require(bytes(file).length > 0, "Test file cannot be empty");

        Test test = testFactory.createTest(duration);
        test.startTest(file);
        console.log("Test started:", address(test));

        return test;
    }
}
