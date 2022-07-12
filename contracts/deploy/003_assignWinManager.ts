import "hardhat-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function ({
    deployments,
    getNamedAccounts
}: HardhatRuntimeEnvironment) {

    const { get, read, execute } = deployments;
    const { deployer } = await getNamedAccounts();

    const battle = await get("Battle");

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

    /// Additional Check Can Be Commented in for Verification
    // console.log("Battle Address: ", battle.address);
    // const hasRole = await read("GameItems", {}, "hasRole", "0x581d7f64a8a641e01714c2dbb65d39f75e5db27e77fac6575785e5201e1b1dec", battle.address);
    // console.log("HAS ROLE: ", hasRole);
}

export default func;