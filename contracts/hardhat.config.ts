import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337,
      gas: 12000000,
      blockGasLimit: 12000000
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337
    },
    // Polygon Mumbai Testnet Configuration
    mumbai: {
      url: process.env.POLYGON_MUMBAI_RPC || "https://rpc-mumbai.maticvigil.com",
      chainId: 80001,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
      timeout: 60000
    },
    // Polygon Mainnet Configuration
    polygon: {
      url: process.env.POLYGON_MAINNET_RPC || "https://polygon-rpc.com",
      chainId: 137,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
      timeout: 60000
    },
    // Legacy MasChain Configuration (for reference)
    maschainTestnet: {
      url: process.env.MASCHAIN_TESTNET_RPC || "https://testnet-rpc.maschain.org",
      chainId: parseInt(process.env.MASCHAIN_TESTNET_CHAIN_ID || "1001"),
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
      timeout: 60000
    },
    maschainMainnet: {
      url: process.env.MASCHAIN_MAINNET_RPC || "https://rpc.maschain.org",
      chainId: parseInt(process.env.MASCHAIN_MAINNET_CHAIN_ID || "1000"),
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
      timeout: 60000
    }
  },
  paths: {
    artifacts: "../borneo-trace-app/src/artifacts"
  },
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || ""
    },
    customChains: [
      {
        network: "polygon",
        chainId: 137,
        urls: {
          apiURL: "https://api.polygonscan.com/api",
          browserURL: "https://polygonscan.com"
        }
      },
      {
        network: "polygonMumbai",
        chainId: 80001,
        urls: {
          apiURL: "https://api-testnet.polygonscan.com/api",
          browserURL: "https://mumbai.polygonscan.com"
        }
      }
    ]
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD"
  },
  mocha: {
    timeout: 40000
  }
};

export default config;
