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

task('top-up')
  .addParam('address')
  .setAction(async ({ address }, hre) => {
    const signer = (await hre.ethers.getSigners())[0];
    const tx = await signer.sendTransaction({
      to: address,
      value: utils.parseEther('1')
    })
    console.log("tx: ", tx.hash)
    await tx.wait()
  })

task('make-minter')
  .addParam('address')
  .setAction(async ({ address }, hre) => {
    const gameItems = await getGameItemsContract(hre)
    const minter = await gameItems.MINTER_ROLE()
    const tx = await gameItems.grantRole(minter, address)
    console.log('tx: ', tx.hash)
    await tx.wait()
  })