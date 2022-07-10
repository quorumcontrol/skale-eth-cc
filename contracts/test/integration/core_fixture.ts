import { ethers } from 'hardhat';

export default async () => {

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