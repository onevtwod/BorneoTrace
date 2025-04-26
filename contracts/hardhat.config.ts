import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      chainId: 1337
    },
    // Add MasChain configuration when available
    // maschain: {
    //   url: "https://rpc.maschain.example",
    //   accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : []
    // }
  },
  paths: {
    artifacts: "../borneo-trace-app/src/artifacts"
  }
};

export default config;
