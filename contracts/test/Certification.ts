import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Certification System", function () {
  let registry: any;
  let certificateNFT: any;
  let batchNFT: any;
  let owner: SignerWithAddress;
  let certifier: SignerWithAddress;
  let producer: SignerWithAddress;
  let verifier: SignerWithAddress;
  let consumer: SignerWithAddress;

  beforeEach(async function () {
    // Get signers
    [owner, certifier, producer, verifier, consumer] = await ethers.getSigners();

    // Deploy contracts directly
    const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
    certificateNFT = await CertificateNFT.deploy();
    await certificateNFT.waitForDeployment();

    const BatchNFT = await ethers.getContractFactory("BatchNFT");
    batchNFT = await BatchNFT.deploy(await certificateNFT.getAddress());
    await batchNFT.waitForDeployment();

    // Create a mock registry object for compatibility with tests
    registry = {
      registerCertifier: async (address: string) => {
        await certificateNFT.connect(owner).authorizeCertifier(address);
      },
      registerProducer: async (address: string) => {
        await batchNFT.connect(owner).authorizeProducer(address);
      },
      registerVerifier: async (address: string) => {
        await batchNFT.connect(owner).authorizeVerifier(address);
      },
      removeCertifier: async (address: string) => {
        await certificateNFT.connect(owner).revokeCertifier(address);
      },
      isCertifier: async (address: string) => {
        return await certificateNFT.isAuthorizedCertifier(address);
      },
      isProducer: async (address: string) => {
        return await batchNFT.isAuthorizedProducer(address);
      },
      isVerifier: async (address: string) => {
        return await batchNFT.isAuthorizedVerifier(address);
      }
    };

    // Register users
    await registry.registerCertifier(certifier.address);
    await registry.registerProducer(producer.address);
    await registry.registerVerifier(verifier.address);
  });

  describe("Registry", function () {
    it("Should register users with correct roles", async function () {
      expect(await registry.isCertifier(certifier.address)).to.equal(true);
      expect(await registry.isProducer(producer.address)).to.equal(true);
      expect(await registry.isVerifier(verifier.address)).to.equal(true);
      expect(await registry.isCertifier(consumer.address)).to.equal(false);
    });

    it("Should remove users from roles", async function () {
      await registry.removeCertifier(certifier.address);
      expect(await registry.isCertifier(certifier.address)).to.equal(false);
    });
  });

  describe("CertificateNFT", function () {
    it("Should allow certifier to mint certificate", async function () {
      const certIdString = "CERT-001";
      const certType = "Halal";
      const validityPeriod = 365 * 24 * 60 * 60; // 1 year in seconds
      const metadataURI = "ipfs://QmXyz...";

      await certificateNFT.connect(certifier).mintCertificate(
        certIdString,
        certType,
        producer.address,
        validityPeriod,
        metadataURI
      );

      const tokenId = 0; // First token
      const certificate = await certificateNFT.getCertificate(tokenId);

      expect(certificate.certIdString).to.equal(certIdString);
      expect(certificate.certType).to.equal(certType);
      expect(certificate.issuer).to.equal(certifier.address);
      expect(certificate.certifiedEntityAddress).to.equal(producer.address);
      expect(await certificateNFT.ownerOf(tokenId)).to.equal(producer.address);
    });

    it("Should check certificate validity", async function () {
      const certIdString = "CERT-001";
      const certType = "Halal";
      const validityPeriod = 365 * 24 * 60 * 60; // 1 year in seconds
      const metadataURI = "ipfs://QmXyz...";

      await certificateNFT.connect(certifier).mintCertificate(
        certIdString,
        certType,
        producer.address,
        validityPeriod,
        metadataURI
      );

      const tokenId = 0; // First token
      expect(await certificateNFT.isValid(tokenId)).to.equal(true);

      // Revoke certificate
      await certificateNFT.connect(certifier).revokeCertificate(tokenId, "Quality issues");
      expect(await certificateNFT.isValid(tokenId)).to.equal(false);
    });
  });

  describe("BatchNFT", function () {
    let certificateId: number;

    beforeEach(async function () {
      // Mint a certificate for the producer
      await certificateNFT.connect(certifier).mintCertificate(
        "CERT-001",
        "Halal",
        producer.address,
        365 * 24 * 60 * 60, // 1 year
        "ipfs://QmXyz..."
      );
      certificateId = 0; // First token
    });

    it("Should create and verify a batch", async function () {
      // Create batch
      await batchNFT.connect(producer).createBatch(
        "BATCH-001",
        "Palm Oil",
        1000,
        "kg",
        Math.floor(Date.now() / 1000), // Current timestamp
        "Tawau, Sabah",
        [certificateId],
        "ipfs://QmAbc..."
      );

      const batchId = 0; // First batch

      // Verify batch
      await batchNFT.connect(verifier).verifyBatch(batchId);

      const batch = await batchNFT.getBatch(batchId);
      expect(batch.batchId).to.equal("BATCH-001");
      expect(batch.productType).to.equal("Palm Oil");
      expect(batch.quantity).to.equal(1000);
      expect(batch.status).to.equal(1); // Active
      expect(batch.linkedCertificateIds.length).to.equal(1);
      expect(batch.linkedCertificateIds[0]).to.equal(certificateId);
      expect(await batchNFT.ownerOf(batchId)).to.equal(producer.address);
    });

    it("Should transfer batch ownership", async function () {
      // Create and verify batch
      await batchNFT.connect(producer).createBatch(
        "BATCH-001",
        "Palm Oil",
        1000,
        "kg",
        Math.floor(Date.now() / 1000),
        "Tawau, Sabah",
        [certificateId],
        "ipfs://QmAbc..."
      );

      const batchId = 0;
      await batchNFT.connect(verifier).verifyBatch(batchId);

      // Mark as in transit
      await batchNFT.connect(producer).markAsInTransit(batchId);

      // Transfer to consumer
      await batchNFT.connect(producer).transferBatch(batchId, consumer.address);

      expect(await batchNFT.ownerOf(batchId)).to.equal(consumer.address);

      const batch = await batchNFT.getBatch(batchId);
      expect(batch.status).to.equal(3); // Received
      expect(batch.currentOwner).to.equal(consumer.address);
    });

    it("Should cancel a batch", async function () {
      // Create and verify batch
      await batchNFT.connect(producer).createBatch(
        "BATCH-001",
        "Palm Oil",
        1000,
        "kg",
        Math.floor(Date.now() / 1000),
        "Tawau, Sabah",
        [certificateId],
        "ipfs://QmAbc..."
      );

      const batchId = 0;
      await batchNFT.connect(verifier).verifyBatch(batchId);

      // Cancel batch
      await batchNFT.connect(producer).cancelBatch(batchId, "Quality issues");

      const batch = await batchNFT.getBatch(batchId);
      expect(batch.status).to.equal(4); // Cancelled
    });
  });
});
