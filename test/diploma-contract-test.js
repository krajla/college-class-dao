const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Diploma", function () {
    it("Should create Diploma NFT and not be able to transfer", async function () {
        const [owner, other] = await ethers.getSigners();

        const DiplomaNft = await ethers.getContractFactory("DiplomaNft");
        const diplomaNft = await DiplomaNft.deploy();
        await diplomaNft.deployed();

        const tokenUri = "http://example.com"
        const trx = await diplomaNft.awardDiploma(other.address, tokenUri);
        await trx.wait();

        expect(await diplomaNft.supportsInterface(0x80ac58cd)).to.equal(true);
        expect(await diplomaNft.ownerOf(0x1)).to.equal(other.address);
        expect(await diplomaNft.balanceOf(other.address)).to.equal(1);
        await expect(diplomaNft.connect(other).transferFrom(other.address, owner.address, 0x1)).to.be.revertedWith("DiplomaNft: token can only be created for a recipient, and can not be transferred or burned");
    });
});