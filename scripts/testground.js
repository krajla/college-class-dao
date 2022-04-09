const { ethers } = require("hardhat");

async function m() {
    const TestFactory = await ethers.getContractFactory("TestFactory");
    const testFactory = await TestFactory.deploy(1);
    await testFactory.deployed();

    const className = "Smekeria";
    const ClassDao = await ethers.getContractFactory("ClassDao");
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
    console.log(test);
    const testContract = await ethers.getContractAt("Test", test);

    trx = await testContract.connect(other).submitAnswers([ethers.utils.formatBytes32String('a'), ethers.utils.formatBytes32String('a')]);
    await trx.wait()
    await delay(3100);

    trx = await testContract.gradeTest([ethers.utils.formatBytes32String('a'), ethers.utils.formatBytes32String('a')]);
    await trx.wait();

    const studentInfo = await classDao.getStudent(other.address)
    console.log(studentInfo.grades);
    console.log(studentInfo.name);
}

m().catch(console.error);

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}