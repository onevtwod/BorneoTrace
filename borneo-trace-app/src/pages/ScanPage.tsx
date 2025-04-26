import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  Paper, 
  CircularProgress,
  Alert,
  Divider,
  TextField,
  Grid,
  Tab,
  Tabs
} from '@mui/material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useWeb3 } from '../contexts/Web3Context';
import { useBatches } from '../hooks/useBatches';
import { useCertificates } from '../hooks/useCertificates';
import BatchCard from '../components/BatchCard';
import CertificateCard from '../components/CertificateCard';
import { Batch, Certificate } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ScanPage: React.FC = () => {
  const { account } = useWeb3();
  const { getBatch, loading: batchLoading, error: batchError } = useBatches();
  const { getCertificate, loading: certLoading, error: certError } = useCertificates();
  
  const [tabValue, setTabValue] = useState(0);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [scannedBatchId, setScannedBatchId] = useState<string>('');
  const [manualBatchId, setManualBatchId] = useState<string>('');
  const [batch, setBatch] = useState<Batch | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize QR scanner
  useEffect(() => {
    if (tabValue === 0 && !scanner) {
      const newScanner = new Html5QrcodeScanner(
        'reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      
      newScanner.render(
        (decodedText) => {
          // Extract batch ID from URL if needed
          let batchId = decodedText;
          if (decodedText.includes('/verify/')) {
            batchId = decodedText.split('/verify/')[1];
          }
          
          setScannedBatchId(batchId);
          handleVerifyBatch(batchId);
          
          // Stop scanner after successful scan
          if (scanner) {
            scanner.clear();
          }
        },
        (error) => {
          // Handle scan error
          console.warn(`QR scan error: ${error}`);
        }
      );
      
      setScanner(newScanner);
      
      return () => {
        if (newScanner) {
          newScanner.clear();
        }
      };
    }
  }, [tabValue]);
  
  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanner]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Clear previous results
    setBatch(null);
    setCertificates([]);
    setScanError(null);
    
    // Clear scanner if switching away from scan tab
    if (newValue !== 0 && scanner) {
      scanner.clear();
      setScanner(null);
    }
  };
  
  const handleManualVerify = () => {
    if (!manualBatchId) return;
    handleVerifyBatch(manualBatchId);
  };
  
  const handleVerifyBatch = async (batchIdStr: string) => {
    setIsLoading(true);
    setScanError(null);
    setBatch(null);
    setCertificates([]);
    
    try {
      const batchId = parseInt(batchIdStr);
      
      if (isNaN(batchId)) {
        setScanError('Invalid batch ID format');
        setIsLoading(false);
        return;
      }
      
      const batchData = await getBatch(batchId);
      
      if (!batchData) {
        setScanError(`Batch #${batchId} not found`);
        setIsLoading(false);
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
      setScanError('Failed to verify batch');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetScan = () => {
    setBatch(null);
    setCertificates([]);
    setScanError(null);
    setScannedBatchId('');
    setManualBatchId('');
    
    // Reinitialize scanner
    if (tabValue === 0) {
      if (scanner) {
        scanner.clear();
      }
      
      const newScanner = new Html5QrcodeScanner(
        'reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      
      newScanner.render(
        (decodedText) => {
          // Extract batch ID from URL if needed
          let batchId = decodedText;
          if (decodedText.includes('/verify/')) {
            batchId = decodedText.split('/verify/')[1];
          }
          
          setScannedBatchId(batchId);
          handleVerifyBatch(batchId);
          
          // Stop scanner after successful scan
          if (newScanner) {
            newScanner.clear();
          }
        },
        (error) => {
          // Handle scan error
          console.warn(`QR scan error: ${error}`);
        }
      );
      
      setScanner(newScanner);
    }
  };
  
  const loading = batchLoading || certLoading || isLoading;
  const error = batchError || certError || scanError;
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Verify Product
      </Typography>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Scan QR Code" />
          <Tab label="Enter Batch ID" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          {!batch && !loading && (
            <Box sx={{ textAlign: 'center', my: 2 }}>
              <Typography variant="body1" paragraph>
                Scan a product's QR code to verify its certification and origin.
              </Typography>
              <div id="reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {!batch && !loading && (
            <Box sx={{ my: 2 }}>
              <Typography variant="body1" paragraph>
                Enter a batch ID to verify its certification and origin.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Batch ID"
                  variant="outlined"
                  value={manualBatchId}
                  onChange={(e) => setManualBatchId(e.target.value)}
                  fullWidth
                />
                <Button 
                  variant="contained" 
                  onClick={handleManualVerify}
                  disabled={!manualBatchId}
                >
                  Verify
                </Button>
              </Box>
            </Box>
          )}
        </TabPanel>
        
        {error && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button variant="outlined" onClick={resetScan}>
              Try Again
            </Button>
          </Box>
        )}
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {batch && (
          <Box sx={{ p: 3 }}>
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
              <Button variant="outlined" onClick={resetScan}>
                Scan Another Product
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ScanPage;
