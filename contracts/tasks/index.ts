import "@nomiclabs/hardhat-ethers";
import { utils } from "ethers";
import { task } from "hardhat/config";
import { getBatleContract, getGameItemsContract } from "./helpers";

task('players')
  .setAction(async (_, hre) => {
    const gameItems = await getGameItemsContract(hre);
    const num = await gameItems.getNumberPlayers()
    console.log(num.toNumber())
  })

task("setup-user")
  .addParam("address")
  .setAction(async ({ address }, hre) => {
    const gameItems = await getGameItemsContract(hre);
    const tx = await gameItems.initialMint(address, {
      value: utils.parseEther("1"),
    });
    console.log("tx: ", tx.hash);
    await tx.wait();
  });

task("top-up")
  .addParam("address")
  .setAction(async ({ address }, hre) => {
    const signer = (await hre.ethers.getSigners())[0];
    const tx = await signer.sendTransaction({
      to: address,
      value: utils.parseEther("1"),
    });
    console.log("tx: ", tx.hash);
    await tx.wait();
  });

task("make-minter")
  .addParam("address")
  .setAction(async ({ address }, hre) => {
    const gameItems = await getGameItemsContract(hre);
    const minter = await gameItems.MINTER_ROLE();
    const tx = await gameItems.grantRole(minter, address);
    console.log("tx: ", tx.hash);
    await tx.wait();
    (
      await hre.ethers.provider.getSigner().sendTransaction({
        to: address,
        value: utils.parseEther('200'),
      })
    ).wait();
  });

task("initialize-minter")
  .addParam("address")
  .setAction(async ({ address }, hre) => {
    const gameItems = await getGameItemsContract(hre);
    const minter = await gameItems.MINTER_ROLE();
    let tx = await gameItems.grantRole(minter, address);
    console.log("grant tx: ", tx.hash);
    await tx.wait();
    (
      await hre.ethers.provider.getSigner().sendTransaction({
        to: address,
        value: utils.parseEther('200'),
      })
    ).wait();

    tx = await gameItems.initialMint(address, {
      value: utils.parseEther("1"),
    });
    console.log("initialize tx: ", tx.hash);
    await tx.wait();
  });

task("make-full-admin")
  .addParam("address")
  .setAction(async ({ address }, hre) => {
    const gameItems = await getGameItemsContract(hre);
    const minter = await gameItems.MINTER_ROLE();
    const admin = await gameItems.ADMIN_ROLE();
    let tx = await gameItems.grantRole(minter, address);
    console.log("minter tx: ", tx.hash);
    await tx.wait();
    tx = await gameItems.grantRole(admin, address);
    console.log("admin tx: ", tx.hash);
    await tx.wait();
  });

task("send-sfuel")
  .addParam("address")
  .addParam("amount")
  .setAction(async ({ address, amount }, hre) => {
    hre.ethers.provider.getSigner().sendTransaction({
      to: address,
      value: utils.parseEther(amount),
    });
  });
