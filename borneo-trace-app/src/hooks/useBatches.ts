import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import { Batch } from '../types';
import { parseBatch } from '../utils';

export const useBatches = () => {
  const { contracts, account } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new batch
  const createBatch = useCallback(
    async (
      batchId: string,
      productType: string,
      quantity: number,
      unit: string,
      harvestTimestamp: number,
      originInfo: string,
      linkedCertificateIds: number[],
      metadataURI: string
    ): Promise<number | null> => {
      if (!contracts.batchNFT || !account) {
        setError('Contract or account not available');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const tx = await contracts.batchNFT.createBatch(
          batchId,
          productType,
          quantity,
          unit,
          harvestTimestamp,
          originInfo,
          linkedCertificateIds,
          metadataURI
        );

        const receipt = await tx.wait();
        
        // Find the BatchCreated event to get the token ID
        const event = receipt.events?.find(
          (e: any) => e.event === 'BatchCreated'
        );
        
        if (event && event.args) {
          const tokenId = event.args.tokenId.toNumber();
          return tokenId;
        }
        
        return null;
      } catch (err) {
        console.error('Error creating batch:', err);
        setError('Failed to create batch');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [contracts.batchNFT, account]
  );

  // Verify a batch
  const verifyBatch = useCallback(
    async (tokenId: number): Promise<boolean> => {
      if (!contracts.batchNFT || !account) {
        setError('Contract or account not available');
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const tx = await contracts.batchNFT.verifyBatch(tokenId);
        await tx.wait();
        return true;
      } catch (err) {
        console.error('Error verifying batch:', err);
        setError('Failed to verify batch');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [contracts.batchNFT, account]
  );

  // Get batch details
  const getBatch = useCallback(
    async (tokenId: number): Promise<Batch | null> => {
      if (!contracts.batchNFT) {
        setError('Contract not available');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await contracts.batchNFT.getBatch(tokenId);
        return parseBatch(data, tokenId);
      } catch (err) {
        console.error('Error getting batch:', err);
        setError('Failed to get batch');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [contracts.batchNFT]
  );

  // Transfer batch ownership
  const transferBatch = useCallback(
    async (tokenId: number, to: string): Promise<boolean> => {
      if (!contracts.batchNFT || !account) {
        setError('Contract or account not available');
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const tx = await contracts.batchNFT.transferBatch(tokenId, to);
        await tx.wait();
        return true;
      } catch (err) {
        console.error('Error transferring batch:', err);
        setError('Failed to transfer batch');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [contracts.batchNFT, account]
  );

  // Mark batch as in transit
  const markAsInTransit = useCallback(
    async (tokenId: number): Promise<boolean> => {
      if (!contracts.batchNFT || !account) {
        setError('Contract or account not available');
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const tx = await contracts.batchNFT.markAsInTransit(tokenId);
        await tx.wait();
        return true;
      } catch (err) {
        console.error('Error marking batch as in transit:', err);
        setError('Failed to mark batch as in transit');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [contracts.batchNFT, account]
  );

  // Cancel a batch
  const cancelBatch = useCallback(
    async (tokenId: number, reason: string): Promise<boolean> => {
      if (!contracts.batchNFT || !account) {
        setError('Contract or account not available');
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const tx = await contracts.batchNFT.cancelBatch(tokenId, reason);
        await tx.wait();
        return true;
      } catch (err) {
        console.error('Error cancelling batch:', err);
        setError('Failed to cancel batch');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [contracts.batchNFT, account]
  );

  // Link a certificate to a batch
  const linkCertificate = useCallback(
    async (batchId: number, certificateId: number): Promise<boolean> => {
      if (!contracts.batchNFT || !account) {
        setError('Contract or account not available');
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const tx = await contracts.batchNFT.linkCertificate(batchId, certificateId);
        await tx.wait();
        return true;
      } catch (err) {
        console.error('Error linking certificate:', err);
        setError('Failed to link certificate');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [contracts.batchNFT, account]
  );

  // Get pending batches for verification
  const getPendingBatches = useCallback(async (): Promise<number[]> => {
    if (!contracts.batchNFT || !account) {
      setError('Contract or account not available');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const pendingBatches = await contracts.batchNFT.getPendingBatches();
      return pendingBatches.map((id: ethers.BigNumber) => id.toNumber());
    } catch (err) {
      console.error('Error getting pending batches:', err);
      setError('Failed to get pending batches');
      return [];
    } finally {
      setLoading(false);
    }
  }, [contracts.batchNFT, account]);

  // Get batches owned by the current user
  const getOwnedBatches = useCallback(async (): Promise<Batch[]> => {
    if (!contracts.batchNFT || !account) {
      setError('Contract or account not available');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      // This is a simplified approach - in a real app, you'd need to query events or use a subgraph
      // For demo purposes, we'll just check the first 100 tokens
      const batches: Batch[] = [];
      
      for (let i = 1; i <= 100; i++) {
        try {
          const owner = await contracts.batchNFT.ownerOf(i);
          
          if (owner.toLowerCase() === account.toLowerCase()) {
            const data = await contracts.batchNFT.getBatch(i);
            batches.push(parseBatch(data, i));
          }
        } catch (err) {
          // Token doesn't exist or other error, continue
          continue;
        }
      }
      
      return batches;
    } catch (err) {
      console.error('Error getting owned batches:', err);
      setError('Failed to get owned batches');
      return [];
    } finally {
      setLoading(false);
    }
  }, [contracts.batchNFT, account]);

  return {
    createBatch,
    verifyBatch,
    getBatch,
    transferBatch,
    markAsInTransit,
    cancelBatch,
    linkCertificate,
    getPendingBatches,
    getOwnedBatches,
    loading,
    error,
  };
};
