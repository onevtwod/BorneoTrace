# BorneoTrace - System Design Documentation

**Version:** 1.0  
**Date:** January 2025  
**Project:** Halal & Sustainable Certification Tracking System on MasChain

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

BorneoTrace employs a hybrid architecture combining on-chain and off-chain components to provide a scalable, secure, and user-friendly platform for supply chain certification tracking.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  Web Browser (React App)     │  Mobile Wallet (MetaMask)       │
│  - User Interface            │  - Wallet Connection            │
│  - QR Code Scanning          │  - Transaction Signing          │
│  - Data Visualization        │  - Account Management           │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  React Frontend (TypeScript)  │  Web3 Context & Hooks          │
│  - Material-UI Components     │  - Contract Interaction        │
│  - Role-based Dashboards      │  - State Management            │
│  - QR Code Integration        │  - Wallet Integration          │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BLOCKCHAIN LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                    MasChain Network                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Registry        │  │ CertificateNFT  │  │ BatchNFT        │  │
│  │ Contract        │  │ Contract        │  │ Contract        │  │
│  │ - Role Mgmt     │  │ - Cert Minting  │  │ - Batch Mgmt    │  │
│  │ - User Auth     │  │ - Validation    │  │ - Transfers     │  │
│  │ - Contract Mgmt │  │ - Revocation    │  │ - Verification  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STORAGE LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  Off-Chain Storage (IPFS)     │  Local Browser Storage         │
│  - Certificate Documents      │  - User Preferences            │
│  - Images & Metadata          │  - Cached Data                 │
│  - Audit Trails              │  - Session Data                │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Component Interaction Flow

```
User Action → Frontend → Web3 Context → Smart Contract → Blockchain
     ↑                                                          │
     └─────────── Event Emission ←─── State Update ←────────────┘
```

## 2. Smart Contract Architecture

### 2.1 Contract Hierarchy

```
Registry Contract (Owner)
├── Manages CertificateNFT Contract
├── Manages BatchNFT Contract
├── User Role Management
└── Contract Deployment

CertificateNFT Contract (ERC721)
├── Certificate Minting
├── Status Management
├── Access Control
└── Metadata Storage

BatchNFT Contract (ERC721)
├── Batch Creation
├── Verification Workflow
├── Ownership Transfer
├── Certificate Linking
└── Status Management
```

### 2.2 Data Models

#### 2.2.1 Certificate Data Structure

```solidity
struct Certificate {
    string certIdString;           // External certificate ID
    string certType;               // Type (Halal, MSPO, Organic, etc.)
    address issuer;                // Certifier address
    address certifiedEntityAddress; // Entity being certified
    uint256 issueTimestamp;        // Issue date
    uint256 expiryTimestamp;       // Expiry date
    CertificateStatus status;      // Active, Expired, Revoked
    string metadataURI;            // Link to off-chain data
}

enum CertificateStatus {
    Active,
    Expired,
    Revoked
}
```

#### 2.2.2 Batch Data Structure

```solidity
struct Batch {
    string batchId;                    // External batch ID
    address creator;                   // Producer address
    string productType;                // Product type
    uint256 quantity;                  // Quantity
    string unit;                       // Unit of measurement
    uint256 creationTimestamp;         // Creation date
    uint256 harvestTimestamp;          // Harvest date
    string originInfo;                 // Origin information
    BatchStatus status;                // Current status
    uint256[] linkedCertificateIds;    // Linked certificate IDs
    address currentOwner;              // Current owner
    string metadataURI;                // Link to off-chain data
}

enum BatchStatus {
    PendingVerification,
    Active,
    InTransit,
    Received,
    Cancelled
}
```

### 2.3 Access Control Matrix

| Role | Certificate Mint | Batch Create | Batch Verify | Batch Transfer | Role Mgmt |
|------|------------------|--------------|--------------|----------------|-----------|
| Certifier | ✅ | ❌ | ❌ | ❌ | ❌ |
| Producer | ❌ | ✅ | ❌ | ✅ (own batches) | ❌ |
| Verifier | ❌ | ❌ | ✅ | ❌ | ❌ |
| Owner | ✅ | ✅ | ✅ | ✅ | ✅ |

## 3. Frontend Architecture

### 3.1 Component Structure

```
src/
├── components/           # Reusable UI components
│   ├── Layout.tsx       # Main layout with navigation
│   ├── CertificateCard.tsx # Certificate display component
│   └── BatchCard.tsx    # Batch display component
├── contexts/            # React contexts
│   └── Web3Context.tsx  # Blockchain interaction context
├── hooks/              # Custom hooks
│   ├── useCertificates.ts # Certificate management hook
│   └── useBatches.ts   # Batch management hook
├── pages/              # Page components
│   ├── HomePage.tsx    # Landing page
│   ├── CertifierDashboard.tsx # Certifier interface
│   ├── ProducerDashboard.tsx # Producer interface
│   ├── VerifierDashboard.tsx # Verifier interface
│   ├── ScanPage.tsx    # QR scanning interface
│   └── VerifyPage.tsx  # Batch verification page
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared types
└── utils/              # Utility functions
    └── index.ts        # Helper functions
```

### 3.2 State Management Architecture

```
Web3Context (Global State)
├── Wallet Connection State
├── Contract Instances
├── User Roles
└── Network Information

Local Component State
├── Form Data
├── UI State (loading, errors)
├── Temporary Data
└── Component-specific State

Blockchain State (Immutable)
├── Certificate Data
├── Batch Data
├── Ownership Records
└── Transaction History
```

### 3.3 Data Flow Architecture

```
1. User Action
   ↓
2. Component Event Handler
   ↓
3. Custom Hook (useCertificates/useBatches)
   ↓
4. Web3Context Contract Interaction
   ↓
5. Smart Contract Function Call
   ↓
6. Blockchain Transaction
   ↓
7. Event Emission
   ↓
8. State Update via Event Listener
   ↓
9. UI Re-render with Updated Data
```

## 4. Security Architecture

### 4.1 Smart Contract Security

#### 4.1.1 Access Control
- **Owner-Only Functions**: Critical operations restricted to contract owner
- **Role-Based Access**: Functions restricted to specific user roles
- **Modifier Pattern**: Reusable access control modifiers
- **Input Validation**: Comprehensive parameter validation

#### 4.1.2 Security Patterns
- **Checks-Effects-Interactions**: Prevent reentrancy attacks
- **Integer Overflow Protection**: SafeMath operations (Solidity 0.8+)
- **External Call Safety**: Proper handling of external contract calls
- **Event Logging**: Comprehensive event emission for audit trails

### 4.2 Frontend Security

#### 4.2.1 Input Validation
- **Client-Side Validation**: Immediate user feedback
- **Type Safety**: TypeScript for compile-time error prevention
- **Sanitization**: Input sanitization before blockchain interaction
- **Rate Limiting**: Prevent spam and abuse

#### 4.2.2 Wallet Security
- **No Private Key Storage**: Private keys remain in user's wallet
- **Transaction Confirmation**: User approval for all transactions
- **Network Validation**: Ensure correct network connection
- **Error Handling**: Graceful handling of wallet errors

### 4.3 Data Security

#### 4.3.1 On-Chain Data
- **Immutable Records**: Data cannot be modified once recorded
- **Cryptographic Integrity**: Blockchain ensures data integrity
- **Transparent Audit Trail**: All operations are publicly verifiable
- **Access Control**: Role-based data access

#### 4.3.2 Off-Chain Data
- **IPFS Integration**: Decentralized file storage
- **Content Addressing**: Cryptographic content verification
- **Metadata Validation**: Ensure metadata integrity
- **Backup Strategies**: Multiple storage locations

## 5. Scalability Design

### 5.1 Blockchain Scalability

#### 5.1.1 MasChain Optimization
- **Gas Optimization**: Efficient smart contract design
- **Batch Operations**: Group multiple operations in single transaction
- **Event Filtering**: Efficient event querying and filtering
- **State Management**: Minimal on-chain state storage

#### 5.1.2 Data Management
- **Metadata Separation**: Store large data off-chain
- **Pagination**: Efficient data retrieval for large datasets
- **Caching Strategy**: Frontend caching for frequently accessed data
- **Indexing**: Efficient data indexing for queries

### 5.2 Frontend Scalability

#### 5.2.1 Performance Optimization
- **Code Splitting**: Lazy loading of components
- **Bundle Optimization**: Minimized JavaScript bundles
- **Image Optimization**: Compressed and responsive images
- **Caching Strategy**: Browser and application-level caching

#### 5.2.2 User Experience
- **Progressive Loading**: Gradual content loading
- **Optimistic Updates**: Immediate UI feedback
- **Error Boundaries**: Graceful error handling
- **Responsive Design**: Mobile-first approach

## 6. Integration Architecture

### 6.1 Blockchain Integration

#### 6.1.1 Web3 Provider
```typescript
interface Web3Provider {
  provider: ethers.providers.Web3Provider;
  signer: ethers.Signer;
  contracts: {
    registry: ethers.Contract;
    certificateNFT: ethers.Contract;
    batchNFT: ethers.Contract;
  };
}
```

#### 6.1.2 Contract Interaction
```typescript
interface ContractInteraction {
  read: (functionName: string, params: any[]) => Promise<any>;
  write: (functionName: string, params: any[]) => Promise<ethers.Transaction>;
  event: (eventName: string, callback: Function) => void;
}
```

### 6.2 External Service Integration

#### 6.2.1 IPFS Integration
- **File Upload**: Store certificate documents and images
- **Content Addressing**: Generate IPFS hashes for content
- **Metadata Linking**: Link IPFS content to blockchain records
- **Retrieval**: Fetch content from IPFS network

#### 6.2.2 QR Code Integration
- **Generation**: Create QR codes with batch verification URLs
- **Scanning**: Camera-based QR code scanning
- **Validation**: Validate scanned QR code data
- **Error Handling**: Handle invalid or corrupted QR codes

## 7. Deployment Architecture

### 7.1 Development Environment

```
Local Development
├── Hardhat Network (Local blockchain)
├── React Development Server (Vite)
├── MetaMask (Test accounts)
└── IPFS Local Node (Optional)
```

### 7.2 Testnet Deployment

```
MasChain Testnet
├── Smart Contract Deployment
├── Contract Verification
├── Frontend Deployment (Vercel/Netlify)
├── Domain Configuration
└── SSL Certificate Setup
```

### 7.3 Production Deployment

```
MasChain Mainnet
├── Smart Contract Deployment
├── Contract Verification
├── Frontend CDN Deployment
├── Custom Domain Setup
├── Monitoring & Analytics
└── Backup & Recovery
```

## 8. Monitoring and Analytics

### 8.1 Smart Contract Monitoring

#### 8.1.1 Event Monitoring
- **Transaction Success/Failure**: Monitor contract interactions
- **Gas Usage**: Track gas consumption patterns
- **Error Rates**: Monitor failed transactions
- **User Activity**: Track user interaction patterns

#### 8.1.2 Performance Metrics
- **Transaction Latency**: Time from submission to confirmation
- **Block Confirmation**: Time to final confirmation
- **Network Congestion**: Impact on user experience
- **Cost Analysis**: Transaction cost trends

### 8.2 Frontend Analytics

#### 8.2.1 User Behavior
- **Page Views**: Track user navigation patterns
- **Feature Usage**: Monitor feature adoption
- **Error Tracking**: Capture and analyze errors
- **Performance Metrics**: Page load times and responsiveness

#### 8.2.2 Business Metrics
- **Certificate Issuance**: Track certification activity
- **Batch Creation**: Monitor production activity
- **User Engagement**: Measure platform usage
- **Conversion Rates**: Track user onboarding success

## 9. Future Architecture Considerations

### 9.1 Phase 2 Enhancements

#### 9.1.1 IoT Integration Architecture
```
IoT Sensors → Data Collection → Oracle Network → Smart Contracts
     ↓              ↓              ↓              ↓
Temperature    Edge Computing   Chainlink      Batch Updates
Humidity       Data Processing  Oracles        Status Changes
GPS Location   Data Validation  Verification   Audit Trail
```

#### 9.1.2 Mobile Application Architecture
```
React Native App
├── Native QR Scanning
├── Push Notifications
├── Offline Data Sync
├── Biometric Auth
└── Background Processing
```

### 9.2 Phase 3 Governance Architecture

#### 9.2.1 DAO Structure
```
Governance Token
├── Voting Power
├── Proposal Creation
├── Treasury Management
└── Protocol Upgrades

DAO Smart Contracts
├── Voting Mechanisms
├── Proposal Management
├── Treasury Operations
└── Upgrade Governance
```

---

**Document Control:**
- Created: January 2025
- Version: 1.0
- Next Review: March 2025
- Owner: BorneoTrace Development Team
