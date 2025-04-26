import { ethers } from 'ethers';
import { Certificate, Batch, BatchStatus, CertificateStatus } from '../types';

// Format address for display
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Format timestamp to date string
export const formatDate = (timestamp: number): string => {
  if (!timestamp) return '';
  return new Date(timestamp * 1000).toLocaleString();
};

// Format batch status to readable string
export const formatBatchStatus = (status: BatchStatus): string => {
  switch (status) {
    case BatchStatus.PendingVerification:
      return 'Pending Verification';
    case BatchStatus.Active:
      return 'Active';
    case BatchStatus.InTransit:
      return 'In Transit';
    case BatchStatus.Received:
      return 'Received';
    case BatchStatus.Cancelled:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

// Format certificate status to readable string
export const formatCertificateStatus = (status: CertificateStatus): string => {
  switch (status) {
    case CertificateStatus.Active:
      return 'Active';
    case CertificateStatus.Expired:
      return 'Expired';
    case CertificateStatus.Revoked:
      return 'Revoked';
    default:
      return 'Unknown';
  }
};

// Parse certificate data from contract response
export const parseCertificate = (data: any, tokenId: number): Certificate => {
  return {
    tokenId,
    certIdString: data.certIdString,
    certType: data.certType,
    issuer: data.issuer,
    certifiedEntityAddress: data.certifiedEntityAddress,
    issueTimestamp: data.issueTimestamp.toNumber(),
    expiryTimestamp: data.expiryTimestamp.toNumber(),
    status: data.status,
    metadataURI: data.metadataURI,
  };
};

// Parse batch data from contract response
export const parseBatch = (data: any, tokenId: number): Batch => {
  return {
    tokenId,
    batchId: data.batchId,
    creator: data.creator,
    productType: data.productType,
    quantity: data.quantity.toNumber(),
    unit: data.unit,
    creationTimestamp: data.creationTimestamp.toNumber(),
    harvestTimestamp: data.harvestTimestamp.toNumber(),
    originInfo: data.originInfo,
    status: data.status,
    linkedCertificateIds: data.linkedCertificateIds.map((id: ethers.BigNumber) => id.toNumber()),
    currentOwner: data.currentOwner,
    metadataURI: data.metadataURI,
  };
};

// Generate QR code data for a batch
export const generateBatchQRData = (batchId: number, baseUrl: string): string => {
  return `${baseUrl}/verify/${batchId}`;
};

// Check if a certificate is valid
export const isCertificateValid = (certificate: Certificate): boolean => {
  const now = Math.floor(Date.now() / 1000);
  return (
    certificate.status === CertificateStatus.Active &&
    now <= certificate.expiryTimestamp
  );
};
