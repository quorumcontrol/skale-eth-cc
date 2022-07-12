import "@nomiclabs/hardhat-ethers";
import { utils } from "ethers";
import { task } from 'hardhat/config'
import { getGameItemsContract } from "./helpers";

task('setup-user')
  .addParam('address')
  .setAction(async ({ address }, hre) => {
    const gameItems = await getGameItemsContract(hre)
    const tx = await gameItems.initialMint(address, { value: utils.parseEther('1') })
    console.log('tx: ', tx.hash)
    await tx.wait()
  })