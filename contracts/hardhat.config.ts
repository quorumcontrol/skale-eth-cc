import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'hardhat-deploy'
import './tasks'
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
  },
  networks: {
    skaletest: {
      url: "https://testnet-proxy.skalenodes.com/v1/whispering-turais",
      // gasPrice: 0,
      accounts: [
        process.env.SKALE_TEST_PRIVATE_KEY,
        process.env.BADGE_MINTER_PRIVATE_KEY,
      ].filter((k) => !!k) as string[],
    },
  }
};

export default config;
