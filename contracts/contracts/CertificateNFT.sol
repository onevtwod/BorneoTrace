// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CertificateNFT
 * @dev Contract for creating and managing certificate NFTs
 */
contract CertificateNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Certificate status enum
    enum CertificateStatus { Active, Expired, Revoked }

    // Certificate struct
    struct Certificate {
        string certIdString;
        string certType;
        address issuer;
        address certifiedEntityAddress;
        uint256 issueTimestamp;
        uint256 expiryTimestamp;
        CertificateStatus status;
        string metadataURI;
    }

    // Mapping from token ID to Certificate
    mapping(uint256 => Certificate) private _certificates;

    // Mapping from certifier address to boolean indicating if they are authorized
    mapping(address => bool) private _authorizedCertifiers;

    // Events
    event CertificateCreated(uint256 tokenId, string certIdString, address issuer, address certifiedEntity);
    event CertificateRevoked(uint256 tokenId, string reason);
    event CertifierAuthorized(address certifier);
    event CertifierRevoked(address certifier);

    /**
     * @dev Constructor
     */
    constructor() ERC721("Halal Certificate", "HALAL") Ownable(msg.sender) {
        // Authorize the contract deployer as a certifier
        _authorizedCertifiers[msg.sender] = true;
        emit CertifierAuthorized(msg.sender);
    }

    /**
     * @dev Modifier to check if the caller is an authorized certifier
     */
    modifier onlyAuthorizedCertifier() {
        require(_authorizedCertifiers[msg.sender], "Not authorized as certifier");
        _;
    }

    /**
     * @dev Authorize a new certifier
     * @param certifier Address of the certifier to authorize
     */
    function authorizeCertifier(address certifier) external onlyOwner {
        require(certifier != address(0), "Invalid certifier address");
        require(!_authorizedCertifiers[certifier], "Already authorized");

        _authorizedCertifiers[certifier] = true;
        emit CertifierAuthorized(certifier);
    }

    /**
     * @dev Revoke a certifier's authorization
     * @param certifier Address of the certifier to revoke
     */
    function revokeCertifier(address certifier) external onlyOwner {
        require(_authorizedCertifiers[certifier], "Not an authorized certifier");

        _authorizedCertifiers[certifier] = false;
        emit CertifierRevoked(certifier);
    }

    /**
     * @dev Check if an address is an authorized certifier
     * @param certifier Address to check
     * @return bool True if the address is an authorized certifier
     */
    function isAuthorizedCertifier(address certifier) external view returns (bool) {
        return _authorizedCertifiers[certifier];
    }

    /**
     * @dev Mint a new certificate NFT
     * @param certIdString External certificate ID
     * @param certType Type of certificate (e.g., "Halal", "MSPO", "Organic")
     * @param certifiedEntityAddress Address of the entity being certified
     * @param validityPeriod Validity period in seconds
     * @param metadataURI URI pointing to the certificate metadata
     * @return uint256 The ID of the newly minted certificate NFT
     */
    function mintCertificate(
        string memory certIdString,
        string memory certType,
        address certifiedEntityAddress,
        uint256 validityPeriod,
        string memory metadataURI
    ) external onlyAuthorizedCertifier returns (uint256) {
        require(bytes(certIdString).length > 0, "Certificate ID cannot be empty");
        require(certifiedEntityAddress != address(0), "Invalid certified entity address");
        require(validityPeriod > 0, "Validity period must be greater than 0");

        uint256 newTokenId = _nextTokenId++;

        // Mint the NFT to the certified entity
        _mint(certifiedEntityAddress, newTokenId);
        _setTokenURI(newTokenId, metadataURI);

        // Store certificate details
        _certificates[newTokenId] = Certificate({
            certIdString: certIdString,
            certType: certType,
            issuer: msg.sender,
            certifiedEntityAddress: certifiedEntityAddress,
            issueTimestamp: block.timestamp,
            expiryTimestamp: block.timestamp + validityPeriod,
            status: CertificateStatus.Active,
            metadataURI: metadataURI
        });

        emit CertificateCreated(newTokenId, certIdString, msg.sender, certifiedEntityAddress);

        return newTokenId;
    }

    /**
     * @dev Revoke a certificate
     * @param tokenId ID of the certificate to revoke
     * @param reason Reason for revocation
     */
    function revokeCertificate(uint256 tokenId, string memory reason) external {
        Certificate storage cert = _certificates[tokenId];

        // Only the issuer or contract owner can revoke
        require(
            cert.issuer == msg.sender || owner() == msg.sender,
            "Only issuer or owner can revoke"
        );
        require(cert.status == CertificateStatus.Active, "Certificate not active");

        cert.status = CertificateStatus.Revoked;

        emit CertificateRevoked(tokenId, reason);
    }

    /**
     * @dev Check if a certificate is valid
     * @param tokenId ID of the certificate to check
     * @return bool True if the certificate is valid
     */
    function isValid(uint256 tokenId) external view returns (bool) {
        Certificate memory cert = _certificates[tokenId];

        return (
            cert.status == CertificateStatus.Active &&
            block.timestamp <= cert.expiryTimestamp
        );
    }

    /**
     * @dev Get certificate details
     * @param tokenId ID of the certificate
     * @return Certificate struct containing certificate details
     */
    function getCertificate(uint256 tokenId) external view returns (Certificate memory) {
        require(_exists(tokenId), "Certificate does not exist");
        return _certificates[tokenId];
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
