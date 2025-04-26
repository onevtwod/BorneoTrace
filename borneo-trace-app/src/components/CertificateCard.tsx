import React from 'react';
import { Card, CardContent, Typography, Chip, Box, Button } from '@mui/material';
import { Certificate, CertificateStatus } from '../types';
import { formatDate, formatAddress, formatCertificateStatus, isCertificateValid } from '../utils';

interface CertificateCardProps {
  certificate: Certificate;
  onRevoke?: (id: number) => void;
  showActions?: boolean;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ 
  certificate, 
  onRevoke,
  showActions = true
}) => {
  const isValid = isCertificateValid(certificate);
  
  const getStatusColor = () => {
    switch (certificate.status) {
      case CertificateStatus.Active:
        return 'success';
      case CertificateStatus.Expired:
        return 'warning';
      case CertificateStatus.Revoked:
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div">
            Certificate #{certificate.tokenId}
          </Typography>
          <Chip 
            label={formatCertificateStatus(certificate.status)} 
            color={getStatusColor() as any}
            size="small"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          ID: {certificate.certIdString}
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Type: {certificate.certType}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Issued by: {formatAddress(certificate.issuer)}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Issued to: {formatAddress(certificate.certifiedEntityAddress)}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Issue Date: {formatDate(certificate.issueTimestamp)}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Expiry Date: {formatDate(certificate.expiryTimestamp)}
        </Typography>
        
        {showActions && onRevoke && certificate.status === CertificateStatus.Active && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              color="error" 
              size="small"
              onClick={() => onRevoke(certificate.tokenId)}
            >
              Revoke
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CertificateCard;
