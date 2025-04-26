import React from 'react';
import { Typography, Button, Box, Paper, Grid, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';

const HomePage: React.FC = () => {
  const { account, connectWallet } = useWeb3();

  return (
    <Container>
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          BorneoTrace
        </Typography>
        <Typography variant="h5" component="h2" color="text.secondary" gutterBottom>
          Halal & Sustainable Certification Tracking System on MasChain
        </Typography>
        
        {!account && (
          <Button 
            variant="contained" 
            size="large" 
            onClick={connectWallet}
            sx={{ mt: 2 }}
          >
            Connect Wallet to Get Started
          </Button>
        )}
      </Box>
      
      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" component="h3" gutterBottom>
              For Certifiers
            </Typography>
            <Typography variant="body1" paragraph>
              Issue and manage digital certificates for Halal, MSPO, Organic, and other certifications.
            </Typography>
            <Button 
              component={RouterLink} 
              to="/certifier" 
              variant="outlined" 
              fullWidth
            >
              Certifier Dashboard
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" component="h3" gutterBottom>
              For Producers
            </Typography>
            <Typography variant="body1" paragraph>
              Create and manage product batches, link them to certificates, and track their journey.
            </Typography>
            <Button 
              component={RouterLink} 
              to="/producer" 
              variant="outlined" 
              fullWidth
            >
              Producer Dashboard
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" component="h3" gutterBottom>
              For Consumers
            </Typography>
            <Typography variant="body1" paragraph>
              Verify the authenticity and certification status of products by scanning QR codes.
            </Typography>
            <Button 
              component={RouterLink} 
              to="/scan" 
              variant="outlined" 
              fullWidth
            >
              Scan QR Code
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          About BorneoTrace
        </Typography>
        <Typography variant="body1" paragraph>
          BorneoTrace is a blockchain-based platform leveraging MasChain to track the provenance and certification 
          status (e.g., Halal, MSPO, Organic, Fair Trade) of products, particularly focusing on agricultural and 
          food & beverage industries relevant to Sabah and Malaysia.
        </Typography>
        <Typography variant="body1" paragraph>
          The system aims to enhance transparency, traceability, and trust within supply chains, aligning with 
          UN Sustainable Development Goal 9 (Industry, Innovation, and Infrastructure) by fostering resilient 
          and sustainable industrial practices through technological innovation.
        </Typography>
      </Box>
    </Container>
  );
};

export default HomePage;
