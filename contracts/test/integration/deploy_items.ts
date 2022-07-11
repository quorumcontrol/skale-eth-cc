import DefaultFixture from './core_fixture';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { BigNumber, ContractTransaction } from 'ethers';

const fixtures = async () => {

    const defaultFixture = await loadFixture(DefaultFixture);
    
    const add0: ContractTransaction = await defaultFixture.contract.addItem("0", "0", "0", "0", [BigNumber.from(1), BigNumber.from(3)], [], "");
    const add1: ContractTransaction = await defaultFixture.contract.addItem("1", "1", "1", "1", [BigNumber.from(2), BigNumber.from(4)], [], "");
    const add2: ContractTransaction = await defaultFixture.contract.addItem("2", "2", "2", "2", [BigNumber.from(0), BigNumber.from(2)], [], "");
    const add3: ContractTransaction = await defaultFixture.contract.addItem("3", "3", "3", "3", [BigNumber.from(3), BigNumber.from(1)], [], "");
    const add4: ContractTransaction = await defaultFixture.contract.addItem("4", "4", "4", "4", [BigNumber.from(4), BigNumber.from(0)], [], "");
    const add5: ContractTransaction = await defaultFixture.contract.addItem("5", "5", "5", "5", [BigNumber.from(5), BigNumber.from(3)], [], "");
    const add6: ContractTransaction = await defaultFixture.contract.addItem("6", "6", "6", "6", [BigNumber.from(6), BigNumber.from(2)], [], "");
    const add7: ContractTransaction = await defaultFixture.contract.addItem("7", "7", "7", "7", [BigNumber.from(2), BigNumber.from(0)], [BigNumber.from(0), BigNumber.from(1)], "");
    const add8: ContractTransaction = await defaultFixture.contract.addItem("8", "8", "8", "8", [BigNumber.from(1), BigNumber.from(2)], [BigNumber.from(2), BigNumber.from(3)], "");
    const add9: ContractTransaction = await defaultFixture.contract.addItem("9", "9", "9", "9", [BigNumber.from(0), BigNumber.from(3)], [BigNumber.from(4), BigNumber.from(5)], "");
    const add10: ContractTransaction = await defaultFixture.contract.addItem("10", "10", "10", "10", [BigNumber.from(3), BigNumber.from(5)], [BigNumber.from(5), BigNumber.from(7)], "");
    const add11: ContractTransaction = await defaultFixture.contract.addItem("10", "10", "10", "10", [BigNumber.from(3), BigNumber.from(5)], [BigNumber.from(6), BigNumber.from(8)], "");


    return { ...defaultFixture };
}

export default fixtures
