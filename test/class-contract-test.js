const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Add Student", function () {
    it("Create DAO and add student", async function () {
        const TestFactory = await hre.ethers.getContractFactory("TestFactory");
        const testFactory = await TestFactory.deploy(1);
        await testFactory.deployed();

        const className = "Smekeria";
        const ClassDao = await hre.ethers.getContractFactory("ClassDao");
        const classDao = await ClassDao.deploy(className, testFactory.address);
        await classDao.deployed();

        [owner, other] = await ethers.getSigners();
        expect(await classDao.className()).to.equal(className);
        expect(await classDao.professor()).to.equal(owner.address);

        const studentName = "Dorian Popa"
        let trx = await classDao.addStudent(other.address, studentName);
        await trx.wait();

        trx = await classDao.addAttendence(other.address);
        await trx.wait();

        const studentInfo = await classDao.getStudent(other.address)
        expect(studentInfo[0]).to.equal(other.address);
        expect(studentInfo[1]).to.equal(studentName);
        expect(studentInfo[3]._hex).to.equal("0x01");
    });
});

describe("Check guards", function () {
    it("Create DAO and check guards", async function () {
        const TestFactory = await hre.ethers.getContractFactory("TestFactory");
        const testFactory = await TestFactory.deploy(1);
        await testFactory.deployed();

        const className = "Smekeria";
        const ClassDao = await hre.ethers.getContractFactory("ClassDao");
        const classDao = await ClassDao.deploy(className, testFactory.address);
        await classDao.deployed();

        [owner, other] = await ethers.getSigners();
        const studentName = "Dorian Popa"

        await expect(classDao.connect(other).addAttendence(other.address)).to.be.revertedWith("Ownable: caller is not the owner");
        await expect(classDao.connect(other).startTest("a", 1)).to.be.revertedWith("Ownable: caller is not the owner");
        await expect(classDao.connect(other).addStudent(other.address, studentName)).to.be.revertedWith("Ownable: caller is not the owner");
        await expect(classDao.addStudent(other.address, '')).to.be.revertedWith("Name cannot be empty");

        let trx = await classDao.addStudent(other.address, studentName);
        await trx.wait();
        await expect(classDao.addStudent(other.address, studentName)).to.be.revertedWith("Student already registered");
    });
});

describe("Add Student", function () {
    it("Create DAO and add student", async function () {
        const TestFactory = await hre.ethers.getContractFactory("TestFactory");
        const testFactory = await TestFactory.deploy(1);
        await testFactory.deployed();

        const className = "Smekeria";
        const ClassDao = await hre.ethers.getContractFactory("ClassDao");
        const classDao = await ClassDao.deploy(className, testFactory.address);
        await classDao.deployed();

        [owner, other] = await ethers.getSigners();
        expect(await classDao.className()).to.equal(className);
        expect(await classDao.professor()).to.equal(owner.address);

        const studentName = "Dorian Popa"
        let trx = await classDao.addStudent(other.address, studentName);
        await trx.wait();

        trx = await classDao.addAttendence(other.address);
        await trx.wait();

        const studentInfo = await classDao.getStudent(other.address)
        expect(studentInfo.studentAddress).to.equal(other.address);
        expect(studentInfo.name).to.equal(studentName);
        expect(studentInfo.attendences._hex).to.equal("0x01");
    });
});

describe("Start Test", function () {
    it("Start test and grade", async function () {
        const TestFactory = await hre.ethers.getContractFactory("TestFactory");
        const testFactory = await TestFactory.deploy(1);
        await testFactory.deployed();

        const className = "Smekeria";
        const ClassDao = await hre.ethers.getContractFactory("ClassDao");
        const classDao = await ClassDao.deploy(className, testFactory.address);
        await classDao.deployed();

        [owner, other] = await ethers.getSigners();
        const studentName = "Dorian Popa"
        let trx = await classDao.addStudent(other.address, studentName);
        await trx.wait();

        const file = "randFile";
        trx = await classDao.startTest(file, 3);
        await trx.wait();

        const test = await classDao.testsGiven(0);
        const testContract = await ethers.getContractAt("Test", test);
        expect(await testContract.getTestFile()).to.equal(file);

        trx = await testContract.connect(other).submitAnswers([ethers.utils.formatBytes32String('a'), ethers.utils.formatBytes32String('a')]);
        await trx.wait()
        await delay(3100);

        trx = await testContract.gradeTest([ethers.utils.formatBytes32String('a'), ethers.utils.formatBytes32String('a')]);
        await trx.wait();

        const studentInfo = await classDao.getStudent(other.address)
        expect(studentInfo.studentAddress).to.equal(other.address);
        expect(studentInfo.name).to.equal(studentName);
        expect(studentInfo.grades[0]._hex).to.equal("0x02");
        expect(studentInfo.attendences._hex).to.equal("0x00");
    });
});

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}