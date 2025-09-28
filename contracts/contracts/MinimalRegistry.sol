// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CertificateNFT.sol";
import "./BatchNFT.sol";

/**
 * @title MinimalRegistry
 * @dev Minimal contract for managing the certification system
 */
contract MinimalRegistry is Ownable {
    CertificateNFT public certificateContract;
    BatchNFT public batchContract;
    
    mapping(address => bool) public certifiers;
    mapping(address => bool) public producers;
    mapping(address => bool) public verifiers;
    
    event ContractsDeployed(address certificateContract, address batchContract);

    constructor() Ownable(msg.sender) {
        certifiers[msg.sender] = true;
        producers[msg.sender] = true;
        verifiers[msg.sender] = true;
    }

    function deployContracts() external onlyOwner {
        require(address(certificateContract) == address(0), "Contracts already deployed");
        
        certificateContract = new CertificateNFT();
        batchContract = new BatchNFT(address(certificateContract));
        
        // Authorize the deployer in the contracts
        certificateContract.authorizeCertifier(msg.sender);
        batchContract.authorizeProducer(msg.sender);
        batchContract.authorizeVerifier(msg.sender);
        
        emit ContractsDeployed(address(certificateContract), address(batchContract));
    }

    function registerCertifier(address certifier) external onlyOwner {
        certifiers[certifier] = true;
        if (address(certificateContract) != address(0)) {
            certificateContract.authorizeCertifier(certifier);
        }
    }

    function registerProducer(address producer) external onlyOwner {
        producers[producer] = true;
        if (address(batchContract) != address(0)) {
            batchContract.authorizeProducer(producer);
        }
    }

    function registerVerifier(address verifier) external onlyOwner {
        verifiers[verifier] = true;
        if (address(batchContract) != address(0)) {
            batchContract.authorizeVerifier(verifier);
        }
    }

    function isCertifier(address certifier) external view returns (bool) {
        return certifiers[certifier];
    }

    function isProducer(address producer) external view returns (bool) {
        return producers[producer];
    }

    function isVerifier(address verifier) external view returns (bool) {
        return verifiers[verifier];
    }
}
