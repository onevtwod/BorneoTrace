# BorneoTrace - Requirements Specification

**Version:** 1.0  
**Date:** January 2025  
**Project:** Halal & Sustainable Certification Tracking System on MasChain

---

## 1. Project Overview

BorneoTrace is a blockchain-based platform leveraging MasChain to track the provenance and certification status of products, particularly focusing on agricultural and food & beverage industries relevant to Sabah and Malaysia. The system aims to enhance transparency, traceability, and trust within supply chains, aligning with UN Sustainable Development Goal 9.

## 2. Functional Requirements

### 2.1 User Roles and Access Control

#### 2.1.1 Certifier Role
- **FR-001**: Certifiers must be able to mint digital certificate NFTs for various certification types (Halal, MSPO, Organic, Fair Trade)
- **FR-002**: Certifiers must be able to specify certificate validity periods
- **FR-003**: Certifiers must be able to link off-chain documents (PDFs, images) to certificates via metadata URIs
- **FR-004**: Certifiers must be able to revoke certificates with specified reasons
- **FR-005**: Only authorized certifiers should be able to issue certificates
- **FR-006**: Certifiers must be able to view all certificates they have issued

#### 2.1.2 Producer Role
- **FR-007**: Producers must be able to create product batch NFTs with basic information (product type, quantity, harvest date, origin)
- **FR-008**: Producers must be able to link valid certificates to their batches
- **FR-009**: Producers must be able to submit batches for verification before activation
- **FR-010**: Producers must be able to transfer batch ownership to other entities (logistics, retailers)
- **FR-011**: Producers must be able to cancel batches before transfer
- **FR-012**: Producers must be able to view all batches they have created

#### 2.1.3 Verifier Role
- **FR-013**: Verifiers must be able to view pending batch verification requests
- **FR-014**: Verifiers must be able to approve or reject batch creation requests
- **FR-015**: Only authorized verifiers should be able to approve batches
- **FR-016**: Verifiers must be able to view verification history

#### 2.1.4 Consumer Role
- **FR-017**: Consumers must be able to scan QR codes to access product information
- **FR-018**: Consumers must be able to manually enter batch IDs for verification
- **FR-019**: Consumers must be able to view complete product journey from source to shelf
- **FR-020**: Consumers must be able to verify certificate authenticity and validity
- **FR-021**: Consumers must be able to access linked documentation (certificates, images)

### 2.2 Smart Contract Requirements

#### 2.2.1 Certificate NFT Contract
- **FR-022**: Contract must implement ERC721 standard with URI storage extension
- **FR-023**: Contract must support certificate status management (Active, Expired, Revoked)
- **FR-024**: Contract must enforce authorized certifier access control
- **FR-025**: Contract must validate certificate data before minting
- **FR-026**: Contract must emit events for certificate creation and revocation

#### 2.2.2 Batch NFT Contract
- **FR-027**: Contract must implement ERC721 standard with URI storage extension
- **FR-028**: Contract must support batch status management (PendingVerification, Active, InTransit, Received, Cancelled)
- **FR-029**: Contract must enforce authorized producer and verifier access control
- **FR-030**: Contract must validate linked certificates before batch creation
- **FR-031**: Contract must support ownership transfer between entities
- **FR-032**: Contract must emit events for batch creation, verification, and transfer

#### 2.2.3 Registry Contract
- **FR-033**: Contract must manage user role assignments (Certifier, Producer, Verifier)
- **FR-034**: Contract must deploy and manage certificate and batch contracts
- **FR-035**: Contract must provide role verification functions
- **FR-036**: Contract must emit events for role changes and contract deployments

### 2.3 Frontend Application Requirements

#### 2.3.1 User Interface
- **FR-037**: Application must provide responsive web interface compatible with desktop and mobile devices
- **FR-038**: Application must implement Material-UI design system for consistent user experience
- **FR-039**: Application must provide role-based navigation and dashboards
- **FR-040**: Application must display loading states and error messages appropriately
- **FR-041**: Application must support wallet connection and account management

#### 2.3.2 Blockchain Integration
- **FR-042**: Application must integrate with MetaMask wallet for blockchain interaction
- **FR-043**: Application must provide real-time blockchain data fetching and display
- **FR-044**: Application must handle transaction confirmation and error states
- **FR-045**: Application must support network switching and chain validation
- **FR-046**: Application must provide contract interaction through Web3 context

#### 2.3.3 QR Code Functionality
- **FR-047**: Application must provide QR code scanning capability using device camera
- **FR-048**: Application must support manual batch ID entry as alternative to scanning
- **FR-049**: Application must generate QR codes for batch verification URLs
- **FR-050**: Application must handle QR code parsing and validation

## 3. Non-Functional Requirements

### 3.1 Performance Requirements
- **NFR-001**: Smart contract transactions should complete within 30 seconds on MasChain
- **NFR-002**: Frontend application should load within 3 seconds on standard internet connection
- **NFR-003**: QR code scanning should respond within 1 second of successful scan
- **NFR-004**: Blockchain data fetching should complete within 5 seconds

### 3.2 Security Requirements
- **NFR-005**: Smart contracts must follow OpenZeppelin security standards
- **NFR-006**: Access control must be enforced at contract level
- **NFR-007**: Private key management must be handled by user's wallet
- **NFR-008**: Input validation must be implemented on both frontend and smart contracts
- **NFR-009**: Certificate and batch data must be immutable once recorded on blockchain

### 3.3 Usability Requirements
- **NFR-010**: User interface must be intuitive for non-technical users
- **NFR-011**: Application must provide clear feedback for all user actions
- **NFR-012**: Error messages must be user-friendly and actionable
- **NFR-013**: Application must support multiple languages (English and Bahasa Malaysia)
- **NFR-014**: Mobile interface must be touch-friendly with appropriate button sizes

### 3.4 Compatibility Requirements
- **NFR-015**: Application must be compatible with modern web browsers (Chrome, Firefox, Safari, Edge)
- **NFR-016**: Smart contracts must be compatible with EVM-based MasChain network
- **NFR-017**: Application must work with MetaMask and other Web3 wallets
- **NFR-018**: QR code scanning must work on devices with camera capability

### 3.5 Reliability Requirements
- **NFR-019**: Smart contracts must handle edge cases and prevent common vulnerabilities
- **NFR-020**: Frontend application must gracefully handle network failures
- **NFR-021**: Application must maintain data consistency between blockchain and UI
- **NFR-022**: System must provide audit trail for all certificate and batch operations

## 4. Technical Requirements

### 4.1 Blockchain Technology
- **TR-001**: Smart contracts must be written in Solidity version 0.8.20 or higher
- **TR-002**: Contracts must use OpenZeppelin libraries for security and standards compliance
- **TR-003**: Development environment must use Hardhat framework
- **TR-004**: Contracts must be deployed on MasChain testnet and mainnet

### 4.2 Frontend Technology
- **TR-005**: Frontend must be built with React 19 and TypeScript
- **TR-006**: Application must use Vite as build tool and development server
- **TR-007**: UI components must use Material-UI (MUI) library
- **TR-008**: Blockchain interaction must use ethers.js library
- **TR-009**: Application must use React Router for navigation

### 4.3 Development Tools
- **TR-010**: Code must be managed with Git version control
- **TR-011**: Smart contracts must include comprehensive test coverage
- **TR-012**: Frontend must include ESLint and TypeScript configuration
- **TR-013**: Project must include proper package.json and dependency management

## 5. Data Requirements

### 5.1 Certificate Data
- **DR-001**: Certificate must store: ID, type, issuer, certified entity, issue date, expiry date, status, metadata URI
- **DR-002**: Certificate metadata must link to off-chain documents (PDFs, images)
- **DR-003**: Certificate data must be immutable once recorded on blockchain

### 5.2 Batch Data
- **DR-004**: Batch must store: ID, creator, product type, quantity, unit, creation date, harvest date, origin, status, linked certificates, current owner, metadata URI
- **DR-005**: Batch must maintain ownership history through transfers
- **DR-006**: Batch data must be immutable once verified and activated

### 5.3 User Data
- **DR-007**: User roles must be stored on blockchain for transparency
- **DR-008**: User wallet addresses must be linked to their roles
- **DR-009**: User data must be accessible for role verification

## 6. Integration Requirements

### 6.1 Wallet Integration
- **IR-001**: Application must integrate with MetaMask browser extension
- **IR-002**: Application must support WalletConnect for mobile wallet connections
- **IR-003**: Application must handle wallet connection states and errors
- **IR-004**: Application must support account switching and network changes

### 6.2 Blockchain Network Integration
- **IR-005**: Application must connect to MasChain testnet for development
- **IR-006**: Application must support mainnet deployment for production
- **IR-007**: Application must handle network switching and validation
- **IR-008**: Application must provide network status indicators

## 7. Compliance Requirements

### 7.1 Halal Compliance
- **CR-001**: System must support Halal certification tracking and verification
- **CR-002**: Certificate data must include Halal-specific validation requirements
- **CR-003**: System must prevent contamination tracking through supply chain

### 7.2 Sustainability Compliance
- **CR-004**: System must support MSPO (Malaysian Sustainable Palm Oil) certification
- **CR-005**: System must support Organic certification tracking
- **CR-006**: System must support Fair Trade certification verification
- **CR-007**: System must align with UN Sustainable Development Goal 9

## 8. Future Enhancement Requirements

### 8.1 Phase 2 Features (Post-MVP)
- **FER-001**: System must support IoT sensor data integration
- **FER-002**: System must provide mobile application for iOS and Android
- **FER-003**: System must integrate with certification body APIs
- **FER-004**: System must support advanced analytics and reporting

### 8.2 Phase 3 Features (Long-term)
- **FER-005**: System must implement DAO governance for stakeholder voting
- **FER-006**: System must support automated compliance checking
- **FER-007**: System must integrate with payment systems for supply chain finance
- **FER-008**: System must provide advanced supply chain analytics and insights

---

**Document Control:**
- Created: January 2025
- Version: 1.0
- Next Review: March 2025
- Owner: BorneoTrace Development Team
