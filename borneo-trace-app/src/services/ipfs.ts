/**
 * IPFS Service for BorneoTrace
 * Handles file upload, storage, and retrieval using IPFS
 */

import { create, IPFSHTTPClient } from 'ipfs-http-client';

export interface IPFSFile {
    hash: string;
    size: number;
    name?: string;
    type?: string;
}

export interface IPFSUploadResult {
    success: boolean;
    hash?: string;
    url?: string;
    error?: string;
}

class IPFSService {
    private client: IPFSHTTPClient | null = null;
    private gateway: string;

    constructor() {
        // Initialize IPFS client
        this.initializeClient();
        this.gateway = process.env.REACT_APP_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';
    }

    private initializeClient() {
        try {
            // Try to connect to local IPFS node first, then fallback to Infura
            const ipfsUrl = process.env.REACT_APP_IPFS_URL || 'https://ipfs.infura.io:5001/api/v0';

            this.client = create({
                url: ipfsUrl,
                headers: {
                    authorization: this.getAuthHeader()
                }
            });

            console.log('IPFS client initialized successfully');
        } catch (error) {
            console.error('Failed to initialize IPFS client:', error);
            this.client = null;
        }
    }

    private getAuthHeader(): string {
        const projectId = process.env.REACT_APP_INFURA_PROJECT_ID;
        const projectSecret = process.env.REACT_APP_INFURA_PROJECT_SECRET;

        if (projectId && projectSecret) {
            return `Basic ${btoa(`${projectId}:${projectSecret}`)}`;
        }

        return '';
    }

    /**
     * Upload a file to IPFS
     */
    async uploadFile(file: File): Promise<IPFSUploadResult> {
        if (!this.client) {
            return {
                success: false,
                error: 'IPFS client not initialized'
            };
        }

        try {
            console.log(`Uploading file: ${file.name} (${file.size} bytes)`);

            const result = await this.client.add(file, {
                progress: (prog) => {
                    console.log(`Upload progress: ${prog}`);
                }
            });

            const hash = result.path;
            const url = `${this.gateway}${hash}`;

            console.log(`File uploaded successfully: ${hash}`);

            return {
                success: true,
                hash,
                url
            };
        } catch (error) {
            console.error('IPFS upload failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Upload failed'
            };
        }
    }

    /**
     * Upload multiple files to IPFS
     */
    async uploadFiles(files: File[]): Promise<IPFSUploadResult[]> {
        const results: IPFSUploadResult[] = [];

        for (const file of files) {
            const result = await this.uploadFile(file);
            results.push(result);
        }

        return results;
    }

    /**
     * Upload JSON data to IPFS
     */
    async uploadJSON(data: any, filename?: string): Promise<IPFSUploadResult> {
        if (!this.client) {
            return {
                success: false,
                error: 'IPFS client not initialized'
            };
        }

        try {
            const jsonString = JSON.stringify(data, null, 2);
            const jsonBuffer = new TextEncoder().encode(jsonString);

            const result = await this.client.add(jsonBuffer, {
                progress: (prog) => {
                    console.log(`JSON upload progress: ${prog}`);
                }
            });

            const hash = result.path;
            const url = `${this.gateway}${hash}`;

            console.log(`JSON uploaded successfully: ${hash}`);

            return {
                success: true,
                hash,
                url
            };
        } catch (error) {
            console.error('IPFS JSON upload failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'JSON upload failed'
            };
        }
    }

    /**
     * Get file from IPFS by hash
     */
    async getFile(hash: string): Promise<Uint8Array | null> {
        if (!this.client) {
            console.error('IPFS client not initialized');
            return null;
        }

        try {
            const chunks: Uint8Array[] = [];

            for await (const chunk of this.client.cat(hash)) {
                chunks.push(chunk);
            }

            // Combine all chunks into a single Uint8Array
            const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
            const result = new Uint8Array(totalLength);
            let offset = 0;

            for (const chunk of chunks) {
                result.set(chunk, offset);
                offset += chunk.length;
            }

            return result;
        } catch (error) {
            console.error(`Failed to get file ${hash}:`, error);
            return null;
        }
    }

    /**
     * Get JSON data from IPFS by hash
     */
    async getJSON<T = any>(hash: string): Promise<T | null> {
        try {
            const fileData = await this.getFile(hash);

            if (!fileData) {
                return null;
            }

            const jsonString = new TextDecoder().decode(fileData);
            return JSON.parse(jsonString);
        } catch (error) {
            console.error(`Failed to get JSON ${hash}:`, error);
            return null;
        }
    }

    /**
     * Get file URL for display
     */
    getFileURL(hash: string): string {
        return `${this.gateway}${hash}`;
    }

    /**
     * Pin a file to IPFS (keeps it available)
     */
    async pinFile(hash: string): Promise<boolean> {
        if (!this.client) {
            console.error('IPFS client not initialized');
            return false;
        }

        try {
            await this.client.pin.add(hash);
            console.log(`File ${hash} pinned successfully`);
            return true;
        } catch (error) {
            console.error(`Failed to pin file ${hash}:`, error);
            return false;
        }
    }

    /**
     * Unpin a file from IPFS
     */
    async unpinFile(hash: string): Promise<boolean> {
        if (!this.client) {
            console.error('IPFS client not initialized');
            return false;
        }

        try {
            await this.client.pin.rm(hash);
            console.log(`File ${hash} unpinned successfully`);
            return true;
        } catch (error) {
            console.error(`Failed to unpin file ${hash}:`, error);
            return false;
        }
    }

    /**
     * Check if IPFS is available
     */
    isAvailable(): boolean {
        return this.client !== null;
    }

    /**
     * Get IPFS node information
     */
    async getNodeInfo(): Promise<any> {
        if (!this.client) {
            throw new Error('IPFS client not initialized');
        }

        try {
            const id = await this.client.id();
            return id;
        } catch (error) {
            console.error('Failed to get IPFS node info:', error);
            throw error;
        }
    }
}

// Create singleton instance
export const ipfsService = new IPFSService();

// Utility functions
export const uploadCertificateDocument = async (file: File) => {
    const result = await ipfsService.uploadFile(file);

    if (result.success && result.hash) {
        // Pin the file to ensure availability
        await ipfsService.pinFile(result.hash);
    }

    return result;
};

export const uploadBatchMetadata = async (metadata: any) => {
    return await ipfsService.uploadJSON(metadata, 'batch-metadata.json');
};

export const getCertificateDocument = async (hash: string) => {
    return await ipfsService.getFile(hash);
};

export const getBatchMetadata = async (hash: string) => {
    return await ipfsService.getJSON(hash);
};

export default ipfsService;
