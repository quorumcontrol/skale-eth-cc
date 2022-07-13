import "hardhat-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { hrtime } from "process";

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy, get, execute } = deployments;
  const { deployer } = await getNamedAccounts();

  const gameItems = await get("GameItems");

  const battle = await deploy("Battle", {
    from: deployer,
    log: true,
    // deterministicDeployment: true,
    args: [gameItems.address],
  });

  if (battle.newlyDeployed) {
    await execute(
      "GameItems",
      {
          log: true,
          from: deployer
      },
      "grantRole",
      "0x581d7f64a8a641e01714c2dbb65d39f75e5db27e77fac6575785e5201e1b1dec",
      battle.address
    );
  }
};
export default func;
