import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';

describe("Game Items Deployment Test", () => {
    async function deployContractFixture() {

        const [ owner ] = await ethers.getSigners();

        const factory = await ethers.getContractFactory("GameItems");
        const contract = await factory.deploy();
        await contract.deployed();

        const ADMIN_ROLE: string = await contract.callStatic.ADMIN_ROLE();
        const WIN_MANAGER_ROLE: string = await contract.callStatic.WIN_MANAGER_ROLE();
        const MINTER_ROLE: string = await contract.callStatic.MINTER_ROLE();

        return { factory, contract, owner, ADMIN_ROLE, WIN_MANAGER_ROLE, MINTER_ROLE }
    }

    xdescribe("Deploy and Role Checks", () => {
        xit("Should Assign ADMIN_ROLE to Owner", async() => {
          const { ADMIN_ROLE, contract, owner } = await loadFixture(deployContractFixture);
          expect(await contract.hasRole(ADMIN_ROLE, owner).to.be.true);
        })
        xit("Should have Length of 1 for ADMIN_ROLE", async() => {
          const { ADMIN_ROLE, contract } = await loadFixture(deployContractFixture);
          expect(Number(await contract.callStatic.getRoleMemberCount(ADMIN_ROLE))).to.be.equal(1);
        })
        xit("Should Assign MINTER_ROLE to Owner", async() => {
          const { MINTER_ROLE, contract, owner } = await loadFixture(deployContractFixture);
          expect(await contract.hasRole(MINTER_ROLE, owner).to.be.true);
        })
        xit("Should have Length of 1 for MINTER_ROLE", async() => {
          const { MINTER_ROLE, contract } = await loadFixture(deployContractFixture);
          expect(Number(await contract.callStatic.getRoleMemberCount(MINTER_ROLE))).to.be.equal(1);
        })
        xit("Should Have Length of 0 for WIN_MANAGER_ROLE", async() => {
          const { WIN_MANAGER_ROLE, contract } = await loadFixture(deployContractFixture);
          expect(Number(await contract.callStatic.getRoleMemberCount(WIN_MANAGER_ROLE))).to.be.equal(1);
        })
    })
    xdescribe("Conference Checks", () => {
        it("Transfer Should be Locked", async() => {
            const { contract } = await loadFixture(deployContractFixture);
            expect(await contract.callStatic.isLocked()).to.be.true;
        })
        // xit("Transfer Should be locked until X", async() => {
        //     const { contract } = await loadFixture(deployContractFixture);
        //     expect(await contract.callStatic.lockedUntil()).to.be.equal
        // })
    })
})