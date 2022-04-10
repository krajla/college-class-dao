const { ethers } = require("hardhat");

async function m() {
    const [owner, other] = await ethers.getSigners();

    const DiplomaNft = await ethers.getContractFactory("DiplomaNft");
    const diplomaNft = await DiplomaNft.deploy(owner.address);
    await diplomaNft.deployed();

    const tokenUri = "http://example.com"
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