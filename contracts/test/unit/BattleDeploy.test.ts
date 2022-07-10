import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';

describe("Battle Deployment Test", () => {
    

    async function deployContractFixture() {

        const [ owner, rng1, rng2 ] = await ethers.getSigners();
        
        const factory = await ethers.getContractFactory("GameItems");
        const contract = await factory.deploy();
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
    })
})