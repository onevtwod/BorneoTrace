import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";

interface DeploymentInfo {
  network: string;
  chainId: number;
  contracts: {
    registry: string;
    certificateNFT: string;
    batchNFT: string;
  };
  timestamp: string;
  deployer: string;
}

async function main() {
  console.log("🚀 Starting BorneoTrace contract deployment...");
  console.log(`📍 Network: ${network.name}`);
  console.log(`🔗 Chain ID: ${network.config.chainId}`);

  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deploying with account: ${deployer.address}`);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH`);

  // Deploy Deployer contract
  console.log("\n📋 Deploying Deployer contract...");
  const Deployer = await ethers.getContractFactory("Deployer");
  const deployerContract = await Deployer.deploy();
  await deployerContract.waitForDeployment();
  console.log(`✅ Deployer deployed to: ${await deployerContract.getAddress()}`);

  // Deploy contracts through Deployer
  console.log("\n🏗️  Deploying Certificate and Batch contracts...");
  const deployTx = await deployerContract.deployContracts();
  await deployTx.wait();
  console.log("✅ Contracts deployed through Deployer");

  // Get contract addresses
  const certificateAddress = await deployerContract.certificateContract();
  const batchAddress = await deployerContract.batchContract();
  console.log(`✅ CertificateNFT deployed to: ${certificateAddress}`);
  console.log(`✅ BatchNFT deployed to: ${batchAddress}`);

  // Create deployment info
  const deploymentInfo: DeploymentInfo = {
    network: network.name,
    chainId: network.config.chainId as number,
    contracts: {
      registry: await deployerContract.getAddress(),
      certificateNFT: certificateAddress,
      batchNFT: batchAddress
    },
    timestamp: new Date().toISOString(),
    deployer: deployer.address
  };

  // Save deployment info
  const deploymentDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentDir, `${network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to: ${deploymentFile}`);

  // Save contract addresses for frontend
  const frontendDir = path.join(__dirname, "../../borneo-trace-app/src/config");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  const frontendConfig = {
    network: network.name,
    chainId: network.config.chainId,
    contracts: {
      registry: await deployerContract.getAddress(),
      certificateNFT: certificateAddress,
      batchNFT: batchAddress
    }
  };

  const frontendConfigFile = path.join(frontendDir, "contracts.ts");
  const configContent = `// Auto-generated contract addresses for ${network.name}
export const CONTRACT_ADDRESSES = {
  registry: "${await deployerContract.getAddress()}",
  certificateNFT: "${certificateAddress}",
  batchNFT: "${batchAddress}"
} as const;

export const NETWORK_CONFIG = {
  name: "${network.name}",
  chainId: ${network.config.chainId}
} as const;
`;

  fs.writeFileSync(frontendConfigFile, configContent);
  console.log(`🎯 Frontend config saved to: ${frontendConfigFile}`);

  // Verify contracts if on a public network
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n🔍 Verifying contracts on block explorer...");
    try {
      // Wait for contract deployment to be mined
      await new Promise(resolve => setTimeout(resolve, 10000));

              await hre.run("verify:verify", {
                address: await deployerContract.getAddress(),
                constructorArguments: [],
              });
              console.log("✅ Deployer contract verified");

      // Note: Certificate and Batch contracts are deployed through Registry
      // They may need individual verification depending on the explorer
      console.log("ℹ️  Certificate and Batch contracts deployed through Registry");
    } catch (error) {
      console.log("⚠️  Contract verification failed:", error.message);
    }
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📊 Deployment Summary:");
  console.log(`   Network: ${network.name}`);
  console.log(`   Chain ID: ${network.config.chainId}`);
  console.log(`   Registry: ${await deployerContract.getAddress()}`);
  console.log(`   CertificateNFT: ${certificateAddress}`);
  console.log(`   BatchNFT: ${batchAddress}`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   Timestamp: ${deploymentInfo.timestamp}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
