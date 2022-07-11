import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';
import deployRandom from '../helpers/deployRandomGenerator';

describe("Battle Deployment Test", () => {
    

    async function deployContractFixture() {

        const [ owner, rng1, rng2 ] = await ethers.getSigners();
        
        const rnd = await deployRandom()

        const factory = await ethers.getContractFactory("GameItems");
        const contract = await factory.deploy(rnd.address);
        await contract.deployed();

        const ADMIN_ROLE: string = await contract.callStatic.ADMIN_ROLE();
        const WIN_MANAGER_ROLE: string = await contract.callStatic.WIN_MANAGER_ROLE();
        const MINTER_ROLE: string = await contract.callStatic.MINTER_ROLE();

        const factory2 = await ethers.getContractFactory("Battle");
        const contract2 = await factory2.deploy(contract.address);
        await contract2.deployed();

        return { factory, contract, contract2, owner, ADMIN_ROLE, WIN_MANAGER_ROLE, MINTER_ROLE, rng1, rng2 };
    }

    describe("Initial Setup of WIN_MANAGER_ROLE on Battle", () => {
        it("Should Allow Owner to Assign Role", async() => {
            const { contract, contract2, WIN_MANAGER_ROLE } = await loadFixture(deployContractFixture);
            expect(await contract.grantRole(WIN_MANAGER_ROLE, contract2.address)).to.be.ok;
            expect(await contract.callStatic.hasRole(WIN_MANAGER_ROLE, contract2.address)).to.be.equal(true);
        })
        it("Should have Game Items Contract Set", async() => {
            const { contract, contract2 } = await loadFixture(deployContractFixture);
            expect(await contract2.callStatic.getGameItemContract()).to.be.equal(contract.address);
        })
        it("Commitment Should Be Empty", async() => {
            const EMPTY_COMMIT: string = "0x0000000000000000000000000000000000000000000000000000000000000000";
            const { contract2, rng1, rng2 } = await loadFixture(deployContractFixture);
            const commit1 = await contract2.callStatic.getCommitment(rng1.address);
            const commit2 = await contract2.callStatic.getCommitment(rng2.address);
            expect(commit1).to.be.equal(EMPTY_COMMIT);
            expect(commit2).to.be.equal(EMPTY_COMMIT);
        })
        it("Record Should Be Empty", async() => {
            const EMPTY_RECORD: BigNumber = BigNumber.from(0);
            const { contract2, rng1, rng2 } = await loadFixture(deployContractFixture);
            const record1 = await contract2.callStatic.getRecord(rng1.address);
            const record2 = await contract2.callStatic.getRecord(rng2.address);
            expect(record1).to.be.length(4);
            expect(record2).to.be.length(4);
            expect(record1[0]).to.be.equal(EMPTY_RECORD);
            expect(record1[1]).to.be.equal(EMPTY_RECORD);
            expect(record1[2]).to.be.equal(EMPTY_RECORD);
            expect(record1[3]).to.be.equal(EMPTY_RECORD);
            expect(record2[0]).to.be.equal(EMPTY_RECORD);
            expect(record2[1]).to.be.equal(EMPTY_RECORD);
            expect(record2[2]).to.be.equal(EMPTY_RECORD);
            expect(record2[3]).to.be.equal(EMPTY_RECORD);
        })
    })
})