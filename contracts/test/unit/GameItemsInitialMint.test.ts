import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';

describe("Game Items Initial Mint Test", () => {
    async function deployContractFixture() {

        const [ owner, rng1, rng2 ] = await ethers.getSigners();
        

        const factory = await ethers.getContractFactory("GameItems");
        const contract = await factory.deploy();
        await contract.deployed();

        const ADMIN_ROLE: string = await contract.callStatic.ADMIN_ROLE();
        const WIN_MANAGER_ROLE: string = await contract.callStatic.WIN_MANAGER_ROLE();
        const MINTER_ROLE: string = await contract.callStatic.MINTER_ROLE();

        return { factory, contract, owner, ADMIN_ROLE, WIN_MANAGER_ROLE, MINTER_ROLE, rng1, rng2 }
    }
    it("Should Initially Fail", async() => {
        const { contract, rng1 } = await loadFixture(deployContractFixture);
            await expect(
                contract.initialMint(rng1.address)
            ).to.revertedWith("Not Enough Items")
    })
    it("Should Add 6 Items", async() => {
        const { contract, rng1 } = await loadFixture(deployContractFixture);
        await expect(
            contract.addItem("0", "0", "0", "0", [], [], "")
        ).to.emit(contract, "NewItem").withArgs(BigNumber.from(0))
        await expect(
            contract.addItem("1", "1", "1", "1", [], [], "")
        ).to.emit(contract, "NewItem").withArgs(BigNumber.from(1))
        await expect(
            contract.addItem("2", "2", "2", "2", [], [], "")
        ).to.emit(contract, "NewItem").withArgs(BigNumber.from(2))
        await expect(
            contract.addItem("3", "3", "3", "3", [], [], "")
        ).to.emit(contract, "NewItem").withArgs(BigNumber.from(3))
        await expect(
            contract.addItem("4", "4", "4", "4", [], [], "")
        ).to.emit(contract, "NewItem").withArgs(BigNumber.from(4))
        await expect(
            contract.addItem("5", "5", "5", "5", [], [], "")
        ).to.emit(contract, "NewItem").withArgs(BigNumber.from(5))
        /// This may not work without a SKALE chain
        // await expect(
        //     contract.initialMint(rng1.address)
        // ).to.emit(contract, "NewPlayer").withArgs(rng1.address, [0, 2, 4] || [1,3,5], undefined)
    })
})