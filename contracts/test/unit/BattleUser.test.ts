import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';
import { BigNumber, Contract } from 'ethers';
import { randomBytes } from 'crypto';

describe("Battle - User Testing", () => {

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
    it("Should Not Allow Player To Commit Tokens 0-11", async() => {
        const { contract2, rng1 } = await loadFixture(deployContractFixture);
        const _contract: Contract = contract2.connect(rng1);
        await expect(_contract.commitItem(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(randomBytes(32) + "+" + BigNumber.from(0))), BigNumber.from(0))).to.be.revertedWith("Not an Owner");
        await expect(_contract.commitItem(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(randomBytes(32) + "+" + BigNumber.from(1))), BigNumber.from(1))).to.be.revertedWith("Not an Owner");
        await expect(_contract.commitItem(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(randomBytes(32) + "+" + BigNumber.from(2))), BigNumber.from(2))).to.be.revertedWith("Not an Owner");
        await expect(_contract.commitItem(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(randomBytes(32) + "+" + BigNumber.from(3))), BigNumber.from(3))).to.be.revertedWith("Not an Owner");
        await expect(_contract.commitItem(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(randomBytes(32) + "+" + BigNumber.from(4))), BigNumber.from(4))).to.be.revertedWith("Not an Owner");
        await expect(_contract.commitItem(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(randomBytes(32) + "+" + BigNumber.from(5))), BigNumber.from(5))).to.be.revertedWith("Not an Owner");
        await expect(_contract.commitItem(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(randomBytes(32) + "+" + BigNumber.from(6))), BigNumber.from(6))).to.be.revertedWith("Not an Owner");
        await expect(_contract.commitItem(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(randomBytes(32) + "+" + BigNumber.from(7))), BigNumber.from(7))).to.be.revertedWith("Not an Owner");
        await expect(_contract.commitItem(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(randomBytes(32) + "+" + BigNumber.from(8))), BigNumber.from(8))).to.be.revertedWith("Not an Owner");
        await expect(_contract.commitItem(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(randomBytes(32) + "+" + BigNumber.from(9))), BigNumber.from(9))).to.be.revertedWith("Not an Owner");
        await expect(_contract.commitItem(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(randomBytes(32) + "+" + BigNumber.from(10))), BigNumber.from(10))).to.be.revertedWith("Not an Owner");
        await expect(_contract.commitItem(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(randomBytes(32) + "+" + BigNumber.from(11))), BigNumber.from(11))).to.be.revertedWith("Not an Owner");
    })
})