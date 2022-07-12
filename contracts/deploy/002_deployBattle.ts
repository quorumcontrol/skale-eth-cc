import "hardhat-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { hrtime } from "process";

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const gameItems = await get("GameItems");

  await deploy("Battle", {
    from: deployer,
    log: true,
    // deterministicDeployment: true,
    args: [gameItems.address],
  });
};
export default func;
