const { ethers } = require("hardhat");

async function m() {
    const DiplomaNft = await ethers.getContractFactory("DiplomaNft");
    const diplomaNft = await DiplomaNft.deploy();
    await diplomaNft.deployed();

    const tokenUri = "http://example.com"
    const [owner, other] = await ethers.getSigners();
    const trx = await diplomaNft.awardDiploma(other.address, tokenUri);
    await trx.wait();

    console.log(await diplomaNft.supportsInterface(0x80ac58cd))
    console.log(await diplomaNft.balanceOf(other.address))
    await diplomaNft.connect(other).transferFrom(other.address, owner.address, 0x1)
}

m().catch(console.error);

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}