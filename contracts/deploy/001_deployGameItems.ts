import "hardhat-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import items from "../helpers/items";

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy, get, execute } = deployments;
  const { deployer } = await getNamedAccounts();

  const roller = await get("DiceRoller");

  const gameItems = await deploy("GameItems", {
    from: deployer,
    log: true,
    // deterministicDeployment: true,
    args: [roller.address],
  });

  if (gameItems.newlyDeployed) {
    for (const item of items) {
      await execute(
        "GameItems",
        {
          log: true,
          from: deployer,
        },
        "addItem",
        item.tier,
        item.name,
        item.description,
        item.image,
        item.animation,
        item.beats,
        item.playOffs,
        item.tokenURI
      );
    }
  }
};
export default func;
