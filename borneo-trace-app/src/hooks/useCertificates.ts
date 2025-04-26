import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import { Certificate } from '../types';
import { parseCertificate } from '../utils';

export const useCertificates = () => {
  const { contracts, account } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mint a new certificate
  const mintCertificate = useCallback(
    async (
      certIdString: string,
      certType: string,
      certifiedEntityAddress: string,
      validityPeriod: number,
      metadataURI: string
    ): Promise<number | null> => {
      if (!contracts.certificateNFT || !account) {
        setError('Contract or account not available');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const tx = await contracts.certificateNFT.mintCertificate(
          certIdString,
          certType,
          certifiedEntityAddress,
          validityPeriod,
          metadataURI
        );

        const receipt = await tx.wait();
        
        // Find the CertificateCreated event to get the token ID
        const event = receipt.events?.find(
          (e: any) => e.event === 'CertificateCreated'
        );
        
        if (event && event.args) {
          const tokenId = event.args.tokenId.toNumber();
          return tokenId;
        }
        
        return null;
      } catch (err) {
        console.error('Error minting certificate:', err);
        setError('Failed to mint certificate');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [contracts.certificateNFT, account]
  );

  // Get certificate details
  const getCertificate = useCallback(
    async (tokenId: number): Promise<Certificate | null> => {
      if (!contracts.certificateNFT) {
        setError('Contract not available');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await contracts.certificateNFT.getCertificate(tokenId);
        return parseCertificate(data, tokenId);
      } catch (err) {
        console.error('Error getting certificate:', err);
        setError('Failed to get certificate');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [contracts.certificateNFT]
  );

  // Check if a certificate is valid
  const isCertificateValid = useCallback(
    async (tokenId: number): Promise<boolean> => {
      if (!contracts.certificateNFT) {
        setError('Contract not available');
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        return await contracts.certificateNFT.isValid(tokenId);
      } catch (err) {
        console.error('Error checking certificate validity:', err);
        setError('Failed to check certificate validity');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [contracts.certificateNFT]
  );

  // Revoke a certificate
  const revokeCertificate = useCallback(
    async (tokenId: number, reason: string): Promise<boolean> => {
      if (!contracts.certificateNFT || !account) {
        setError('Contract or account not available');
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const tx = await contracts.certificateNFT.revokeCertificate(tokenId, reason);
        await tx.wait();
        return true;
      } catch (err) {
        console.error('Error revoking certificate:', err);
        setError('Failed to revoke certificate');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [contracts.certificateNFT, account]
  );

  // Get certificates owned by the current user
  const getOwnedCertificates = useCallback(async (): Promise<Certificate[]> => {
    if (!contracts.certificateNFT || !account) {
      setError('Contract or account not available');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      // This is a simplified approach - in a real app, you'd need to query events or use a subgraph
      // For demo purposes, we'll just check the first 100 tokens
      const certificates: Certificate[] = [];
      
      for (let i = 1; i <= 100; i++) {
        try {
          const owner = await contracts.certificateNFT.ownerOf(i);
          
          if (owner.toLowerCase() === account.toLowerCase()) {
            const data = await contracts.certificateNFT.getCertificate(i);
            certificates.push(parseCertificate(data, i));
          }
        } catch (err) {
          // Token doesn't exist or other error, continue
          continue;
        }
      }
      
      return certificates;
    } catch (err) {
      console.error('Error getting owned certificates:', err);
      setError('Failed to get owned certificates');
      return [];
    } finally {
      setLoading(false);
    }
  }, [contracts.certificateNFT, account]);

  return {
    mintCertificate,
    getCertificate,
    isCertificateValid,
    revokeCertificate,
    getOwnedCertificates,
    loading,
    error,
  };
};
