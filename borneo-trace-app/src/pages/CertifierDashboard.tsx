import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  TextField, 
  Grid, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { useWeb3 } from '../contexts/Web3Context';
import { useCertificates } from '../hooks/useCertificates';
import CertificateCard from '../components/CertificateCard';
import { Certificate, UserRole } from '../types';
import { useNavigate } from 'react-router-dom';

const CertifierDashboard: React.FC = () => {
  const { user, account } = useWeb3();
  const navigate = useNavigate();
  const { 
    mintCertificate, 
    getOwnedCertificates, 
    revokeCertificate,
    loading, 
    error 
  } = useCertificates();
  
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [openMintDialog, setOpenMintDialog] = useState(false);
  const [openRevokeDialog, setOpenRevokeDialog] = useState(false);
  const [selectedCertificateId, setSelectedCertificateId] = useState<number | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  
  // Form state
  const [certIdString, setCertIdString] = useState('');
  const [certType, setCertType] = useState('Halal');
  const [certifiedEntityAddress, setCertifiedEntityAddress] = useState('');
  const [validityPeriod, setValidityPeriod] = useState('365');
  const [metadataURI, setMetadataURI] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  
  // Check if user is a certifier
  useEffect(() => {
    if (user && !user.roles.includes(UserRole.Certifier)) {
      navigate('/');
    }
  }, [user, navigate]);
  
  // Load certificates
  useEffect(() => {
    const loadCertificates = async () => {
      if (account) {
        const certs = await getOwnedCertificates();
        setCertificates(certs);
      }
    };
    
    loadCertificates();
  }, [account, getOwnedCertificates]);
  
  const handleOpenMintDialog = () => {
    setOpenMintDialog(true);
    setFormError(null);
  };
  
  const handleCloseMintDialog = () => {
    setOpenMintDialog(false);
    resetForm();
  };
  
  const handleOpenRevokeDialog = (id: number) => {
    setSelectedCertificateId(id);
    setOpenRevokeDialog(true);
  };
  
  const handleCloseRevokeDialog = () => {
    setOpenRevokeDialog(false);
    setSelectedCertificateId(null);
    setRevokeReason('');
  };
  
  const resetForm = () => {
    setCertIdString('');
    setCertType('Halal');
    setCertifiedEntityAddress('');
    setValidityPeriod('365');
    setMetadataURI('');
    setFormError(null);
  };
  
  const handleMintCertificate = async () => {
    setFormError(null);
    
    // Validate form
    if (!certIdString || !certType || !certifiedEntityAddress || !validityPeriod) {
      setFormError('Please fill in all required fields');
      return;
    }
    
    try {
      // Convert validity period to seconds (days * 24 * 60 * 60)
      const validityInSeconds = parseInt(validityPeriod) * 24 * 60 * 60;
      
      const tokenId = await mintCertificate(
        certIdString,
        certType,
        certifiedEntityAddress,
        validityInSeconds,
        metadataURI || 'ipfs://placeholder'
      );
      
      if (tokenId) {
        // Refresh certificates
        const certs = await getOwnedCertificates();
        setCertificates(certs);
        handleCloseMintDialog();
      }
    } catch (err) {
      console.error('Error minting certificate:', err);
      setFormError('Failed to mint certificate');
    }
  };
  
  const handleRevokeCertificate = async () => {
    if (!selectedCertificateId || !revokeReason) {
      return;
    }
    
    try {
      const success = await revokeCertificate(selectedCertificateId, revokeReason);
      
      if (success) {
        // Refresh certificates
        const certs = await getOwnedCertificates();
        setCertificates(certs);
        handleCloseRevokeDialog();
      }
    } catch (err) {
      console.error('Error revoking certificate:', err);
    }
  };
  
  if (!user || !user.roles.includes(UserRole.Certifier)) {
    return (
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="h5">
          You need to be registered as a certifier to access this page.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Certifier Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Issue New Certificate
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleOpenMintDialog}
          >
            Create Certificate
          </Button>
        </Box>
        <Typography variant="body1">
          Issue new Halal, MSPO, Organic, or other certificates to producers and facilities.
        </Typography>
      </Paper>
      
      <Typography variant="h5" component="h2" gutterBottom>
        Issued Certificates
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : certificates.length > 0 ? (
        <Grid container spacing={2}>
          {certificates.map((cert) => (
            <Grid item xs={12} md={6} key={cert.tokenId}>
              <CertificateCard 
                certificate={cert} 
                onRevoke={handleOpenRevokeDialog}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" color="text.secondary">
          No certificates found. Start by creating a new certificate.
        </Typography>
      )}
      
      {/* Mint Certificate Dialog */}
      <Dialog open={openMintDialog} onClose={handleCloseMintDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Issue New Certificate</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          
          <TextField
            margin="dense"
            label="Certificate ID"
            fullWidth
            variant="outlined"
            value={certIdString}
            onChange={(e) => setCertIdString(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Certificate Type</InputLabel>
            <Select
              value={certType}
              onChange={(e) => setCertType(e.target.value)}
              label="Certificate Type"
              required
            >
              <MenuItem value="Halal">Halal</MenuItem>
              <MenuItem value="MSPO">MSPO (Malaysian Sustainable Palm Oil)</MenuItem>
              <MenuItem value="Organic">Organic</MenuItem>
              <MenuItem value="FairTrade">Fair Trade</MenuItem>
              <MenuItem value="RSPO">RSPO (Roundtable on Sustainable Palm Oil)</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            label="Certified Entity Address"
            fullWidth
            variant="outlined"
            value={certifiedEntityAddress}
            onChange={(e) => setCertifiedEntityAddress(e.target.value)}
            required
            placeholder="0x..."
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Validity Period (days)"
            fullWidth
            variant="outlined"
            type="number"
            value={validityPeriod}
            onChange={(e) => setValidityPeriod(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Metadata URI (optional)"
            fullWidth
            variant="outlined"
            value={metadataURI}
            onChange={(e) => setMetadataURI(e.target.value)}
            placeholder="ipfs://..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMintDialog}>Cancel</Button>
          <Button 
            onClick={handleMintCertificate} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Issue Certificate'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Revoke Certificate Dialog */}
      <Dialog open={openRevokeDialog} onClose={handleCloseRevokeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Revoke Certificate</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to revoke certificate #{selectedCertificateId}?
          </Typography>
          <Typography variant="body2" color="error" paragraph>
            This action cannot be undone.
          </Typography>
          <TextField
            margin="dense"
            label="Reason for Revocation"
            fullWidth
            variant="outlined"
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
            required
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRevokeDialog}>Cancel</Button>
          <Button 
            onClick={handleRevokeCertificate} 
            variant="contained"
            color="error"
            disabled={loading || !revokeReason}
          >
            {loading ? <CircularProgress size={24} /> : 'Revoke Certificate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CertifierDashboard;
