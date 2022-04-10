const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Add Student", function () {
    it("Create DAO and add student", async function () {
        const TestFactory = await hre.ethers.getContractFactory("TestFactory");
        const testFactory = await TestFactory.deploy(1);
        await testFactory.deployed();

        const className = "Smekeria";
        const ClassDao = await hre.ethers.getContractFactory("ClassDao");
        const classDao = await ClassDao.deploy(className, testFactory.address, 100000);
        await classDao.deployed();

        [owner, other] = await ethers.getSigners();
        expect(await classDao.className()).to.equal(className);
        expect(await classDao.professor()).to.equal(owner.address);

        const studentName = "Dorian Popa"
        let trx = await classDao.addStudent(other.address, studentName);
        await trx.wait();

        trx = await classDao.addAttendence([other.address]);
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
        const classDao = await ClassDao.deploy(className, testFactory.address, 100000);
        await classDao.deployed();

        [owner, other] = await ethers.getSigners();
        const studentName = "Dorian Popa"

        await expect(classDao.connect(other).addAttendence([other.address])).to.be.revertedWith("Ownable: caller is not the owner");
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
        const classDao = await ClassDao.deploy(className, testFactory.address, 100000);
        await classDao.deployed();

        [owner, other] = await ethers.getSigners();
        expect(await classDao.className()).to.equal(className);
        expect(await classDao.professor()).to.equal(owner.address);

        const studentName = "Dorian Popa"
        let trx = await classDao.addStudent(other.address, studentName);
        await trx.wait();

        trx = await classDao.addAttendence([other.address]);
        await trx.wait();

        const studentInfo = await classDao.getStudent(other.address)
        expect(studentInfo.studentAddress).to.equal(other.address);
        expect(studentInfo.name).to.equal(studentName);
        expect(studentInfo.attendence).to.equal(1);
    });
});

describe("Start Test", function () {
    it("Start test and grade", async function () {
        const TestFactory = await hre.ethers.getContractFactory("TestFactory");
        const testFactory = await TestFactory.deploy(1);
        await testFactory.deployed();

        const className = "Smekeria";
        const ClassDao = await hre.ethers.getContractFactory("ClassDao");
        const classDao = await ClassDao.deploy(className, testFactory.address, 100000);
        await classDao.deployed();

        [owner, other] = await ethers.getSigners();
        const studentName = "Dorian Popa"
        let trx = await classDao.addStudent(other.address, studentName);
        await trx.wait();

        const file = "randFile";
        trx = await classDao.startTest(file, 10);
        await trx.wait();

        const test = await classDao.testsGiven(0);
        const testContract = await ethers.getContractAt("Test", test);
        expect(await testContract.getTestFile()).to.equal(file);

        trx = await testContract.connect(other).submitAnswers([ethers.utils.formatBytes32String('a'), ethers.utils.formatBytes32String('a')]);
        await trx.wait()

        await ethers.provider.send("evm_increaseTime", [10]);
        await ethers.provider.send("evm_mine");

        trx = await testContract.gradeTest([ethers.utils.formatBytes32String('a'), ethers.utils.formatBytes32String('a')]);
        await trx.wait();

        const studentInfo = await classDao.getStudent(other.address)
        expect(studentInfo.studentAddress).to.equal(other.address);
        expect(studentInfo.name).to.equal(studentName);
        expect(studentInfo.grades[0]).to.equal(100);
        expect(studentInfo.attendence).to.equal(0);
    });
});

describe("Graduate", function () {
    it("Go through a class dao lifecycle ending in graduation", async function () {
        const TestFactory = await hre.ethers.getContractFactory("TestFactory");
        const testFactory = await TestFactory.deploy(1);
        await testFactory.deployed();

        const className = "Smekeria";
        const ClassDao = await hre.ethers.getContractFactory("ClassDao");
        const classDao = await ClassDao.deploy(className, testFactory.address, 100000);
        await classDao.deployed();

        [owner, other, other2, other3] = await ethers.getSigners();
        const studentName = "Dorian Popa"
        const student2Name = "Mozzard Amadeus";
        const student3Name = "Nicolae Guță";

        let trx = await classDao.addStudent(other.address, studentName);
        await trx.wait();
        trx = await classDao.addStudent(other2.address, student2Name);
        await trx.wait();
        trx = await classDao.addStudent(other3.address, student3Name);
        await trx.wait();

        const file = "randFile";
        trx = await classDao.startTest(file, 5);
        await trx.wait();

        const test = await classDao.testsGiven(0);
        const testContract = await ethers.getContractAt("Test", test);
        expect(await testContract.getTestFile()).to.equal(file);

        trx = await testContract.connect(other).submitAnswers([ethers.utils.formatBytes32String('a'), ethers.utils.formatBytes32String('a'), ethers.utils.formatBytes32String('a')]);
        await trx.wait()
        trx = await testContract.connect(other2).submitAnswers([ethers.utils.formatBytes32String('a'), ethers.utils.formatBytes32String('b'), ethers.utils.formatBytes32String('b')]);
        await trx.wait()
        trx = await testContract.connect(other3).submitAnswers([ethers.utils.formatBytes32String('a'), ethers.utils.formatBytes32String('a'), ethers.utils.formatBytes32String('a')]);
        await trx.wait()

        await ethers.provider.send("evm_increaseTime", [10]);
        await ethers.provider.send("evm_mine");

        trx = await testContract.gradeTest([ethers.utils.formatBytes32String('a'), ethers.utils.formatBytes32String('a'), ethers.utils.formatBytes32String('a')]);
        await trx.wait();

        for (let i = 0; i < 8; i++) {
            trx = await classDao.addAttendence([other2.address, other3.address]);
            await trx.wait();
        }

        await ethers.provider.send("evm_increaseTime", [100000]);
        await ethers.provider.send("evm_mine");

        trx = await classDao.endClassAndGraduate();
        await trx.wait();

        expect(await classDao.graduated()).to.equal(true);
        expect(await classDao.hasStudentGraduated(other.address)).to.equal(false);
        expect(await classDao.hasStudentGraduated(other2.address)).to.equal(false);
        expect(await classDao.hasStudentGraduated(other3.address)).to.equal(true);

        const nftAddress = await classDao.diplomaNft();
        const diplomaNft = await ethers.getContractAt("DiplomaNft", nftAddress);

        expect(await diplomaNft.balanceOf(other.address)).to.equal(0);
        expect(await diplomaNft.balanceOf(other2.address)).to.equal(0);
        expect(await diplomaNft.balanceOf(other3.address)).to.equal(1);
    });
});