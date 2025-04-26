// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CertificateNFT.sol";

/**
 * @title BatchNFT
 * @dev Contract for creating and managing product batch NFTs
 */
contract BatchNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Batch status enum
    enum BatchStatus { PendingVerification, Active, InTransit, Received, Cancelled }

    // Batch struct
    struct Batch {
        string batchId;
        address creator;
        string productType;
        uint256 quantity;
        string unit;
        uint256 creationTimestamp;
        uint256 harvestTimestamp;
        string originInfo;
        BatchStatus status;
        uint256[] linkedCertificateIds;
        address currentOwner;
        string metadataURI;
    }

    // Reference to the CertificateNFT contract
    CertificateNFT private _certificateContract;

    // Mapping from token ID to Batch
    mapping(uint256 => Batch) private _batches;

    // Mapping from producer address to boolean indicating if they are authorized
    mapping(address => bool) private _authorizedProducers;

    // Mapping from verifier address to boolean indicating if they are authorized
    mapping(address => bool) private _authorizedVerifiers;

    // Mapping from batch ID to pending verification status
    mapping(uint256 => bool) private _pendingVerification;

    // Events
    event BatchCreated(uint256 tokenId, string batchId, address creator);
    event BatchVerified(uint256 tokenId, address verifier);
    event BatchTransferred(uint256 tokenId, address from, address to);
    event BatchCancelled(uint256 tokenId, string reason);
    event CertificateLinked(uint256 batchId, uint256 certificateId);
    event ProducerAuthorized(address producer);
    event ProducerRevoked(address producer);
    event VerifierAuthorized(address verifier);
    event VerifierRevoked(address verifier);

    /**
     * @dev Constructor
     * @param certificateContractAddress Address of the CertificateNFT contract
     */
    constructor(address certificateContractAddress) ERC721("Product Batch", "BATCH") Ownable(msg.sender) {
        require(certificateContractAddress != address(0), "Invalid certificate contract address");
        _certificateContract = CertificateNFT(certificateContractAddress);

        // Authorize the contract deployer as a producer and verifier
        _authorizedProducers[msg.sender] = true;
        _authorizedVerifiers[msg.sender] = true;
        emit ProducerAuthorized(msg.sender);
        emit VerifierAuthorized(msg.sender);
    }

    /**
     * @dev Modifier to check if the caller is an authorized producer
     */
    modifier onlyAuthorizedProducer() {
        require(_authorizedProducers[msg.sender], "Not authorized as producer");
        _;
    }

    /**
     * @dev Modifier to check if the caller is an authorized verifier
     */
    modifier onlyAuthorizedVerifier() {
        require(_authorizedVerifiers[msg.sender], "Not authorized as verifier");
        _;
    }

    /**
     * @dev Authorize a new producer
     * @param producer Address of the producer to authorize
     */
    function authorizeProducer(address producer) external onlyOwner {
        require(producer != address(0), "Invalid producer address");
        require(!_authorizedProducers[producer], "Already authorized");

        _authorizedProducers[producer] = true;
        emit ProducerAuthorized(producer);
    }

    /**
     * @dev Revoke a producer's authorization
     * @param producer Address of the producer to revoke
     */
    function revokeProducer(address producer) external onlyOwner {
        require(_authorizedProducers[producer], "Not an authorized producer");

        _authorizedProducers[producer] = false;
        emit ProducerRevoked(producer);
    }

    /**
     * @dev Authorize a new verifier
     * @param verifier Address of the verifier to authorize
     */
    function authorizeVerifier(address verifier) external onlyOwner {
        require(verifier != address(0), "Invalid verifier address");
        require(!_authorizedVerifiers[verifier], "Already authorized");

        _authorizedVerifiers[verifier] = true;
        emit VerifierAuthorized(verifier);
    }

    /**
     * @dev Revoke a verifier's authorization
     * @param verifier Address of the verifier to revoke
     */
    function revokeVerifier(address verifier) external onlyOwner {
        require(_authorizedVerifiers[verifier], "Not an authorized verifier");

        _authorizedVerifiers[verifier] = false;
        emit VerifierRevoked(verifier);
    }

    /**
     * @dev Check if an address is an authorized producer
     * @param producer Address to check
     * @return bool True if the address is an authorized producer
     */
    function isAuthorizedProducer(address producer) external view returns (bool) {
        return _authorizedProducers[producer];
    }

    /**
     * @dev Check if an address is an authorized verifier
     * @param verifier Address to check
     * @return bool True if the address is an authorized verifier
     */
    function isAuthorizedVerifier(address verifier) external view returns (bool) {
        return _authorizedVerifiers[verifier];
    }

    /**
     * @dev Create a new batch NFT (pending verification)
     * @param batchId External batch ID
     * @param productType Type of product
     * @param quantity Quantity of product
     * @param unit Unit of measurement
     * @param harvestTimestamp Timestamp of harvest
     * @param originInfo Information about the origin
     * @param linkedCertificateIds Array of certificate NFT IDs to link
     * @param metadataURI URI pointing to the batch metadata
     * @return uint256 The ID of the newly created batch NFT
     */
    function createBatch(
        string memory batchId,
        string memory productType,
        uint256 quantity,
        string memory unit,
        uint256 harvestTimestamp,
        string memory originInfo,
        uint256[] memory linkedCertificateIds,
        string memory metadataURI
    ) external onlyAuthorizedProducer returns (uint256) {
        require(bytes(batchId).length > 0, "Batch ID cannot be empty");
        require(quantity > 0, "Quantity must be greater than 0");

        // Validate linked certificates
        for (uint256 i = 0; i < linkedCertificateIds.length; i++) {
            require(
                _certificateContract.isValid(linkedCertificateIds[i]),
                "Invalid or expired certificate"
            );
        }

        uint256 newTokenId = _nextTokenId++;

        // Store batch details (pending verification)
        _batches[newTokenId] = Batch({
            batchId: batchId,
            creator: msg.sender,
            productType: productType,
            quantity: quantity,
            unit: unit,
            creationTimestamp: block.timestamp,
            harvestTimestamp: harvestTimestamp,
            originInfo: originInfo,
            status: BatchStatus.PendingVerification,
            linkedCertificateIds: linkedCertificateIds,
            currentOwner: msg.sender,
            metadataURI: metadataURI
        });

        // Mark as pending verification
        _pendingVerification[newTokenId] = true;

        emit BatchCreated(newTokenId, batchId, msg.sender);

        return newTokenId;
    }

    /**
     * @dev Verify a batch and mint the NFT
     * @param tokenId ID of the batch to verify
     */
    function verifyBatch(uint256 tokenId) external onlyAuthorizedVerifier {
        require(_pendingVerification[tokenId], "Batch not pending verification");
        Batch storage batch = _batches[tokenId];

        // Mint the NFT to the creator
        _mint(batch.creator, tokenId);
        _setTokenURI(tokenId, batch.metadataURI);

        // Update batch status
        batch.status = BatchStatus.Active;
        _pendingVerification[tokenId] = false;

        emit BatchVerified(tokenId, msg.sender);
    }

    /**
     * @dev Transfer batch ownership
     * @param tokenId ID of the batch to transfer
     * @param to Address to transfer to
     */
    function transferBatch(uint256 tokenId, address to) external {
        require(_exists(tokenId), "Batch does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner of the batch");
        require(to != address(0), "Invalid recipient address");

        Batch storage batch = _batches[tokenId];
        require(batch.status == BatchStatus.Active || batch.status == BatchStatus.InTransit, "Batch not active or in transit");

        // Transfer the NFT
        _transfer(msg.sender, to, tokenId);

        // Update batch status and owner
        batch.status = BatchStatus.Received;
        batch.currentOwner = to;

        emit BatchTransferred(tokenId, msg.sender, to);
    }

    /**
     * @dev Mark a batch as in transit
     * @param tokenId ID of the batch to mark as in transit
     */
    function markAsInTransit(uint256 tokenId) external {
        require(_exists(tokenId), "Batch does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner of the batch");

        Batch storage batch = _batches[tokenId];
        require(batch.status == BatchStatus.Active, "Batch not active");

        batch.status = BatchStatus.InTransit;
    }

    /**
     * @dev Cancel a batch
     * @param tokenId ID of the batch to cancel
     * @param reason Reason for cancellation
     */
    function cancelBatch(uint256 tokenId, string memory reason) external {
        require(_exists(tokenId), "Batch does not exist");

        Batch storage batch = _batches[tokenId];

        // Only the creator, current owner, or contract owner can cancel
        require(
            batch.creator == msg.sender ||
            batch.currentOwner == msg.sender ||
            owner() == msg.sender,
            "Not authorized to cancel"
        );

        require(batch.status != BatchStatus.Cancelled, "Batch already cancelled");

        batch.status = BatchStatus.Cancelled;

        emit BatchCancelled(tokenId, reason);
    }

    /**
     * @dev Link a certificate to a batch
     * @param tokenId ID of the batch
     * @param certificateId ID of the certificate to link
     */
    function linkCertificate(uint256 tokenId, uint256 certificateId) external {
        require(_exists(tokenId), "Batch does not exist");

        Batch storage batch = _batches[tokenId];

        // Only the creator or current owner can link certificates
        require(
            batch.creator == msg.sender || batch.currentOwner == msg.sender,
            "Not authorized to link certificate"
        );

        // Check if certificate is valid
        require(
            _certificateContract.isValid(certificateId),
            "Invalid or expired certificate"
        );

        // Check if certificate is already linked
        bool alreadyLinked = false;
        for (uint256 i = 0; i < batch.linkedCertificateIds.length; i++) {
            if (batch.linkedCertificateIds[i] == certificateId) {
                alreadyLinked = true;
                break;
            }
        }

        require(!alreadyLinked, "Certificate already linked");

        batch.linkedCertificateIds.push(certificateId);

        emit CertificateLinked(tokenId, certificateId);
    }

    /**
     * @dev Get batch details
     * @param tokenId ID of the batch
     * @return Batch struct containing batch details
     */
    function getBatch(uint256 tokenId) external view returns (Batch memory) {
        require(_exists(tokenId), "Batch does not exist");
        return _batches[tokenId];
    }

    /**
     * @dev Get pending batches for verification
     * @return uint256[] Array of batch IDs pending verification
     */
    function getPendingBatches() external view onlyAuthorizedVerifier returns (uint256[] memory) {
        uint256 count = 0;

        // Count pending batches
        for (uint256 i = 1; i < _nextTokenId; i++) {
            if (_pendingVerification[i]) {
                count++;
            }
        }

        uint256[] memory pendingBatches = new uint256[](count);
        uint256 index = 0;

        // Populate array with pending batch IDs
        for (uint256 i = 1; i < _nextTokenId; i++) {
            if (_pendingVerification[i]) {
                pendingBatches[index] = i;
                index++;
            }
        }

        return pendingBatches;
    }

    /**
     * @dev Check if a token exists
     * @param tokenId ID of the token to check
     * @return bool True if the token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
