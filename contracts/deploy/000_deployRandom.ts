import "hardhat-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { hrtime } from "process";

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  network
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // if we're on a skale chain, then use the real randomnness
  if (network.live) {
    await deploy("DiceRoller", {
      from: deployer,
      log: true,
      // deterministicDeployment: true,
      args: [],
    });
    return
  }

  // otherwise, if this is localhost deploy the test dice roller
  await deploy("DiceRoller", {
    from: deployer,
    log: true,
    contract: "TestDiceRoller",
    // deterministicDeployment: true,
    args: [],
    
  })

};
export default func;
