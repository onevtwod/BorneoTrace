// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CertificateNFT.sol";
import "./BatchNFT.sol";

/**
 * @title Registry
 * @dev Contract for managing the certification system
 */
contract Registry is Ownable {
    // Deployed contract addresses
    CertificateNFT public certificateContract;
    BatchNFT public batchContract;
    
    // User role mappings
    mapping(address => bool) public certifiers;
    mapping(address => bool) public producers;
    mapping(address => bool) public verifiers;
    
    // Events
    event CertifierRegistered(address certifier);
    event ProducerRegistered(address producer);
    event VerifierRegistered(address verifier);
    event CertifierRemoved(address certifier);
    event ProducerRemoved(address producer);
    event VerifierRemoved(address verifier);
    event ContractsDeployed(address certificateContract, address batchContract);

    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {
        // Register the deployer with all roles
        certifiers[msg.sender] = true;
        producers[msg.sender] = true;
        verifiers[msg.sender] = true;
        
        emit CertifierRegistered(msg.sender);
        emit ProducerRegistered(msg.sender);
        emit VerifierRegistered(msg.sender);
    }

    /**
     * @dev Deploy the certificate and batch contracts
     */
    function deployContracts() external onlyOwner {
        require(address(certificateContract) == address(0), "Contracts already deployed");
        
        // Deploy the certificate contract
        certificateContract = new CertificateNFT();
        
        // Deploy the batch contract with the certificate contract address
        batchContract = new BatchNFT(address(certificateContract));
        
        emit ContractsDeployed(address(certificateContract), address(batchContract));
    }

    /**
     * @dev Set existing contract addresses
     * @param certificateContractAddress Address of the certificate contract
     * @param batchContractAddress Address of the batch contract
     */
    function setContractAddresses(
        address certificateContractAddress,
        address batchContractAddress
    ) external onlyOwner {
        require(certificateContractAddress != address(0), "Invalid certificate contract address");
        require(batchContractAddress != address(0), "Invalid batch contract address");
        
        certificateContract = CertificateNFT(certificateContractAddress);
        batchContract = BatchNFT(batchContractAddress);
        
        emit ContractsDeployed(certificateContractAddress, batchContractAddress);
    }

    /**
     * @dev Register a certifier
     * @param certifier Address of the certifier to register
     */
    function registerCertifier(address certifier) external onlyOwner {
        require(certifier != address(0), "Invalid certifier address");
        require(!certifiers[certifier], "Already registered as certifier");
        
        certifiers[certifier] = true;
        
        // If contracts are deployed, authorize the certifier
        if (address(certificateContract) != address(0)) {
            certificateContract.authorizeCertifier(certifier);
        }
        
        emit CertifierRegistered(certifier);
    }

    /**
     * @dev Register a producer
     * @param producer Address of the producer to register
     */
    function registerProducer(address producer) external onlyOwner {
        require(producer != address(0), "Invalid producer address");
        require(!producers[producer], "Already registered as producer");
        
        producers[producer] = true;
        
        // If contracts are deployed, authorize the producer
        if (address(batchContract) != address(0)) {
            batchContract.authorizeProducer(producer);
        }
        
        emit ProducerRegistered(producer);
    }

    /**
     * @dev Register a verifier
     * @param verifier Address of the verifier to register
     */
    function registerVerifier(address verifier) external onlyOwner {
        require(verifier != address(0), "Invalid verifier address");
        require(!verifiers[verifier], "Already registered as verifier");
        
        verifiers[verifier] = true;
        
        // If contracts are deployed, authorize the verifier
        if (address(batchContract) != address(0)) {
            batchContract.authorizeVerifier(verifier);
        }
        
        emit VerifierRegistered(verifier);
    }

    /**
     * @dev Remove a certifier
     * @param certifier Address of the certifier to remove
     */
    function removeCertifier(address certifier) external onlyOwner {
        require(certifiers[certifier], "Not registered as certifier");
        
        certifiers[certifier] = false;
        
        // If contracts are deployed, revoke the certifier
        if (address(certificateContract) != address(0)) {
            certificateContract.revokeCertifier(certifier);
        }
        
        emit CertifierRemoved(certifier);
    }

    /**
     * @dev Remove a producer
     * @param producer Address of the producer to remove
     */
    function removeProducer(address producer) external onlyOwner {
        require(producers[producer], "Not registered as producer");
        
        producers[producer] = false;
        
        // If contracts are deployed, revoke the producer
        if (address(batchContract) != address(0)) {
            batchContract.revokeProducer(producer);
        }
        
        emit ProducerRemoved(producer);
    }

    /**
     * @dev Remove a verifier
     * @param verifier Address of the verifier to remove
     */
    function removeVerifier(address verifier) external onlyOwner {
        require(verifiers[verifier], "Not registered as verifier");
        
        verifiers[verifier] = false;
        
        // If contracts are deployed, revoke the verifier
        if (address(batchContract) != address(0)) {
            batchContract.revokeVerifier(verifier);
        }
        
        emit VerifierRemoved(verifier);
    }

    /**
     * @dev Check if an address is a registered certifier
     * @param certifier Address to check
     * @return bool True if the address is a registered certifier
     */
    function isCertifier(address certifier) external view returns (bool) {
        return certifiers[certifier];
    }

    /**
     * @dev Check if an address is a registered producer
     * @param producer Address to check
     * @return bool True if the address is a registered producer
     */
    function isProducer(address producer) external view returns (bool) {
        return producers[producer];
    }

    /**
     * @dev Check if an address is a registered verifier
     * @param verifier Address to check
     * @return bool True if the address is a registered verifier
     */
    function isVerifier(address verifier) external view returns (bool) {
        return verifiers[verifier];
    }
}
