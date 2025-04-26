# BorneoTrace - Halal & Sustainable Certification Tracking System

BorneoTrace is a blockchain-based platform leveraging MasChain to track the provenance and certification status (e.g., Halal, MSPO, Organic, Fair Trade) of products, particularly focusing on agricultural and food & beverage industries relevant to Sabah and Malaysia.

## Overview

The system aims to enhance transparency, traceability, and trust within supply chains, aligning with UN Sustainable Development Goal 9 (Industry, Innovation, and Infrastructure) by fostering resilient and sustainable industrial practices through technological innovation.

## Features

- **Certificate Management**: Create, verify, and manage digital certificates (Halal, MSPO, Organic, etc.)
- **Batch Tracking**: Create product batches and link them to certificates
- **Supply Chain Traceability**: Track product batches through the supply chain
- **QR Code Verification**: Generate and scan QR codes for product verification
- **Role-Based Access**: Different interfaces for Certifiers, Producers, Verifiers, and Consumers

## Technology Stack

- **Frontend**: React with TypeScript, Vite, Material-UI
- **Smart Contracts**: Solidity, Hardhat
- **Blockchain**: MasChain (EVM compatible)
- **Blockchain Interaction**: ethers.js
- **QR Code**: qrcode.react, html5-qrcode

## Project Structure

- **`/src/components`**: Reusable UI components
- **`/src/pages`**: Application pages for different user roles
- **`/src/contexts`**: React contexts, including Web3Context for blockchain interaction
- **`/src/hooks`**: Custom hooks for interacting with smart contracts
- **`/src/utils`**: Utility functions
- **`/src/types`**: TypeScript type definitions
- **`/src/artifacts`**: Smart contract ABIs (generated from Hardhat)

## Smart Contracts

The project includes three main smart contracts:

1. **CertificateNFT**: ERC721 contract for certificate NFTs
2. **BatchNFT**: ERC721 contract for product batch NFTs
3. **Registry**: Contract for managing user roles and deploying other contracts

The smart contracts are located in the `/contracts` directory at the project root.

## User Roles

- **Certifier**: Issues and manages certificates
- **Producer**: Creates and manages product batches
- **Verifier**: Verifies batches before they are minted on the blockchain
- **Consumer**: Verifies products by scanning QR codes

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MetaMask or compatible wallet

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/borneo-trace.git
   cd borneo-trace
   ```

2. Install frontend dependencies:

   ```
   cd borneo-trace-app
   npm install
   ```

3. Install smart contract dependencies:

   ```
   cd ../contracts
   npm install
   ```

4. Compile smart contracts:
   ```
   npx hardhat compile
   ```

### Running the Application

1. Start the development server:

   ```
   cd ../borneo-trace-app
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173`

3. Connect your wallet (MetaMask) to interact with the application

### Deploying Smart Contracts

1. Configure your network in `hardhat.config.ts`
2. Deploy contracts:
   ```
   cd ../contracts
   npx hardhat run scripts/deploy.ts --network <network-name>
   ```

## License

This project is licensed under the MIT License.
