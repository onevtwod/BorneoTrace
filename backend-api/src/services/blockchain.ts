import { ethers } from 'ethers';
import { Logger } from '../utils/logger';

export interface ContractAddresses {
    registry: string;
    certificateNFT: string;
    batchNFT: string;
}

export interface NetworkConfig {
    name: string;
    rpcUrl: string;
    chainId: number;
    blockExplorer?: string;
}

class BlockchainService {
    private provider: ethers.providers.JsonRpcProvider | null = null;
    private contracts: {
        registry: ethers.Contract | null;
        certificateNFT: ethers.Contract | null;
        batchNFT: ethers.Contract | null;
    } = {
            registry: null,
            certificateNFT: null,
            batchNFT: null
        };
    private contractAddresses: ContractAddresses | null = null;
    private logger = new Logger('BlockchainService');

    constructor() {
        this.initializeProvider();
    }

    private initializeProvider() {
        try {
            const rpcUrl = process.env.MASCHAIN_RPC_URL || 'http://localhost:8545';
            this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
            this.logger.info('Blockchain provider initialized', { rpcUrl });
        } catch (error) {
            this.logger.error('Failed to initialize blockchain provider', error);
        }
    }

    async initializeContracts(addresses: ContractAddresses) {
        if (!this.provider) {
            throw new Error('Blockchain provider not initialized');
        }

        try {
            // Import contract ABIs
            const RegistryABI = require('../../artifacts/contracts/Registry.sol/Registry.json');
            const CertificateNFTABI = require('../../artifacts/contracts/CertificateNFT.sol/CertificateNFT.json');
            const BatchNFTABI = require('../../artifacts/contracts/BatchNFT.sol/BatchNFT.json');

            // Initialize contracts
            this.contracts.registry = new ethers.Contract(
                addresses.registry,
                RegistryABI.abi,
                this.provider
            );

            this.contracts.certificateNFT = new ethers.Contract(
                addresses.certificateNFT,
                CertificateNFTABI.abi,
                this.provider
            );

            this.contracts.batchNFT = new ethers.Contract(
                addresses.batchNFT,
                BatchNFTABI.abi,
                this.provider
            );

            this.contractAddresses = addresses;
            this.logger.info('Contracts initialized successfully', { addresses });
        } catch (error) {
            this.logger.error('Failed to initialize contracts', error);
            throw error;
        }
    }

    // Certificate operations
    async getCertificate(tokenId: number) {
        if (!this.contracts.certificateNFT) {
            throw new Error('Certificate contract not initialized');
        }

        try {
            const certificate = await this.contracts.certificateNFT.getCertificate(tokenId);
            const isValid = await this.contracts.certificateNFT.isValid(tokenId);
            const owner = await this.contracts.certificateNFT.ownerOf(tokenId);

            return {
                tokenId,
                certIdString: certificate.certIdString,
                certType: certificate.certType,
                issuer: certificate.issuer,
                certifiedEntityAddress: certificate.certifiedEntityAddress,
                issueTimestamp: certificate.issueTimestamp.toString(),
                expiryTimestamp: certificate.expiryTimestamp.toString(),
                status: certificate.status,
                metadataURI: certificate.metadataURI,
                isValid,
                owner
            };
        } catch (error) {
            this.logger.error(`Failed to get certificate ${tokenId}`, error);
            throw error;
        }
    }

    async getCertificatesByOwner(ownerAddress: string) {
        if (!this.contracts.certificateNFT) {
            throw new Error('Certificate contract not initialized');
        }

        try {
            // Get total supply to iterate through all tokens
            const totalSupply = await this.contracts.certificateNFT.totalSupply();
            const certificates = [];

            for (let i = 1; i <= totalSupply; i++) {
                try {
                    const owner = await this.contracts.certificateNFT.ownerOf(i);
                    if (owner.toLowerCase() === ownerAddress.toLowerCase()) {
                        const certificate = await this.getCertificate(i);
                        certificates.push(certificate);
                    }
                } catch (error) {
                    // Token doesn't exist, continue
                    continue;
                }
            }

            return certificates;
        } catch (error) {
            this.logger.error(`Failed to get certificates for owner ${ownerAddress}`, error);
            throw error;
        }
    }

    // Batch operations
    async getBatch(tokenId: number) {
        if (!this.contracts.batchNFT) {
            throw new Error('Batch contract not initialized');
        }

        try {
            const batch = await this.contracts.batchNFT.getBatch(tokenId);
            const owner = await this.contracts.batchNFT.ownerOf(tokenId);

            return {
                tokenId,
                batchId: batch.batchId,
                creator: batch.creator,
                productType: batch.productType,
                quantity: batch.quantity.toString(),
                unit: batch.unit,
                creationTimestamp: batch.creationTimestamp.toString(),
                harvestTimestamp: batch.harvestTimestamp.toString(),
                originInfo: batch.originInfo,
                status: batch.status,
                linkedCertificateIds: batch.linkedCertificateIds.map((id: any) => id.toString()),
                currentOwner: batch.currentOwner,
                metadataURI: batch.metadataURI,
                owner
            };
        } catch (error) {
            this.logger.error(`Failed to get batch ${tokenId}`, error);
            throw error;
        }
    }

    async getBatchesByOwner(ownerAddress: string) {
        if (!this.contracts.batchNFT) {
            throw new Error('Batch contract not initialized');
        }

        try {
            const totalSupply = await this.contracts.batchNFT.totalSupply();
            const batches = [];

            for (let i = 1; i <= totalSupply; i++) {
                try {
                    const owner = await this.contracts.batchNFT.ownerOf(i);
                    if (owner.toLowerCase() === ownerAddress.toLowerCase()) {
                        const batch = await this.getBatch(i);
                        batches.push(batch);
                    }
                } catch (error) {
                    // Token doesn't exist, continue
                    continue;
                }
            }

            return batches;
        } catch (error) {
            this.logger.error(`Failed to get batches for owner ${ownerAddress}`, error);
            throw error;
        }
    }

    async getPendingBatches() {
        if (!this.contracts.batchNFT) {
            throw new Error('Batch contract not initialized');
        }

        try {
            // This would require a signer to call, so we'll implement it differently
            // For now, we'll get all batches and filter by status
            const totalSupply = await this.contracts.batchNFT.totalSupply();
            const pendingBatches = [];

            for (let i = 1; i <= totalSupply; i++) {
                try {
                    const batch = await this.getBatch(i);
                    if (batch.status === 0) { // PendingVerification
                        pendingBatches.push(batch);
                    }
                } catch (error) {
                    continue;
                }
            }

            return pendingBatches;
        } catch (error) {
            this.logger.error('Failed to get pending batches', error);
            throw error;
        }
    }

    // User role operations
    async getUserRoles(userAddress: string) {
        if (!this.contracts.registry) {
            throw new Error('Registry contract not initialized');
        }

        try {
            const [isCertifier, isProducer, isVerifier] = await Promise.all([
                this.contracts.registry.isCertifier(userAddress),
                this.contracts.registry.isProducer(userAddress),
                this.contracts.registry.isVerifier(userAddress)
            ]);

            return {
                isCertifier,
                isProducer,
                isVerifier,
                isConsumer: true // Everyone is a consumer by default
            };
        } catch (error) {
            this.logger.error(`Failed to get user roles for ${userAddress}`, error);
            throw error;
        }
    }

    // Event listening
    async getCertificateEvents(fromBlock?: number, toBlock?: number) {
        if (!this.contracts.certificateNFT) {
            throw new Error('Certificate contract not initialized');
        }

        try {
            const filter = this.contracts.certificateNFT.filters.CertificateCreated();
            const events = await this.contracts.certificateNFT.queryFilter(filter, fromBlock, toBlock);

            return events.map(event => ({
                transactionHash: event.transactionHash,
                blockNumber: event.blockNumber,
                tokenId: event.args?.tokenId.toString(),
                certIdString: event.args?.certIdString,
                issuer: event.args?.issuer,
                certifiedEntity: event.args?.certifiedEntity,
                timestamp: new Date().toISOString()
            }));
        } catch (error) {
            this.logger.error('Failed to get certificate events', error);
            throw error;
        }
    }

    async getBatchEvents(fromBlock?: number, toBlock?: number) {
        if (!this.contracts.batchNFT) {
            throw new Error('Batch contract not initialized');
        }

        try {
            const events = await Promise.all([
                this.contracts.batchNFT.queryFilter(this.contracts.batchNFT.filters.BatchCreated(), fromBlock, toBlock),
                this.contracts.batchNFT.queryFilter(this.contracts.batchNFT.filters.BatchVerified(), fromBlock, toBlock),
                this.contracts.batchNFT.queryFilter(this.contracts.batchNFT.filters.BatchTransferred(), fromBlock, toBlock)
            ]);

            const allEvents = events.flat().sort((a, b) => a.blockNumber - b.blockNumber);

            return allEvents.map(event => ({
                transactionHash: event.transactionHash,
                blockNumber: event.blockNumber,
                eventName: event.event,
                tokenId: event.args?.tokenId?.toString(),
                batchId: event.args?.batchId,
                from: event.args?.from,
                to: event.args?.to,
                timestamp: new Date().toISOString()
            }));
        } catch (error) {
            this.logger.error('Failed to get batch events', error);
            throw error;
        }
    }

    // Network information
    async getNetworkInfo() {
        if (!this.provider) {
            throw new Error('Blockchain provider not initialized');
        }

        try {
            const [network, blockNumber, gasPrice] = await Promise.all([
                this.provider.getNetwork(),
                this.provider.getBlockNumber(),
                this.provider.getGasPrice()
            ]);

            return {
                name: network.name,
                chainId: network.chainId,
                blockNumber,
                gasPrice: gasPrice.toString()
            };
        } catch (error) {
            this.logger.error('Failed to get network info', error);
            throw error;
        }
    }

    // Utility methods
    isValidAddress(address: string): boolean {
        return ethers.utils.isAddress(address);
    }

    formatAddress(address: string): string {
        return ethers.utils.getAddress(address);
    }

    getContractAddresses(): ContractAddresses | null {
        return this.contractAddresses;
    }

    isInitialized(): boolean {
        return this.contracts.registry !== null &&
            this.contracts.certificateNFT !== null &&
            this.contracts.batchNFT !== null;
    }
}

// Export singleton instance
export const blockchainService = new BlockchainService();
export default blockchainService;
