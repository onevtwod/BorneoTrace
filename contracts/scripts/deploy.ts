import { ethers } from "hardhat";

async function main() {
  console.log("Deploying contracts...");

  // Deploy Registry contract
  const Registry = await ethers.getContractFactory("Registry");
  const registry = await Registry.deploy();
  await registry.deployed();
  console.log(`Registry deployed to: ${registry.address}`);

  // Deploy contracts through Registry
  const deployTx = await registry.deployContracts();
  await deployTx.wait();
  console.log("Contracts deployed through Registry");

  // Get contract addresses
  const certificateAddress = await registry.certificateContract();
  const batchAddress = await registry.batchContract();
  console.log(`CertificateNFT deployed to: ${certificateAddress}`);
  console.log(`BatchNFT deployed to: ${batchAddress}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
