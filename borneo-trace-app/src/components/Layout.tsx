import React, { ReactNode } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box, CircularProgress } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { formatAddress } from '../utils';
import { UserRole } from '../types';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { account, connectWallet, disconnectWallet, isConnecting, user } = useWeb3();
  const navigate = useNavigate();

  const handleConnect = async () => {
    await connectWallet();
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const renderRoleBasedLinks = () => {
    if (!user) return null;

    return (
      <>
        {user.roles.includes(UserRole.Certifier) && (
          <Button color="inherit" component={RouterLink} to="/certifier">
            Certifier Dashboard
          </Button>
        )}
        {user.roles.includes(UserRole.Producer) && (
          <Button color="inherit" component={RouterLink} to="/producer">
            Producer Dashboard
          </Button>
        )}
        {user.roles.includes(UserRole.Verifier) && (
          <Button color="inherit" component={RouterLink} to="/verifier">
            Verifier Dashboard
          </Button>
        )}
      </>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Button color="inherit" component={RouterLink} to="/">
              BorneoTrace
            </Button>
          </Typography>
          
          <Button color="inherit" component={RouterLink} to="/scan">
            Scan QR
          </Button>
          
          {renderRoleBasedLinks()}
          
          {account ? (
            <>
              <Typography variant="body2" sx={{ mr: 2 }}>
                {formatAddress(account)}
              </Typography>
              <Button color="inherit" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </>
          ) : (
            <Button 
              color="inherit" 
              onClick={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? <CircularProgress size={24} color="inherit" /> : 'Connect Wallet'}
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>
      
      <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper', mt: 'auto' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            BorneoTrace - Halal & Sustainable Certification Tracking System on MasChain
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
