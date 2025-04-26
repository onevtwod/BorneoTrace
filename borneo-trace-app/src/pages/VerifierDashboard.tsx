import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Paper, 
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import { useWeb3 } from '../contexts/Web3Context';
import { useBatches } from '../hooks/useBatches';
import { useCertificates } from '../hooks/useCertificates';
import BatchCard from '../components/BatchCard';
import { Batch, UserRole } from '../types';
import { useNavigate } from 'react-router-dom';

const VerifierDashboard: React.FC = () => {
  const { user, account } = useWeb3();
  const navigate = useNavigate();
  const { 
    getPendingBatches,
    getBatch,
    verifyBatch,
    loading, 
    error 
  } = useBatches();
  
  const [pendingBatchIds, setPendingBatchIds] = useState<number[]>([]);
  const [pendingBatches, setPendingBatches] = useState<Batch[]>([]);
  const [openVerifyDialog, setOpenVerifyDialog] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [loadingBatches, setLoadingBatches] = useState(false);
  
  // Check if user is a verifier
  useEffect(() => {
    if (user && !user.roles.includes(UserRole.Verifier)) {
      navigate('/');
    }
  }, [user, navigate]);
  
  // Load pending batches
  useEffect(() => {
    const loadPendingBatches = async () => {
      if (account) {
        try {
          const batchIds = await getPendingBatches();
          setPendingBatchIds(batchIds);
          
          if (batchIds.length > 0) {
            setLoadingBatches(true);
            const batchesData = await Promise.all(
              batchIds.map(id => getBatch(id))
            );
            setPendingBatches(batchesData.filter(batch => batch !== null) as Batch[]);
            setLoadingBatches(false);
          }
        } catch (err) {
          console.error('Error loading pending batches:', err);
          setLoadingBatches(false);
        }
      }
    };
    
    loadPendingBatches();
  }, [account, getPendingBatches, getBatch]);
  
  const handleOpenVerifyDialog = (id: number) => {
    setSelectedBatchId(id);
    setOpenVerifyDialog(true);
  };
  
  const handleCloseVerifyDialog = () => {
    setOpenVerifyDialog(false);
    setSelectedBatchId(null);
  };
  
  const handleVerifyBatch = async () => {
    if (!selectedBatchId) {
      return;
    }
    
    try {
      const success = await verifyBatch(selectedBatchId);
      
      if (success) {
        // Refresh pending batches
        const batchIds = await getPendingBatches();
        setPendingBatchIds(batchIds);
        
        if (batchIds.length > 0) {
          setLoadingBatches(true);
          const batchesData = await Promise.all(
            batchIds.map(id => getBatch(id))
          );
          setPendingBatches(batchesData.filter(batch => batch !== null) as Batch[]);
          setLoadingBatches(false);
        } else {
          setPendingBatches([]);
        }
        
        handleCloseVerifyDialog();
      }
    } catch (err) {
      console.error('Error verifying batch:', err);
    }
  };
  
  if (!user || !user.roles.includes(UserRole.Verifier)) {
    return (
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="h5">
          You need to be registered as a verifier to access this page.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Verifier Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Pending Batch Verifications
        </Typography>
        <Typography variant="body1">
          Review and verify batches created by producers before they are minted on the blockchain.
        </Typography>
      </Paper>
      
      {loading || loadingBatches ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : pendingBatches.length > 0 ? (
        <Grid container spacing={2}>
          {pendingBatches.map((batch) => (
            <Grid item xs={12} key={batch.tokenId}>
              <Paper sx={{ p: 2, position: 'relative' }}>
                <BatchCard 
                  batch={batch} 
                  showActions={false}
                />
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => handleOpenVerifyDialog(batch.tokenId)}
                  >
                    Verify Batch
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" color="text.secondary">
          No pending batches found. All batches have been verified.
        </Typography>
      )}
      
      {/* Verify Batch Dialog */}
      <Dialog open={openVerifyDialog} onClose={handleCloseVerifyDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Verify Batch</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to verify batch #{selectedBatchId}?
          </Typography>
          <Typography variant="body2" paragraph>
            By verifying this batch, you confirm that the information provided by the producer is accurate and the batch meets all required standards.
          </Typography>
          <Typography variant="body2" color="primary" paragraph>
            This will mint the batch NFT on the blockchain.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVerifyDialog}>Cancel</Button>
          <Button 
            onClick={handleVerifyBatch} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Verify Batch'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VerifierDashboard;
