// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CertificateNFT.sol";
import "./BatchNFT.sol";

/**
 * @title Deployer
 * @dev Minimal contract for deploying the certification system contracts
 */
contract Deployer is Ownable {
    CertificateNFT public certificateContract;
    BatchNFT public batchContract;
    
    event ContractsDeployed(address certificateContract, address batchContract);

    constructor() Ownable(msg.sender) {}

    function deployContracts() external onlyOwner {
        require(address(certificateContract) == address(0), "Contracts already deployed");
        
        certificateContract = new CertificateNFT();
        batchContract = new BatchNFT(address(certificateContract));
        
        emit ContractsDeployed(address(certificateContract), address(batchContract));
    }

    /**
     * @dev Register a certifier
     * @param certifier Address of the certifier to register
     */
    function registerCertifier(address certifier) external onlyOwner {
        require(certifier != address(0), "Invalid certifier address");
        require(address(certificateContract) != address(0), "Contracts not deployed");
        
        certificateContract.authorizeCertifier(certifier);
    }

    /**
     * @dev Register a producer
     * @param producer Address of the producer to register
     */
    function registerProducer(address producer) external onlyOwner {
        require(producer != address(0), "Invalid producer address");
        require(address(batchContract) != address(0), "Contracts not deployed");
        
        batchContract.authorizeProducer(producer);
    }

    /**
     * @dev Register a verifier
     * @param verifier Address of the verifier to register
     */
    function registerVerifier(address verifier) external onlyOwner {
        require(verifier != address(0), "Invalid verifier address");
        require(address(batchContract) != address(0), "Contracts not deployed");
        
        batchContract.authorizeVerifier(verifier);
    }

    /**
     * @dev Remove a certifier
     * @param certifier Address of the certifier to remove
     */
    function removeCertifier(address certifier) external onlyOwner {
        require(address(certificateContract) != address(0), "Contracts not deployed");
        
        certificateContract.revokeCertifier(certifier);
    }

    /**
     * @dev Check if an address is a registered certifier
     * @param certifier Address to check
     * @return bool True if the address is a registered certifier
     */
    function isCertifier(address certifier) external view returns (bool) {
        if (address(certificateContract) == address(0)) return false;
        return certificateContract.isAuthorizedCertifier(certifier);
    }

    /**
     * @dev Check if an address is a registered producer
     * @param producer Address to check
     * @return bool True if the address is a registered producer
     */
    function isProducer(address producer) external view returns (bool) {
        if (address(batchContract) == address(0)) return false;
        return batchContract.isAuthorizedProducer(producer);
    }

    /**
     * @dev Check if an address is a registered verifier
     * @param verifier Address to check
     * @return bool True if the address is a registered verifier
     */
    function isVerifier(address verifier) external view returns (bool) {
        if (address(batchContract) == address(0)) return false;
        return batchContract.isAuthorizedVerifier(verifier);
    }
}
