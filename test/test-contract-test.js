const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Factory", function () {
  it("Should create test and transfer ownership correctly", async function () {
    const TestFactory = await ethers.getContractFactory("TestFactory");
    const Test = await ethers.getContractFactory("Test");
    const testFactory = await TestFactory.deploy(10);
    await testFactory.deployed();

    const trx = await testFactory.createTest(1000);
    await trx.wait();

    const testAddr = await testFactory.tests(0);
    const test = await Test.attach(testAddr);

    expect(await test.duration()).to.equal(1000);

    [owner] = await ethers.getSigners();
    expect(await test.owner()).to.equal(owner.address);

    await expect(testFactory.createTest(1)).to.be.revertedWith("Test duration is too short");
  });
});

describe("States not end", function () {
  it("Start and check states correctly", async function () {
    const Test = await ethers.getContractFactory("Test");
    const test = await Test.deploy(10000000);
    await test.deployed();

    expect(await test.started()).to.equal(false);
    expect(await test.graded()).to.equal(false);
    await expect(test.getTestFile()).to.be.revertedWith("TestNotStarted");
    await expect(test.submitAnswers([ethers.utils.formatBytes32String('a')])).to.be.revertedWith("TestNotStarted");
    await expect(test.gradeTest([ethers.utils.formatBytes32String('a')])).to.be.revertedWith("TestNotStarted");

    const file = "randomFile"
    const trx = await test.startTest(file);
    await trx.wait();

    expect(await test.getTestFile()).to.equal(file);
    expect(await test.testEndTime()).to.not.equal(0);
    await expect(test.startTest(file)).to.be.revertedWith("TestAlreadyStarted");
    await expect(test.submitAnswers([ethers.utils.formatBytes32String('a')])).to.not.be.revertedWith("TestNotStarted");
    await expect(test.gradeTest([ethers.utils.formatBytes32String('a')])).to.be.revertedWith("TestNotEnded");
  });
});

describe("States with end", function () {
  it("Start and end check states correctly", async function () {
    const Test = await ethers.getContractFactory("Test");
    const test = await Test.deploy(1);
    await test.deployed();

    expect(await test.started()).to.equal(false);
    expect(await test.graded()).to.equal(false);
    await expect(test.getTestFile()).to.be.revertedWith("TestNotStarted");
    await expect(test.submitAnswers([ethers.utils.formatBytes32String('a')])).to.be.revertedWith("TestNotStarted");
    await expect(test.gradeTest([ethers.utils.formatBytes32String('a')])).to.be.revertedWith("TestNotStarted");

    const file = "randomFile"
    const trx = await test.startTest(file);
    await trx.wait();

    await delay(1000);

    expect(await test.getTestFile()).to.equal(file);
    expect(await test.testEndTime()).to.not.equal(0);
    await expect(test.startTest(file)).to.be.revertedWith("TestAlreadyStarted");
    await expect(test.submitAnswers([ethers.utils.formatBytes32String('a')])).to.be.revertedWith("TestAlreadyEnded");
    await expect(test.gradeTest([ethers.utils.formatBytes32String('a')])).to.not.be.revertedWith("TestNotEnded");
    await expect(test.gradeTest([ethers.utils.formatBytes32String('a')])).to.be.revertedWith("TestAlreadyGraded");
  });
});

describe("Grading", function () {
  it("Grade correctly", async function () {
    const Test = await ethers.getContractFactory("Test");
    const test = await Test.deploy(5);
    await test.deployed();

    const file = "randomFile"
    let trx = await test.startTest(file);
    await trx.wait();

    [owner, other] = await ethers.getSigners();
    trx = await test.submitAnswers([ethers.utils.formatBytes32String('a'), ethers.utils.formatBytes32String('b')]);
    await trx.wait()
    trx = await test.connect(other).submitAnswers([ethers.utils.formatBytes32String('a'), ethers.utils.formatBytes32String('a')]);
    await trx.wait()
    await delay(5100);

    trx = await test.gradeTest([ethers.utils.formatBytes32String('a'), ethers.utils.formatBytes32String('a')]);
    await trx.wait();

    expect(await test.getGrade(owner.address)).to.equal(50);
    expect(await test.getGrade(other.address)).to.equal(100);
  });
});

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}
