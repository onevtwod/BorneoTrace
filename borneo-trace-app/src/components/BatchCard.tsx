import React from 'react';
import { Card, CardContent, Typography, Chip, Box, Button, Grid } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { Batch, BatchStatus } from '../types';
import { formatDate, formatAddress, formatBatchStatus, generateBatchQRData } from '../utils';

interface BatchCardProps {
  batch: Batch;
  onTransfer?: (id: number) => void;
  onMarkInTransit?: (id: number) => void;
  onCancel?: (id: number) => void;
  showActions?: boolean;
  showQR?: boolean;
  baseUrl?: string;
}

const BatchCard: React.FC<BatchCardProps> = ({ 
  batch, 
  onTransfer,
  onMarkInTransit,
  onCancel,
  showActions = true,
  showQR = false,
  baseUrl = window.location.origin
}) => {
  const getStatusColor = () => {
    switch (batch.status) {
      case BatchStatus.Active:
        return 'success';
      case BatchStatus.InTransit:
        return 'info';
      case BatchStatus.Received:
        return 'success';
      case BatchStatus.Cancelled:
        return 'error';
      case BatchStatus.PendingVerification:
        return 'warning';
      default:
        return 'default';
    }
  };

  const qrData = generateBatchQRData(batch.tokenId, baseUrl);

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={showQR ? 9 : 12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="div">
                Batch #{batch.tokenId}
              </Typography>
              <Chip 
                label={formatBatchStatus(batch.status)} 
                color={getStatusColor() as any}
                size="small"
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              ID: {batch.batchId}
            </Typography>
            
            <Typography variant="body1" gutterBottom>
              Product: {batch.productType}
            </Typography>
            
            <Typography variant="body1" gutterBottom>
              Quantity: {batch.quantity} {batch.unit}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Origin: {batch.originInfo}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Created by: {formatAddress(batch.creator)}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Current owner: {formatAddress(batch.currentOwner)}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Creation Date: {formatDate(batch.creationTimestamp)}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Harvest Date: {formatDate(batch.harvestTimestamp)}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Linked Certificates: {batch.linkedCertificateIds.join(', ') || 'None'}
            </Typography>
          </Grid>
          
          {showQR && (
            <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Box>
                <QRCodeSVG value={qrData} size={120} />
                <Typography variant="caption" display="block" textAlign="center" mt={1}>
                  Scan to verify
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
        
        {showActions && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {onMarkInTransit && batch.status === BatchStatus.Active && (
              <Button 
                variant="outlined" 
                color="primary" 
                size="small"
                onClick={() => onMarkInTransit(batch.tokenId)}
              >
                Mark In Transit
              </Button>
            )}
            
            {onTransfer && (batch.status === BatchStatus.Active || batch.status === BatchStatus.InTransit) && (
              <Button 
                variant="contained" 
                color="primary" 
                size="small"
                onClick={() => onTransfer(batch.tokenId)}
              >
                Transfer
              </Button>
            )}
            
            {onCancel && batch.status !== BatchStatus.Cancelled && (
              <Button 
                variant="outlined" 
                color="error" 
                size="small"
                onClick={() => onCancel(batch.tokenId)}
              >
                Cancel
              </Button>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default BatchCard;
