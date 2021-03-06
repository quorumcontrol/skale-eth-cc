import { HardhatRuntimeEnvironment } from "hardhat/types";

export async function getGameItemsContract(
  hre: HardhatRuntimeEnvironment
) {
  console.log("using network: ", hre.network.name);
  const deploy = await import(
    `../deployments/${hre.network.name}/GameItems.json`
  );

  const { GameItems__factory } = await import("../typechain-types");

  const signer = (await hre.ethers.getSigners())[0];

  return GameItems__factory.connect(deploy.address, signer);
}

export async function getBatleContract(
  hre: HardhatRuntimeEnvironment
) {
  console.log("using network: ", hre.network.name);
  const deploy = await import(
    `../deployments/${hre.network.name}/Battle.json`
  );

  const { Battle__factory } = await import("../typechain-types");

  const signer = (await hre.ethers.getSigners())[0];

  return Battle__factory.connect(deploy.address, signer);
}
