import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
// import DefaultFixture from './core_fixture';
import AddItemFixture from './deploy_items';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import { randomBytes } from 'crypto';
import { solidityKeccak256 } from 'ethers/lib/utils';

describe("Commit Item Deployment Test", () => {
    it("Confirm 11 Deployed Items", async() => {
        const { contract } = await loadFixture(AddItemFixture);
        expect(await contract.getNumberItems()).to.be.equal(12);
    })
    it("Should Mint Items for P1 and P2", async() => {
        const { contract, rng1, rng2 } = await loadFixture(AddItemFixture);
        await expect(contract.initialMint(rng1.address, {
            gasLimit: ethers.utils.hexlify(5000000)
        })).to.emit(contract, "NewPlayer");
        await expect(contract.initialMint(rng2.address, {
            gasLimit: ethers.utils.hexlify(5000000)
        })).to.emit(contract, "NewPlayer");
    })
    it("Should Allow Commit of Items 0 for P1 and 2 P2", async() => {
        const { contract: gameItems, contract2: battle, rng1, rng2 } = await loadFixture(AddItemFixture);
        await expect(gameItems.initialMint(rng1.address)).to.emit(gameItems, "NewPlayer");
        await expect(gameItems.initialMint(rng2.address)).to.emit(gameItems, "NewPlayer");
        
        const p1Hash: string = solidityKeccak256(['bytes32', 'uint256'], [randomBytes(32), BigNumber.from(0)]);
        const p2Hash: string =  solidityKeccak256(['bytes32', 'uint256'], [randomBytes(32), BigNumber.from(2)]);
        
        await expect(battle.connect(rng1).commitItem(p1Hash)).to.emit(battle, "Committed");
        await expect(battle.connect(rng2).commitItem(p2Hash)).to.emit(battle, "Committed");

        expect(await battle.callStatic.getCommitment(rng1.address)).to.be.equal(p1Hash);
        expect(await battle.callStatic.getCommitment(rng2.address)).to.be.equal(p2Hash);
    })
    
})