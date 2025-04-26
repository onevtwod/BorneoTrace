// Certificate types
export enum CertificateStatus {
  Active = 0,
  Expired = 1,
  Revoked = 2
}

export interface Certificate {
  tokenId: number;
  certIdString: string;
  certType: string;
  issuer: string;
  certifiedEntityAddress: string;
  issueTimestamp: number;
  expiryTimestamp: number;
  status: CertificateStatus;
  metadataURI: string;
}

// Batch types
export enum BatchStatus {
  PendingVerification = 0,
  Active = 1,
  InTransit = 2,
  Received = 3,
  Cancelled = 4
}

export interface Batch {
  tokenId: number;
  batchId: string;
  creator: string;
  productType: string;
  quantity: number;
  unit: string;
  creationTimestamp: number;
  harvestTimestamp: number;
  originInfo: string;
  status: BatchStatus;
  linkedCertificateIds: number[];
  currentOwner: string;
  metadataURI: string;
}

// User roles
export enum UserRole {
  Certifier = 'certifier',
  Producer = 'producer',
  Verifier = 'verifier',
  Consumer = 'consumer'
}

export interface User {
  address: string;
  roles: UserRole[];
}

// Contract interfaces
export interface ContractAddresses {
  registry: string;
  certificateNFT: string;
  batchNFT: string;
}
