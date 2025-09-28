import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { blockchainService } from '../services/blockchain';
import { Logger } from '../utils/logger';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';

const router = express.Router();
const logger = new Logger('BlockchainRoutes');

// Initialize contracts endpoint
router.post('/initialize', [
    body('addresses.registry').isEthereumAddress().withMessage('Invalid registry address'),
    body('addresses.certificateNFT').isEthereumAddress().withMessage('Invalid certificate NFT address'),
    body('addresses.batchNFT').isEthereumAddress().withMessage('Invalid batch NFT address')
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }

    try {
        await blockchainService.initializeContracts(req.body.addresses);

        res.json({
            success: true,
            message: 'Contracts initialized successfully',
            addresses: blockchainService.getContractAddresses()
        });
    } catch (error) {
        logger.error('Failed to initialize contracts', error);
        res.status(500).json({
            error: 'Failed to initialize contracts',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));

// Get network information
router.get('/network', asyncHandler(async (req, res) => {
    try {
        const networkInfo = await blockchainService.getNetworkInfo();
        res.json({
            success: true,
            data: networkInfo
        });
    } catch (error) {
        logger.error('Failed to get network info', error);
        res.status(500).json({
            error: 'Failed to get network info',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));

// Certificate routes
router.get('/certificates/:tokenId', [
    param('tokenId').isInt({ min: 1 }).withMessage('Invalid token ID')
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }

    try {
        const tokenId = parseInt(req.params.tokenId);
        const certificate = await blockchainService.getCertificate(tokenId);

        res.json({
            success: true,
            data: certificate
        });
    } catch (error) {
        logger.error(`Failed to get certificate ${req.params.tokenId}`, error);

        if (error instanceof Error && error.message.includes('Certificate does not exist')) {
            return res.status(404).json({
                error: 'Certificate not found',
                message: `Certificate with ID ${req.params.tokenId} does not exist`
            });
        }

        res.status(500).json({
            error: 'Failed to get certificate',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));

router.get('/certificates/owner/:address', [
    param('address').isEthereumAddress().withMessage('Invalid Ethereum address')
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }

    try {
        const ownerAddress = req.params.address;
        const certificates = await blockchainService.getCertificatesByOwner(ownerAddress);

        res.json({
            success: true,
            data: certificates,
            count: certificates.length
        });
    } catch (error) {
        logger.error(`Failed to get certificates for owner ${req.params.address}`, error);
        res.status(500).json({
            error: 'Failed to get certificates',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));

// Batch routes
router.get('/batches/:tokenId', [
    param('tokenId').isInt({ min: 1 }).withMessage('Invalid token ID')
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }

    try {
        const tokenId = parseInt(req.params.tokenId);
        const batch = await blockchainService.getBatch(tokenId);

        res.json({
            success: true,
            data: batch
        });
    } catch (error) {
        logger.error(`Failed to get batch ${req.params.tokenId}`, error);

        if (error instanceof Error && error.message.includes('Batch does not exist')) {
            return res.status(404).json({
                error: 'Batch not found',
                message: `Batch with ID ${req.params.tokenId} does not exist`
            });
        }

        res.status(500).json({
            error: 'Failed to get batch',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));

router.get('/batches/owner/:address', [
    param('address').isEthereumAddress().withMessage('Invalid Ethereum address')
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }

    try {
        const ownerAddress = req.params.address;
        const batches = await blockchainService.getBatchesByOwner(ownerAddress);

        res.json({
            success: true,
            data: batches,
            count: batches.length
        });
    } catch (error) {
        logger.error(`Failed to get batches for owner ${req.params.address}`, error);
        res.status(500).json({
            error: 'Failed to get batches',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));

router.get('/batches/pending', requireAuth, asyncHandler(async (req, res) => {
    try {
        const pendingBatches = await blockchainService.getPendingBatches();

        res.json({
            success: true,
            data: pendingBatches,
            count: pendingBatches.length
        });
    } catch (error) {
        logger.error('Failed to get pending batches', error);
        res.status(500).json({
            error: 'Failed to get pending batches',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));

// User roles
router.get('/users/:address/roles', [
    param('address').isEthereumAddress().withMessage('Invalid Ethereum address')
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }

    try {
        const userAddress = req.params.address;
        const roles = await blockchainService.getUserRoles(userAddress);

        res.json({
            success: true,
            data: roles
        });
    } catch (error) {
        logger.error(`Failed to get user roles for ${req.params.address}`, error);
        res.status(500).json({
            error: 'Failed to get user roles',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));

// Events
router.get('/events/certificates', [
    query('fromBlock').optional().isInt({ min: 0 }).withMessage('Invalid fromBlock'),
    query('toBlock').optional().isInt({ min: 0 }).withMessage('Invalid toBlock')
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }

    try {
        const fromBlock = req.query.fromBlock ? parseInt(req.query.fromBlock as string) : undefined;
        const toBlock = req.query.toBlock ? parseInt(req.query.toBlock as string) : undefined;

        const events = await blockchainService.getCertificateEvents(fromBlock, toBlock);

        res.json({
            success: true,
            data: events,
            count: events.length
        });
    } catch (error) {
        logger.error('Failed to get certificate events', error);
        res.status(500).json({
            error: 'Failed to get certificate events',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));

router.get('/events/batches', [
    query('fromBlock').optional().isInt({ min: 0 }).withMessage('Invalid fromBlock'),
    query('toBlock').optional().isInt({ min: 0 }).withMessage('Invalid toBlock')
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }

    try {
        const fromBlock = req.query.fromBlock ? parseInt(req.query.fromBlock as string) : undefined;
        const toBlock = req.query.toBlock ? parseInt(req.query.toBlock as string) : undefined;

        const events = await blockchainService.getBatchEvents(fromBlock, toBlock);

        res.json({
            success: true,
            data: events,
            count: events.length
        });
    } catch (error) {
        logger.error('Failed to get batch events', error);
        res.status(500).json({
            error: 'Failed to get batch events',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));

// Utility routes
router.post('/validate-address', [
    body('address').isEthereumAddress().withMessage('Invalid Ethereum address')
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }

    try {
        const { address } = req.body;
        const isValid = blockchainService.isValidAddress(address);
        const formatted = isValid ? blockchainService.formatAddress(address) : null;

        res.json({
            success: true,
            data: {
                address,
                isValid,
                formatted
            }
        });
    } catch (error) {
        logger.error('Failed to validate address', error);
        res.status(500).json({
            error: 'Failed to validate address',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));

// Service status
router.get('/status', asyncHandler(async (req, res) => {
    try {
        const isInitialized = blockchainService.isInitialized();
        const contractAddresses = blockchainService.getContractAddresses();

        res.json({
            success: true,
            data: {
                initialized: isInitialized,
                contractAddresses,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        logger.error('Failed to get blockchain service status', error);
        res.status(500).json({
            error: 'Failed to get service status',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));

export default router;
