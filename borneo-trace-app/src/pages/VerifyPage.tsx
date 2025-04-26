import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  Paper, 
  CircularProgress,
  Alert,
  Divider,
  Grid
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useBatches } from '../hooks/useBatches';
import { useCertificates } from '../hooks/useCertificates';
import BatchCard from '../components/BatchCard';
import CertificateCard from '../components/CertificateCard';
import { Batch, Certificate } from '../types';

const VerifyPage: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const { getBatch, loading: batchLoading, error: batchError } = useBatches();
  const { getCertificate, loading: certLoading, error: certError } = useCertificates();
  
  const [batch, setBatch] = useState<Batch | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  
  useEffect(() => {
    const verifyBatch = async () => {
      if (!batchId) {
        setVerifyError('No batch ID provided');
        return;
      }
      
      try {
        const batchIdNum = parseInt(batchId);
        
        if (isNaN(batchIdNum)) {
          setVerifyError('Invalid batch ID format');
          return;
        }
        
        const batchData = await getBatch(batchIdNum);
        
        if (!batchData) {
          setVerifyError(`Batch #${batchId} not found`);
          return;
        }
        
        setBatch(batchData);
        
        // Load linked certificates
        if (batchData.linkedCertificateIds.length > 0) {
          const certsData = await Promise.all(
            batchData.linkedCertificateIds.map(id => getCertificate(id))
          );
          
          setCertificates(certsData.filter(cert => cert !== null) as Certificate[]);
        }
      } catch (err) {
        console.error('Error verifying batch:', err);
        setVerifyError('Failed to verify batch');
      }
    };
    
    verifyBatch();
  }, [batchId, getBatch, getCertificate]);
  
  const handleScanAnother = () => {
    navigate('/scan');
  };
  
  const loading = batchLoading || certLoading;
  const error = batchError || certError || verifyError;
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Product Verification
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" size="small" onClick={handleScanAnother}>
                Scan Another Product
              </Button>
            </Box>
          </Alert>
        )}
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {batch && !loading && !error && (
          <>
            <Alert severity="success" sx={{ mb: 3 }}>
              Product verification successful!
            </Alert>
            
            <Typography variant="h5" component="h2" gutterBottom>
              Batch Information
            </Typography>
            <BatchCard batch={batch} showActions={false} />
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h5" component="h2" gutterBottom>
              Linked Certificates
            </Typography>
            
            {certificates.length > 0 ? (
              <Grid container spacing={2}>
                {certificates.map((cert) => (
                  <Grid item xs={12} md={6} key={cert.tokenId}>
                    <CertificateCard certificate={cert} showActions={false} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No certificates linked to this batch.
              </Typography>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button variant="outlined" onClick={handleScanAnother}>
                Scan Another Product
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default VerifyPage;
