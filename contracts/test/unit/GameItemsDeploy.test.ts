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

    describe("Deploy and Role Checks", () => {
        it("Should Assign ADMIN_ROLE to Owner", async() => {
          const { ADMIN_ROLE, contract, owner } = await loadFixture(deployContractFixture);
          expect(await contract.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
        })
        it("Should have Length of 1 for ADMIN_ROLE", async() => {
          const { ADMIN_ROLE, contract } = await loadFixture(deployContractFixture);
          expect(Number(await contract.callStatic.getRoleMemberCount(ADMIN_ROLE))).to.be.equal(1);
        })
        it("Should Assign MINTER_ROLE to Owner", async() => {
          const { MINTER_ROLE, contract, owner } = await loadFixture(deployContractFixture);
          expect(await contract.hasRole(MINTER_ROLE, owner.address)).to.be.true;
        })
        it("Should have Length of 1 for MINTER_ROLE", async() => {
          const { MINTER_ROLE, contract } = await loadFixture(deployContractFixture);
          expect(Number(await contract.callStatic.getRoleMemberCount(MINTER_ROLE))).to.be.equal(1);
        })
        it("Should Have Length of 0 for WIN_MANAGER_ROLE", async() => {
          const { WIN_MANAGER_ROLE, contract } = await loadFixture(deployContractFixture);
          expect(Number(await contract.callStatic.getRoleMemberCount(WIN_MANAGER_ROLE))).to.be.equal(0);
        })
    })
    describe("Conference Checks", () => {
        it("Transfer Should be Locked", async() => {
            const { contract } = await loadFixture(deployContractFixture);
            expect(await contract.callStatic.isLocked()).to.be.equal(new Date().getTime() / 1000 < 1658451660 ? true : false);
        })
        it("Should have Unlock Date === 1658451660", async() => {
          const { contract } = await loadFixture(deployContractFixture);
          expect(await contract.callStatic.getUnlockDate()).to.be.equal(1658451660);
        })
    })
    describe("Default Metadata", () => {
      it("GetItems Function Length of 3", async() =>{
        const { contract } = await loadFixture(deployContractFixture);
        const items = await contract.callStatic.getItems("0x0000000000000000000000000000000001000001");
        expect(items.length).to.be.equal(3);
      })
      it("Should Provide Empty Fields", async() => {
        const { contract } = await loadFixture(deployContractFixture);
        const items = await contract.callStatic.getItems("0x0000000000000000000000000000000001000001");
        for (const item of items) {
          expect(item[0]).to.be.equal('');
          expect(item[0]).lengthOf(0);
          expect(item[1]).to.be.equal('');
          expect(item[1]).lengthOf(0);
          expect(item[2]).to.be.equal('');
          expect(item[2]).lengthOf(0);
          expect(item[3]).to.be.equal('');
          expect(item[3]).lengthOf(0);
        }
      })
    })
})