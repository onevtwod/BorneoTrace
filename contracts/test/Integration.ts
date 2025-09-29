import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { CertificateNFT, BatchNFT } from "../typechain-types";

describe("BorneoTrace Integration Tests", function () {
    let registry: any;
    let certificateNFT: CertificateNFT;
    let batchNFT: BatchNFT;
    let owner: any;
    let certifier: any;
    let producer: any;
    let verifier: any;
    let logistics: any;
    let retailer: any;
    let consumer: any;

    const VALIDITY_PERIOD = 365 * 24 * 60 * 60; // 1 year
    const METADATA_URI = "ipfs://QmTest123";

    beforeEach(async function () {
        [owner, certifier, producer, verifier, logistics, retailer, consumer] = await ethers.getSigners();

        // Deploy contracts directly
        const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
        certificateNFT = await CertificateNFT.deploy();
        await certificateNFT.waitForDeployment();

        const BatchNFT = await ethers.getContractFactory("BatchNFT");
        batchNFT = await BatchNFT.deploy(await certificateNFT.getAddress());
        await batchNFT.waitForDeployment();

        // Create a mock registry object for compatibility with tests
        registry = {
            registerCertifier: (address: string) => certificateNFT.connect(owner).authorizeCertifier(address),
            registerProducer: (address: string) => batchNFT.connect(owner).authorizeProducer(address),
            registerVerifier: (address: string) => batchNFT.connect(owner).authorizeVerifier(address),
            removeCertifier: (address: string) => certificateNFT.connect(owner).revokeCertifier(address),
            isCertifier: (address: string) => certificateNFT.isAuthorizedCertifier(address),
            isProducer: (address: string) => batchNFT.isAuthorizedProducer(address),
            isVerifier: (address: string) => batchNFT.isAuthorizedVerifier(address)
        };

        // Register users
        await registry.registerCertifier(certifier.address);
        await registry.registerProducer(producer.address);
        await registry.registerVerifier(verifier.address);
    });

    describe("Complete Supply Chain Workflow", function () {
        it("Should handle full supply chain from farm to consumer", async function () {
            // Step 1: Certifier issues multiple certificates
            await certificateNFT.connect(certifier).mintCertificate(
                "HALAL-2025-001",
                "Halal",
                producer.address,
                VALIDITY_PERIOD,
                METADATA_URI
            );

            await certificateNFT.connect(certifier).mintCertificate(
                "MSPO-2025-001",
                "MSPO",
                producer.address,
                VALIDITY_PERIOD,
                METADATA_URI
            );

            // Step 2: Producer creates batch with multiple certificates
            await batchNFT.connect(producer).createBatch(
                "BATCH-2025-001",
                "Organic Palm Oil",
                5000,
                "Liters",
                Math.floor(Date.now() / 1000) - 86400, // Harvested yesterday
                "Tawau Palm Oil Plantation, Sabah",
                [0, 1], // Both certificates
                METADATA_URI
            );

            // Step 3: Verifier approves the batch
            await batchNFT.connect(verifier).verifyBatch(0);

            // Verify batch is now active
            let batch = await batchNFT.getBatch(0);
            expect(batch.status).to.equal(1); // Active
            expect(batch.linkedCertificateIds.length).to.equal(2);

            // Step 4: Producer transfers to consumer (final delivery)
            await batchNFT.connect(producer).markAsInTransit(0);
            await batchNFT.connect(producer).transferBatch(0, consumer.address);

            batch = await batchNFT.getBatch(0);
            expect(batch.currentOwner).to.equal(consumer.address);
            expect(batch.status).to.equal(3); // Received

            // Step 5: Consumer verifies the product
            const certificate1 = await certificateNFT.getCertificate(0);
            const certificate2 = await certificateNFT.getCertificate(1);

            expect(await certificateNFT.isValid(0)).to.be.true;
            expect(await certificateNFT.isValid(1)).to.be.true;
            expect(certificate1.certType).to.equal("Halal");
            expect(certificate2.certType).to.equal("MSPO");
        });

        it("Should handle batch splitting scenario", async function () {
            // Create initial batch
            await certificateNFT.connect(certifier).mintCertificate(
                "HALAL-2025-002",
                "Halal",
                producer.address,
                VALIDITY_PERIOD,
                METADATA_URI
            );

            await batchNFT.connect(producer).createBatch(
                "BATCH-2025-002",
                "Rice",
                10000,
                "kg",
                Math.floor(Date.now() / 1000),
                "Kedah Rice Farm",
                [0],
                METADATA_URI
            );

            await batchNFT.connect(verifier).verifyBatch(0);

            // Simulate splitting by creating a new batch for the split portion
            await batchNFT.connect(producer).createBatch(
                "BATCH-2025-002-SPLIT",
                "Rice",
                3000,
                "kg",
                Math.floor(Date.now() / 1000),
                "Kedah Rice Farm - Split from BATCH-2025-002",
                [0],
                METADATA_URI
            );

            await batchNFT.connect(verifier).verifyBatch(1);

            // Both batches should be valid
            const batch1 = await batchNFT.getBatch(0);
            const batch2 = await batchNFT.getBatch(1);

            expect(batch1.quantity).to.equal(10000);
            expect(batch2.quantity).to.equal(3000);
            expect(batch1.linkedCertificateIds[0]).to.equal(0);
            expect(batch2.linkedCertificateIds[0]).to.equal(0);
        });

        it("Should handle certificate expiry scenario", async function () {
            // Create certificate with short validity period
            const shortValidity = 60; // 1 minute
            await certificateNFT.connect(certifier).mintCertificate(
                "HALAL-2025-003",
                "Halal",
                producer.address,
                shortValidity,
                METADATA_URI
            );

            // Create batch with this certificate
            await batchNFT.connect(producer).createBatch(
                "BATCH-2025-003",
                "Fresh Fish",
                100,
                "kg",
                Math.floor(Date.now() / 1000),
                "Kota Kinabalu Fish Market",
                [0],
                METADATA_URI
            );

            await batchNFT.connect(verifier).verifyBatch(0);

            // Wait for certificate to expire (simulate with time manipulation)
            await ethers.provider.send("evm_increaseTime", [61]); // Increase time by 61 seconds
            await ethers.provider.send("evm_mine", []); // Mine a new block

            // Certificate should now be invalid
            expect(await certificateNFT.isValid(0)).to.be.false;

            // Batch should still exist but with expired certificate
            const batch = await batchNFT.getBatch(0);
            expect(batch.linkedCertificateIds[0]).to.equal(0);
        });

        it("Should handle quality issues and batch cancellation", async function () {
            // Create batch
            await certificateNFT.connect(certifier).mintCertificate(
                "HALAL-2025-004",
                "Halal",
                producer.address,
                VALIDITY_PERIOD,
                METADATA_URI
            );

            await batchNFT.connect(producer).createBatch(
                "BATCH-2025-004",
                "Chicken",
                500,
                "kg",
                Math.floor(Date.now() / 1000),
                "Klang Valley Poultry Farm",
                [0],
                METADATA_URI
            );

            await batchNFT.connect(verifier).verifyBatch(0);

            // Transfer to logistics
            await batchNFT.connect(producer).transferBatch(0, logistics.address);

            // Logistics discovers quality issues and cancels batch
            await batchNFT.connect(logistics).cancelBatch(0, "Temperature breach during transport");

            const batch = await batchNFT.getBatch(0);
            expect(batch.status).to.equal(4); // Cancelled
        });
    });

    describe("Multi-Certificate Scenarios", function () {
        it("Should handle batch with multiple certification types", async function () {
            // Issue different types of certificates
            await certificateNFT.connect(certifier).mintCertificate(
                "HALAL-2025-005",
                "Halal",
                producer.address,
                VALIDITY_PERIOD,
                METADATA_URI
            );

            await certificateNFT.connect(certifier).mintCertificate(
                "MSPO-2025-005",
                "MSPO",
                producer.address,
                VALIDITY_PERIOD,
                METADATA_URI
            );

            await certificateNFT.connect(certifier).mintCertificate(
                "ORGANIC-2025-005",
                "Organic",
                producer.address,
                VALIDITY_PERIOD,
                METADATA_URI
            );

            // Create batch with all three certificates
            await batchNFT.connect(producer).createBatch(
                "BATCH-2025-005",
                "Premium Organic Palm Oil",
                2000,
                "Liters",
                Math.floor(Date.now() / 1000),
                "Sustainable Palm Oil Plantation, Johor",
                [0, 1, 2],
                METADATA_URI
            );

            await batchNFT.connect(verifier).verifyBatch(0);

            const batch = await batchNFT.getBatch(0);
            expect(batch.linkedCertificateIds.length).to.equal(3);

            // Verify all certificates are valid
            expect(await certificateNFT.isValid(0)).to.be.true;
            expect(await certificateNFT.isValid(1)).to.be.true;
            expect(await certificateNFT.isValid(2)).to.be.true;

            // Check certificate types
            const cert1 = await certificateNFT.getCertificate(0);
            const cert2 = await certificateNFT.getCertificate(1);
            const cert3 = await certificateNFT.getCertificate(2);

            expect(cert1.certType).to.equal("Halal");
            expect(cert2.certType).to.equal("MSPO");
            expect(cert3.certType).to.equal("Organic");
        });

        it("Should handle partial certificate revocation", async function () {
            // Create batch with multiple certificates
            await certificateNFT.connect(certifier).mintCertificate(
                "HALAL-2025-006",
                "Halal",
                producer.address,
                VALIDITY_PERIOD,
                METADATA_URI
            );

            await certificateNFT.connect(certifier).mintCertificate(
                "MSPO-2025-006",
                "MSPO",
                producer.address,
                VALIDITY_PERIOD,
                METADATA_URI
            );

            await batchNFT.connect(producer).createBatch(
                "BATCH-2025-006",
                "Palm Oil",
                1000,
                "Liters",
                Math.floor(Date.now() / 1000),
                "Test Plantation",
                [0, 1],
                METADATA_URI
            );

            await batchNFT.connect(verifier).verifyBatch(0);

            // Revoke one certificate
            await certificateNFT.connect(certifier).revokeCertificate(0, "Compliance violation");

            // Batch should still exist but with one revoked certificate
            const batch = await batchNFT.getBatch(0);
            expect(batch.linkedCertificateIds.length).to.equal(2);

            // One certificate should be invalid, one should be valid
            expect(await certificateNFT.isValid(0)).to.be.false; // Revoked
            expect(await certificateNFT.isValid(1)).to.be.true;  // Still valid
        });
    });

    describe("Edge Cases and Error Handling", function () {
        it("Should handle non-existent batch access", async function () {
            await expect(batchNFT.getBatch(999)).to.be.revertedWith("Batch does not exist");
            await expect(certificateNFT.getCertificate(999)).to.be.revertedWith("Certificate does not exist");
        });

        it("Should handle unauthorized operations", async function () {
            await certificateNFT.connect(certifier).mintCertificate(
                "HALAL-2025-007",
                "Halal",
                producer.address,
                VALIDITY_PERIOD,
                METADATA_URI
            );

            await batchNFT.connect(producer).createBatch(
                "BATCH-2025-007",
                "Test Product",
                100,
                "kg",
                Math.floor(Date.now() / 1000),
                "Test Location",
                [0],
                METADATA_URI
            );

            // Non-verifier trying to verify
            await expect(
                batchNFT.connect(producer).verifyBatch(0)
            ).to.be.revertedWith("Not authorized as verifier");

            // Non-producer trying to create batch
            await expect(
                batchNFT.connect(verifier).createBatch(
                    "BATCH-2025-008",
                    "Test Product",
                    100,
                    "kg",
                    Math.floor(Date.now() / 1000),
                    "Test Location",
                    [0],
                    METADATA_URI
                )
            ).to.be.revertedWith("Not authorized as producer");
        });

        it("Should handle duplicate certificate linking", async function () {
            await certificateNFT.connect(certifier).mintCertificate(
                "HALAL-2025-008",
                "Halal",
                producer.address,
                VALIDITY_PERIOD,
                METADATA_URI
            );

            await batchNFT.connect(producer).createBatch(
                "BATCH-2025-008",
                "Test Product",
                100,
                "kg",
                Math.floor(Date.now() / 1000),
                "Test Location",
                [0],
                METADATA_URI
            );

            // Verify the batch first
            await batchNFT.connect(verifier).verifyBatch(0);

            // Try to link the same certificate again
            await expect(
                batchNFT.connect(producer).linkCertificate(0, 0)
            ).to.be.revertedWith("Certificate already linked");
        });
    });

    describe("Performance and Gas Optimization", function () {
        it("Should handle multiple batches efficiently", async function () {
            // Create certificate once
            await certificateNFT.connect(certifier).mintCertificate(
                "HALAL-2025-009",
                "Halal",
                producer.address,
                VALIDITY_PERIOD,
                METADATA_URI
            );

            const batchCount = 5;
            const batchIds: number[] = [];

            // Create multiple batches
            for (let i = 0; i < batchCount; i++) {
                await batchNFT.connect(producer).createBatch(
                    `BATCH-2025-009-${i + 1}`,
                    "Test Product",
                    100,
                    "kg",
                    Math.floor(Date.now() / 1000),
                    "Test Location",
                    [0],
                    METADATA_URI
                );
                batchIds.push(i);
            }

            // Verify all batches
            for (const batchId of batchIds) {
                await batchNFT.connect(verifier).verifyBatch(batchId);
            }

            // Verify all batches are active
            for (const batchId of batchIds) {
                const batch = await batchNFT.getBatch(batchId);
                expect(batch.status).to.equal(1); // Active
                expect(batch.linkedCertificateIds[0]).to.equal(0);
            }
        });

        it("Should measure gas usage for common operations", async function () {
            // Certificate minting
            const certTx = await certificateNFT.connect(certifier).mintCertificate(
                "HALAL-2025-010",
                "Halal",
                producer.address,
                VALIDITY_PERIOD,
                METADATA_URI
            );
            const certReceipt = await certTx.wait();
            console.log(`Certificate minting gas: ${certReceipt?.gasUsed.toString()}`);

            // Batch creation
            const batchTx = await batchNFT.connect(producer).createBatch(
                "BATCH-2025-010",
                "Test Product",
                100,
                "kg",
                Math.floor(Date.now() / 1000),
                "Test Location",
                [0],
                METADATA_URI
            );
            const batchReceipt = await batchTx.wait();
            console.log(`Batch creation gas: ${batchReceipt?.gasUsed.toString()}`);

            // Batch verification
            const verifyTx = await batchNFT.connect(verifier).verifyBatch(0);
            const verifyReceipt = await verifyTx.wait();
            console.log(`Batch verification gas: ${verifyReceipt?.gasUsed.toString()}`);

            // Mark as in transit
            await batchNFT.connect(producer).markAsInTransit(0);

            // Batch transfer
            const transferTx = await batchNFT.connect(producer).transferBatch(0, consumer.address);
            const transferReceipt = await transferTx.wait();
            console.log(`Batch transfer gas: ${transferReceipt?.gasUsed.toString()}`);

            // Gas usage should be reasonable
            expect(certReceipt?.gasUsed).to.be.lessThan(300000);
            expect(batchReceipt?.gasUsed).to.be.lessThan(400000);
            expect(verifyReceipt?.gasUsed).to.be.lessThan(150000);
            expect(transferReceipt?.gasUsed).to.be.lessThan(100000);
        });
    });
});
