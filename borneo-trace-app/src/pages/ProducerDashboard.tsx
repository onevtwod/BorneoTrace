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
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { useWeb3 } from '../contexts/Web3Context';
import { useBatches } from '../hooks/useBatches';
import { useCertificates } from '../hooks/useCertificates';
import BatchCard from '../components/BatchCard';
import CertificateCard from '../components/CertificateCard';
import { Batch, Certificate, UserRole, BatchStatus } from '../types';
import { useNavigate } from 'react-router-dom';

const ProducerDashboard: React.FC = () => {
  const { user, account } = useWeb3();
  const navigate = useNavigate();
  const { 
    createBatch,
    getOwnedBatches,
    markAsInTransit,
    transferBatch,
    cancelBatch,
    loading: batchLoading, 
    error: batchError 
  } = useBatches();
  
  const {
    getOwnedCertificates,
    loading: certLoading,
    error: certError
  } = useCertificates();
  
  const [batches, setBatches] = useState<Batch[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openTransferDialog, setOpenTransferDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [transferAddress, setTransferAddress] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  
  // Form state
  const [batchId, setBatchId] = useState('');
  const [productType, setProductType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [harvestDate, setHarvestDate] = useState('');
  const [originInfo, setOriginInfo] = useState('');
  const [selectedCertificates, setSelectedCertificates] = useState<number[]>([]);
  const [metadataURI, setMetadataURI] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  
  // Check if user is a producer
  useEffect(() => {
    if (user && !user.roles.includes(UserRole.Producer)) {
      navigate('/');
    }
  }, [user, navigate]);
  
  // Load batches and certificates
  useEffect(() => {
    const loadData = async () => {
      if (account) {
        const [batchesData, certsData] = await Promise.all([
          getOwnedBatches(),
          getOwnedCertificates()
        ]);
        setBatches(batchesData);
        setCertificates(certsData);
      }
    };
    
    loadData();
  }, [account, getOwnedBatches, getOwnedCertificates]);
  
  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
    setFormError(null);
  };
  
  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    resetForm();
  };
  
  const handleOpenTransferDialog = (id: number) => {
    setSelectedBatchId(id);
    setOpenTransferDialog(true);
  };
  
  const handleCloseTransferDialog = () => {
    setOpenTransferDialog(false);
    setSelectedBatchId(null);
    setTransferAddress('');
  };
  
  const handleOpenCancelDialog = (id: number) => {
    setSelectedBatchId(id);
    setOpenCancelDialog(true);
  };
  
  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setSelectedBatchId(null);
    setCancelReason('');
  };
  
  const resetForm = () => {
    setBatchId('');
    setProductType('');
    setQuantity('');
    setUnit('kg');
    setHarvestDate('');
    setOriginInfo('');
    setSelectedCertificates([]);
    setMetadataURI('');
    setFormError(null);
  };
  
  const handleCreateBatch = async () => {
    setFormError(null);
    
    // Validate form
    if (!batchId || !productType || !quantity || !unit || !harvestDate || !originInfo) {
      setFormError('Please fill in all required fields');
      return;
    }
    
    if (selectedCertificates.length === 0) {
      setFormError('Please select at least one certificate');
      return;
    }
    
    try {
      // Convert harvest date to timestamp
      const harvestTimestamp = Math.floor(new Date(harvestDate).getTime() / 1000);
      
      const tokenId = await createBatch(
        batchId,
        productType,
        parseInt(quantity),
        unit,
        harvestTimestamp,
        originInfo,
        selectedCertificates,
        metadataURI || 'ipfs://placeholder'
      );
      
      if (tokenId) {
        // Refresh batches
        const batchesData = await getOwnedBatches();
        setBatches(batchesData);
        handleCloseCreateDialog();
      }
    } catch (err) {
      console.error('Error creating batch:', err);
      setFormError('Failed to create batch');
    }
  };
  
  const handleTransferBatch = async () => {
    if (!selectedBatchId || !transferAddress) {
      return;
    }
    
    try {
      const success = await transferBatch(selectedBatchId, transferAddress);
      
      if (success) {
        // Refresh batches
        const batchesData = await getOwnedBatches();
        setBatches(batchesData);
        handleCloseTransferDialog();
      }
    } catch (err) {
      console.error('Error transferring batch:', err);
    }
  };
  
  const handleCancelBatch = async () => {
    if (!selectedBatchId || !cancelReason) {
      return;
    }
    
    try {
      const success = await cancelBatch(selectedBatchId, cancelReason);
      
      if (success) {
        // Refresh batches
        const batchesData = await getOwnedBatches();
        setBatches(batchesData);
        handleCloseCancelDialog();
      }
    } catch (err) {
      console.error('Error cancelling batch:', err);
    }
  };
  
  const handleMarkAsInTransit = async (id: number) => {
    try {
      const success = await markAsInTransit(id);
      
      if (success) {
        // Refresh batches
        const batchesData = await getOwnedBatches();
        setBatches(batchesData);
      }
    } catch (err) {
      console.error('Error marking batch as in transit:', err);
    }
  };
  
  const toggleCertificateSelection = (id: number) => {
    setSelectedCertificates(prev => 
      prev.includes(id) 
        ? prev.filter(certId => certId !== id)
        : [...prev, id]
    );
  };
  
  if (!user || !user.roles.includes(UserRole.Producer)) {
    return (
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="h5">
          You need to be registered as a producer to access this page.
        </Typography>
      </Box>
    );
  }
  
  const loading = batchLoading || certLoading;
  const error = batchError || certError;
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Producer Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Create New Batch
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleOpenCreateDialog}
            disabled={certificates.length === 0}
          >
            Create Batch
          </Button>
        </Box>
        <Typography variant="body1">
          Create new product batches and link them to your certificates.
        </Typography>
        {certificates.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            You need at least one valid certificate to create a batch. Please contact a certifier to issue a certificate for you.
          </Alert>
        )}
      </Paper>
      
      <Typography variant="h5" component="h2" gutterBottom>
        Your Batches
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : batches.length > 0 ? (
        <Grid container spacing={2}>
          {batches.map((batch) => (
            <Grid item xs={12} key={batch.tokenId}>
              <BatchCard 
                batch={batch} 
                onTransfer={handleOpenTransferDialog}
                onMarkInTransit={handleMarkAsInTransit}
                onCancel={handleOpenCancelDialog}
                showQR={true}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" color="text.secondary">
          No batches found. Start by creating a new batch.
        </Typography>
      )}
      
      <Divider sx={{ my: 4 }} />
      
      <Typography variant="h5" component="h2" gutterBottom>
        Your Certificates
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
                showActions={false}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" color="text.secondary">
          No certificates found. Contact a certifier to issue a certificate for you.
        </Typography>
      )}
      
      {/* Create Batch Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} maxWidth="md" fullWidth>
        <DialogTitle>Create New Batch</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                label="Batch ID"
                fullWidth
                variant="outlined"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="dense"
                label="Product Type"
                fullWidth
                variant="outlined"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <TextField
                    margin="dense"
                    label="Quantity"
                    fullWidth
                    variant="outlined"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth variant="outlined" sx={{ mt: 1, mb: 2 }}>
                    <InputLabel>Unit</InputLabel>
                    <Select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      label="Unit"
                      required
                    >
                      <MenuItem value="kg">kg</MenuItem>
                      <MenuItem value="ton">ton</MenuItem>
                      <MenuItem value="liter">liter</MenuItem>
                      <MenuItem value="piece">piece</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              <TextField
                margin="dense"
                label="Harvest Date"
                fullWidth
                variant="outlined"
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="dense"
                label="Origin Information"
                fullWidth
                variant="outlined"
                value={originInfo}
                onChange={(e) => setOriginInfo(e.target.value)}
                required
                placeholder="e.g., Tawau, Sabah"
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
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Select Certificates to Link
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Select one or more valid certificates to link to this batch.
              </Typography>
              
              <List sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid #eee', borderRadius: 1 }}>
                {certificates.map((cert) => (
                  <ListItem 
                    key={cert.tokenId}
                    button
                    onClick={() => toggleCertificateSelection(cert.tokenId)}
                    selected={selectedCertificates.includes(cert.tokenId)}
                    sx={{ 
                      borderBottom: '1px solid #eee',
                      bgcolor: selectedCertificates.includes(cert.tokenId) ? 'action.selected' : 'inherit'
                    }}
                  >
                    <ListItemText
                      primary={`${cert.certType} Certificate #${cert.tokenId}`}
                      secondary={`ID: ${cert.certIdString}`}
                    />
                    {selectedCertificates.includes(cert.tokenId) && (
                      <Chip label="Selected" color="primary" size="small" />
                    )}
                  </ListItem>
                ))}
              </List>
              
              {certificates.length === 0 && (
                <Alert severity="warning">
                  You don't have any certificates. You need at least one valid certificate to create a batch.
                </Alert>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateBatch} 
            variant="contained"
            disabled={loading || selectedCertificates.length === 0}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Batch'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Transfer Batch Dialog */}
      <Dialog open={openTransferDialog} onClose={handleCloseTransferDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Transfer Batch Ownership</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Transfer ownership of batch #{selectedBatchId} to another address.
          </Typography>
          <TextField
            margin="dense"
            label="Recipient Address"
            fullWidth
            variant="outlined"
            value={transferAddress}
            onChange={(e) => setTransferAddress(e.target.value)}
            required
            placeholder="0x..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransferDialog}>Cancel</Button>
          <Button 
            onClick={handleTransferBatch} 
            variant="contained"
            disabled={loading || !transferAddress}
          >
            {loading ? <CircularProgress size={24} /> : 'Transfer Batch'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Cancel Batch Dialog */}
      <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Batch</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to cancel batch #{selectedBatchId}?
          </Typography>
          <Typography variant="body2" color="error" paragraph>
            This action cannot be undone.
          </Typography>
          <TextField
            margin="dense"
            label="Reason for Cancellation"
            fullWidth
            variant="outlined"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            required
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog}>Cancel</Button>
          <Button 
            onClick={handleCancelBatch} 
            variant="contained"
            color="error"
            disabled={loading || !cancelReason}
          >
            {loading ? <CircularProgress size={24} /> : 'Cancel Batch'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProducerDashboard;
