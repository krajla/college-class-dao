//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "hardhat/console.sol";

contract ClassDao {
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

    /// The function can only be called by the professor
    error NotProfessor();

    /// Student not present
    error StudentMissing();

    modifier onlyProfessor() {
        if (msg.sender != professor) {
            revert NotProfessor();
        }
        _;
    }

    modifier studentPresent(address student) {
        if (students[student].studentAddress == address(0)) {
            revert StudentMissing();
        }
        _;
    }

    constructor(string memory _className) {
        professor = msg.sender;
        className = _className;
        console.log("Class created: ", className);
    }

    function addStudent(address student, string memory name)
        external
        onlyProfessor
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
        onlyProfessor
        studentPresent(student)
    {
        students[student].grades.push(grade);
        console.log("Adding grade:", grade);
    }

    function addAttendence(address student)
        external
        onlyProfessor
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
}
