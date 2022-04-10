//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./TestFactory.sol";
import "./Test.sol";
import "./DiplomaNft.sol";

contract ClassDao is Ownable {
    // student struct
    struct Student {
        address studentAddress;
        string name;
        uint256[] grades;
        uint256 attendence;
    }

    string public className;
    address public professor;
    uint256 public classEndTime;
    bool public graduated;

    mapping(address => Student) students;
    address[] private studentIndex;

    Test[] public testsGiven;
    DiplomaNft public diplomaNft;
    TestFactory private testFactory;

    event TestStarted(Test Test);

    event ClassGraduated();

    event StudentGraduated(
        address studentAddress,
        uint256 diploma,
        uint256 grade
    );

    /// The class has ended
    error ClassHasEnded(uint256 endTime);

    /// The class has not ended yet
    error ClassNotEndedYet(uint256 endTime);

    constructor(
        string memory _className,
        TestFactory _testFactory,
        uint256 duration
    ) {
        require(bytes(_className).length > 0, "Class name cannot be empty");
        require(duration > 1 days, "Class duration must be at least 1 day");

        professor = msg.sender;
        className = _className;
        classEndTime = block.timestamp + duration;
        testFactory = _testFactory;
        diplomaNft = new DiplomaNft();
        console.log("Class created: ", className);
    }

    modifier hasEnded() {
        if (block.timestamp < classEndTime) {
            revert ClassHasEnded(classEndTime);
        }
        _;
    }

    modifier notEnded() {
        if (block.timestamp >= classEndTime) {
            revert ClassNotEndedYet(classEndTime);
        }
        _;
    }

    function addStudent(address student, string memory name)
        external
        onlyOwner
        notEnded
    {
        require(student != address(0), "Student cannot be the zero address");
        require(
            students[student].studentAddress == address(0),
            "Student already registered"
        );
        require(bytes(name).length > 0, "Name cannot be empty");

        students[student].studentAddress = student;
        students[student].name = name;
        students[student].grades = new uint256[](0);
        students[student].attendence = 0;
        studentIndex.push(student);

        console.log("Adding student:", name);
    }

    function addAttendence(address[] memory studentAtt)
        external
        onlyOwner
        notEnded
    {
        require(studentAtt.length > 0, "No students given");
        for (uint256 i = 0; i < studentAtt.length; i++) {
            if (
                studentAtt[i] != address(0) &&
                students[studentAtt[i]].studentAddress != address(0)
            ) {
                students[studentAtt[i]].attendence++;
            }
        }

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
        returns (uint256[] memory)
    {
        uint256[] memory results = new uint256[](testsGiven.length);
        for (uint256 i = 0; i < testsGiven.length; i++) {
            Test test = testsGiven[i];
            results[i] = test.getGrade(student);
        }

        return results;
    }

    function getStudentAverage(address student) public view returns (uint256) {
        uint256 avg = 0;
        uint256[] memory results = getStudentTestResults(student);
        for (uint256 i = 0; i < results.length; i++) {
            avg += (results[i] / results.length);
        }

        return avg;
    }

    function startTest(string memory file, uint256 duration)
        external
        onlyOwner
        notEnded
    {
        require(bytes(file).length > 0, "Test file cannot be empty");

        Test test = testFactory.createTest(duration);
        test.startTest(file);
        test.transferOwnership(professor);
        testsGiven.push(test);

        emit TestStarted(test);
        console.log("Test started:", address(test));
    }

    function endClassAndGraduate() external onlyOwner hasEnded {
        require(!graduated, "Class already graduated");
        graduated = true;

        for (uint256 i = 0; i < studentIndex.length; i++) {
            address student = studentIndex[i];
            Student memory studentInfo = students[student];
            uint256 grade = getStudentAverage(student);

            if (doesStudentPass(grade, studentInfo.attendence)) {
                // Create diploma
                uint256 diplomaId = diplomaNft.awardDiploma(
                    student,
                    "http://example.com"
                );
                emit StudentGraduated(student, diplomaId, grade);
                console.log("Student graduated:", studentInfo.name);
            }
        }

        emit ClassGraduated();
        console.log("Class graduated:", className);
    }

    function doesStudentPass(uint256 grade, uint256 attendence)
        internal
        pure
        returns (bool)
    {
        return (grade >= 50 && attendence >= 8);
    }

    // @dev Helper function verify if a student nft diploma attests to this class
    function hasStudentGraduated(address student) public view returns (bool) {
        return diplomaNft.balanceOf(student) > 0;
    }
}
