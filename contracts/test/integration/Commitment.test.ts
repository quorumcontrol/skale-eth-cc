import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
// import DefaultFixture from './core_fixture';
import AddItemFixture from './deploy_items';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import { randomBytes } from 'crypto';

describe("Commit Item Deployment Test", () => {
    it("Confirm 11 Deployed Items", async() => {
        const { contract } = await loadFixture(AddItemFixture);
        expect(await contract.getNumberItems()).to.be.equal(12);
    })
    it("Should Mint Items for P1 and P2", async() => {
        const { contract, rng1, rng2 } = await loadFixture(AddItemFixture);
        await expect(contract.initialMint(rng1.address)).to.emit(contract, "NewPlayer");
        await expect(contract.initialMint(rng2.address)).to.emit(contract, "NewPlayer");
    })
    it("Should Allow Commit of Items 0 for P1 and 2 P2", async() => {
        const { contract, contract2, rng1, rng2 } = await loadFixture(AddItemFixture);
        await expect(contract.initialMint(rng1.address)).to.emit(contract, "NewPlayer");
        await expect(contract.initialMint(rng2.address)).to.emit(contract, "NewPlayer");
        
        const p1Hash: string = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(randomBytes(32) + "+" + BigNumber.from(0)));
        const p2Hash: string = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(randomBytes(32) + "+" + BigNumber.from(2)));
        await expect(contract2.connect(rng1).commitItem(p1Hash, BigNumber.from(0))).to.emit(contract2, "Committed");
        await expect(contract2.connect(rng2).commitItem(p2Hash, BigNumber.from(0))).to.emit(contract2, "Committed");

        expect(await contract2.callStatic.getCommitment(rng1.address)).to.be.equal(p1Hash);
        expect(await contract2.callStatic.getCommitment(rng2.address)).to.be.equal(p2Hash);
    })
    
})