# BorneoTrace

## Halal & Sustainable Certification Tracking System on MasChain

**Version:** 1.0
**Date:** April 26, 2025
**Context:** Developed for potential implementation in Tawau, Sabah, Malaysia, targeting SDG 9.

**Implementation Status:** MVP Completed

---

**1. Introduction**

This document outlines the system design and implementation plan for a blockchain-based platform leveraging MasChain to track the provenance and certification status (e.g., Halal, MSPO, Organic, Fair Trade) of products, particularly focusing on agricultural and food & beverage industries relevant to Sabah and Malaysia. The system aims to enhance transparency, traceability, and trust within supply chains, aligning with UN Sustainable Development Goal 9 (Industry, Innovation, and Infrastructure) by fostering resilient and sustainable industrial practices through technological innovation.

**2. Goals & Objectives**

- **Primary Goal:** To create a verifiable and transparent digital record of product certifications and supply chain movements on the MasChain blockchain.
- **Objectives:**
  - Increase consumer trust through verifiable proof of Halal and/or sustainability certifications.
  - Enhance supply chain transparency for all stakeholders.
  - Improve traceability from farm/source to consumer.
  - Reduce the risk of certificate fraud and data tampering.
  - Streamline auditing and compliance processes.
  - Provide a foundation for future integration with IoT and payment systems.

**3. Scope**

- **In Scope (MVP/Hackathon Focus):**
  - Onboarding of key user roles (Certifier, Producer/Farmer, Consumer).
  - Digital representation and minting of Certificates as NFTs on MasChain.
  - Digital representation and minting of Product Batches as NFTs on MasChain.
  - Linking Batch NFTs to relevant Certificate NFTs.
  - Basic transfer of Batch NFT ownership to represent physical custody change.
  - Mechanism to mark Batch NFTs with basic exception statuses (e.g., Cancelled).
  - Generation of QR codes linked to Batch NFTs.
  - Consumer-facing interface to scan QR codes and view basic batch/certification data queried from MasChain.
  - Simple mechanism for second-party verification/approval of batch creation (to mitigate spam).
- **Out of Scope (Future Enhancements):**
  - Full integration with complex ERP systems.
  - Direct IoT sensor data integration (though design allows for future hashes).
  - Automated smart contract-based payment triggers.
  - Complex dispute resolution workflows.
  - Advanced analytics and reporting dashboards.
  - Full identity management integration (Decentralized Identifiers - DIDs).
  - Batch splitting/merging smart contract logic (complex for initial phase).

**4. System Architecture**

The system employs a hybrid architecture combining on-chain and off-chain components:

- **MasChain Blockchain (On-Chain):**
  - **Smart Contracts:** Deployed on MasChain (assuming EVM compatibility).
    - `CertificateNFT`: ERC721 contract representing unique certifications (Halal, MSPO, Organic, etc.). Stores metadata like Cert ID, Type, Issuer, Validity, Certified Entity ID, Hash of off-chain document.
    - `BatchNFT`: ERC721 contract representing unique product batches. Stores metadata like Batch ID, Creator, Product Type, Quantity, Unit, Timestamps, Origin Info, Status, Linked Certificate NFT IDs, Current Owner.
    - `Registry/Factory (Optional)`: A contract to manage the deployment and registration of official Certificate/Batch contracts and potentially user roles.
- **Frontend Application:**
  - Web-based interface (potentially mobile-responsive) built using a modern framework (e.g., React, Vue) or simple HTML/CSS/JS.
  - Provides role-specific dashboards (Certifier, Producer, Consumer).
  - Interacts with the Backend API and potentially directly with MasChain via user wallets (e.g., MetaMask if compatible).
- **Backend API (Off-Chain):**
  - Acts as an intermediary between the Frontend and MasChain for certain operations.
  - Manages user authentication and profiles (off-chain).
  - Handles requests requiring off-chain data or complex queries.
  - May facilitate interaction with MasChain for users less familiar with wallets.
  - Built using Node.js, Python (Flask/Django), or Go.
- **Off-Chain Storage:**

  - **Database:** Standard SQL (PostgreSQL) or NoSQL (MongoDB) database for user profiles, application settings, and potentially cached blockchain data for performance.
  - **File Storage:** IPFS (InterPlanetary File System) is ideal for storing larger files like PDF certificates immutably, with the IPFS hash stored on-chain in the NFT metadata. Alternatively, standard cloud storage (AWS S3, Google Cloud Storage) can be used.

  +-----------------+ +-----------------+ +----------------------+
  | Frontend App |<---->| Backend API |<---->| Off-Chain Database |
  | (Web/Mobile) | | (Node/Python..) | | (User Data, Cache) |
  +-----------------+ +-----------------+ +----------------------+
  | | |
  | (Wallet Interaction) | (Server Interaction) | (Optional: File Links)
  | | |
  v v v
  +-----------------------------------------------------------------------+
  | MasChain Blockchain |
  | +-----------------+ +----------------+ +-----------------------+ |
  | | Certificate NFT | | Batch NFT | | Registry/Factory (Opt)| |
  | | (Smart Contract)| | (Smart Contract)| | (Smart Contract) | |
  | +-----------------+ +----------------+ +-----------------------+ |
  +-----------------------------------------------------------------------+
  |
  | (Metadata Link - Hash)
  v
  +-----------------------+
  | Off-Chain File Store |
  | (IPFS / Cloud Storage)|
  | (PDF Certs, Images) |
  +-----------------------+

**5. Key Features & Functionality**

- **User Roles:** Certifier, Producer (Farmer/Processor), Logistics (Basic Transfer), Consumer.
- **Onboarding:** Simple registration (off-chain), linking MasChain wallet address. Certifier role requires admin verification.
- **Certificate Management (Certifier):**
  - Mint `CertificateNFT` with details (Cert ID, Type, Expiry, etc.) and link to off-chain PDF (via hash).
  - View issued certificates.
- **Batch Management (Producer):**
  - Initiate `BatchNFT` creation with details (Product, Qty, Harvest Date, Location).
  - Link active, relevant `CertificateNFT`(s) owned by the producer or facility.
  - Submit for Verification (if co-signing implemented).
  - View created batches.
  - Transfer `BatchNFT` ownership to the next entity (e.g., Logistics/Buyer).
- **Batch Verification (Verifier Role - e.g., Co-op Manager):**
  - View pending batch creation requests.
  - Approve/Reject requests, triggering final minting on MasChain.
- **Transfer/Tracking (Current Owner):**
  - Transfer `BatchNFT` to another registered MasChain address. Blockchain records the transfer event.
- **Exception Handling (Current Owner):**
  - Mark `BatchNFT` status as "Cancelled" (for errors before transfer).
  - (Future: Mark as "Lost", "Damaged").
- **Consumer Verification:**
  - Scan QR code containing Batch NFT ID (or a URL pointing to it).
  - Frontend retrieves data associated with the Batch NFT from MasChain (via Backend API or direct query).
  - Display Batch details, current owner, status, and linked Certificate details (including validity).

**6. Technology Stack (Implemented)**

- **Blockchain:** MasChain (EVM compatible)
- **Smart Contracts:** Solidity 0.8.28
- **Development Environment:** Hardhat
- **Frontend:** React 19 with TypeScript and Vite
- **UI Framework:** Material-UI (MUI)
- **Blockchain Interaction:** ethers.js 5.7.2
- **QR Code:** qrcode.react, html5-qrcode
- **Wallet Integration:** MetaMask
- **Routing:** React Router v7

**7. Data Model (On-Chain - Key Attributes)**

- **CertificateNFT:** `tokenId`, `certIdString`, `certType`, `issuerAddress`, `certifiedEntityAddress`, `issueTimestamp`, `expiryTimestamp`, `status` (Active, Expired, Revoked), `metadataURI` (linking to off-chain details/PDF hash).
- **BatchNFT:** `tokenId`, `creatorAddress`, `ownerAddress`, `productType`, `quantity`, `unit`, `creationTimestamp`, `harvestTimestamp`, `originInfo`, `status` (PendingVerification, Active, InTransit, Received, Cancelled, etc.), `linkedCertificateIds` (array of CertificateNFT `tokenId`s), `metadataURI`.

**8. Security Considerations**

- **Smart Contract Security:** Use established secure coding practices (e.g., Checks-Effects-Interactions), avoid reentrancy, manage integer overflow/underflow. Plan for external audits post-hackathon/MVP.
- **Access Control:** Implement role-based access control (`Ownable`, custom roles) for critical smart contract functions (minting, status changes).
- **Private Key Management:** Users are responsible for securing their MasChain private keys. Frontend should guide users securely.
- **Input Validation:** Sanitize all inputs on frontend, backend, and especially within smart contracts.
- **Off-chain Security:** Secure the Backend API and database using standard web security practices.

**9. Implementation Status**

- **Phase 1: Foundation & Contracts**
  - [x] Setup development environment.
  - [x] Define final attributes for `CertificateNFT` and `BatchNFT`.
  - [x] Develop and test `CertificateNFT` smart contract.
  - [x] Develop and test `BatchNFT` smart contract.
  - [x] Develop and test `Registry` smart contract.
  - [x] Implement minting functions for certificates and batches.
- **Phase 2: Core Workflow & UI**
  - [x] Setup Frontend project structure using React, TypeScript, and Vite.
  - [x] Implement Web3 context for blockchain interaction.
  - [x] Develop UI for Certifier to mint Certificate NFTs.
  - [x] Develop UI for Producer to mint Batch NFTs, including linking Certificate NFTs.
  - [x] Implement Batch NFT transfer functionality via UI.
  - [x] Implement wallet-based authentication.
  - [x] Generate QR codes containing Batch NFT IDs.
- **Phase 3: Verification & Polish**
  - [x] Develop Consumer QR scan page.
  - [x] Implement logic to fetch Batch NFT data from blockchain based on ID.
  - [x] Display Batch and linked Certificate data clearly to the consumer.
  - [x] Implement `cancelBatch` function/UI.
  - [x] Implement Verifier approval step for batch creation.
- **Future Phases (Post-MVP):**
  - Develop robust Backend API.
  - Implement advanced exception handling (Damage, Loss, Split/Merge).
  - Integrate IPFS for file storage.
  - Enhance role-specific dashboards.
  - Explore IoT data hash integration.
  - Conduct security audits.
  - User testing and feedback incorporation.

**10. Team Roles (Example)**

- **Blockchain Developer:** Smart contract development, deployment, MasChain integration.
- **Frontend Developer:** UI/UX implementation, wallet integration, API interaction.
- **Backend Developer (Optional for MVP):** API creation, database management, server-side logic.
- **Project Lead/Presenter:** Overall coordination, requirements, presentation, documentation.

**11. Assumptions**

- MasChain provides a stable testnet environment and adequate documentation/SDKs.
- MasChain is EVM-compatible, allowing standard Solidity development tools.
- Participants (farmers, certifiers) have access to basic internet connectivity and devices (smartphones/computers).
- Availability of compatible wallet solutions for MasChain interaction.

**12. Risks & Mitigation**

- **Technical Risk:** MasChain instability or lack of documentation. **Mitigation:** Allocate time for environment setup, rely on core blockchain principles, have fallback plans for features.
- **Adoption Risk:** Difficulty getting certifiers/producers onboard. **Mitigation:** Focus on clear value proposition, simple UI/UX. (Post-hackathon concern primarily).
- **Scope Creep:** Trying to implement too many features. **Mitigation:** Strictly adhere to the phased MVP plan, prioritize core functionality.
- **Smart Contract Bugs:** Errors in contract logic. **Mitigation:** Thorough testing on testnet, follow security best practices, peer review code within the team.

**13. Project Structure**

The project is organized into two main directories:

- **`/borneo-trace-app`**: Frontend application built with React, TypeScript, and Vite

  - `/src/components`: Reusable UI components
  - `/src/pages`: Application pages for different user roles
  - `/src/contexts`: React contexts, including Web3Context for blockchain interaction
  - `/src/hooks`: Custom hooks for interacting with smart contracts
  - `/src/utils`: Utility functions
  - `/src/types`: TypeScript type definitions
  - `/src/artifacts`: Smart contract ABIs (generated from Hardhat)

- **`/contracts`**: Smart contracts and deployment scripts
  - `/contracts`: Solidity smart contracts
  - `/scripts`: Deployment scripts
  - `/test`: Contract test files

**14. Running the Application**

1. **Prerequisites**:

   - Node.js (v16+)
   - npm or yarn
   - MetaMask or compatible wallet

2. **Install Dependencies**:

   ```
   # Install frontend dependencies
   cd borneo-trace-app
   npm install

   # Install smart contract dependencies
   cd ../contracts
   npm install
   ```

3. **Compile Smart Contracts**:

   ```
   cd contracts
   npx hardhat compile
   ```

4. **Start the Development Server**:

   ```
   cd ../borneo-trace-app
   npm run dev
   ```

5. **Access the Application**:
   - Open your browser and navigate to `http://localhost:5173`
   - Connect your wallet (MetaMask) to interact with the application

**15. Conclusion**

This MasChain-based certification tracking system offers a significant improvement over traditional methods by providing immutable proof, enhanced transparency, and streamlined traceability. By focusing on a core set of features for the initial implementation, this project effectively demonstrates the value of blockchain in strengthening Halal integrity and supporting sustainable practices in key Sabah industries, directly contributing to SDG 9 objectives. The successful implementation provides a strong foundation for future expansion and real-world adoption.
