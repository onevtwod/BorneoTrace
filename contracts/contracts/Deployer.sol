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
}
