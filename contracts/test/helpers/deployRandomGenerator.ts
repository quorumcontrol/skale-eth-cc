import { ethers } from "hardhat"

const deployRandom = async () => {
  const TestDiceRoller = await ethers.getContractFactory("TestDiceRoller")
  const roller = await TestDiceRoller.deploy()
  return roller.deployed()
}

export default deployRandom