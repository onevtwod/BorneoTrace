import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { User, UserRole, ContractAddresses } from '../types';

// Import contract ABIs
import RegistryABI from '../artifacts/contracts/Registry.sol/Registry.json';
import CertificateNFTABI from '../artifacts/contracts/CertificateNFT.sol/CertificateNFT.json';
import BatchNFTABI from '../artifacts/contracts/BatchNFT.sol/BatchNFT.json';

interface Web3ContextType {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: number | null;
  contracts: {
    registry: ethers.Contract | null;
    certificateNFT: ethers.Contract | null;
    batchNFT: ethers.Contract | null;
  };
  contractAddresses: ContractAddresses | null;
  user: User | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnecting: boolean;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  account: null,
  chainId: null,
  contracts: {
    registry: null,
    certificateNFT: null,
    batchNFT: null,
  },
  contractAddresses: null,
  user: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isConnecting: false,
  error: null,
});

// Default contract addresses - replace with actual deployed addresses
const DEFAULT_CONTRACT_ADDRESSES: ContractAddresses = {
  registry: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Example address
  certificateNFT: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // Example address
  batchNFT: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', // Example address
};

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [contracts, setContracts] = useState({
    registry: null as ethers.Contract | null,
    certificateNFT: null as ethers.Contract | null,
    batchNFT: null as ethers.Contract | null,
  });
  const [contractAddresses, setContractAddresses] = useState<ContractAddresses | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize contracts with addresses
  const initializeContracts = async (
    provider: ethers.providers.Web3Provider,
    signerOrProvider: ethers.Signer | ethers.providers.Provider,
    addresses: ContractAddresses
  ) => {
    try {
      const registry = new ethers.Contract(
        addresses.registry,
        RegistryABI.abi,
        signerOrProvider
      );

      const certificateNFT = new ethers.Contract(
        addresses.certificateNFT,
        CertificateNFTABI.abi,
        signerOrProvider
      );

      const batchNFT = new ethers.Contract(
        addresses.batchNFT,
        BatchNFTABI.abi,
        signerOrProvider
      );

      setContracts({
        registry,
        certificateNFT,
        batchNFT,
      });

      return { registry, certificateNFT, batchNFT };
    } catch (error) {
      console.error('Failed to initialize contracts:', error);
      setError('Failed to initialize contracts');
      return {
        registry: null,
        certificateNFT: null,
        batchNFT: null,
      };
    }
  };

  // Determine user roles
  const determineUserRoles = async (
    address: string,
    registry: ethers.Contract
  ): Promise<UserRole[]> => {
    try {
      const roles: UserRole[] = [];

      const [isCertifier, isProducer, isVerifier] = await Promise.all([
        registry.isCertifier(address),
        registry.isProducer(address),
        registry.isVerifier(address),
      ]);

      if (isCertifier) roles.push(UserRole.Certifier);
      if (isProducer) roles.push(UserRole.Producer);
      if (isVerifier) roles.push(UserRole.Verifier);

      // Everyone is a consumer by default
      roles.push(UserRole.Consumer);

      return roles;
    } catch (error) {
      console.error('Failed to determine user roles:', error);
      return [UserRole.Consumer]; // Default to consumer
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];

      // Create provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setAccount(account);
      setChainId(network.chainId);

      // Use default addresses for now
      const addresses = DEFAULT_CONTRACT_ADDRESSES;
      setContractAddresses(addresses);

      // Initialize contracts
      const initializedContracts = await initializeContracts(provider, signer, addresses);

      // Determine user roles if registry is available
      if (initializedContracts.registry) {
        const roles = await determineUserRoles(account, initializedContracts.registry);
        setUser({ address: account, roles });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setUser(null);
    setContracts({
      registry: null,
      certificateNFT: null,
      batchNFT: null,
    });
  };

  // Handle account and chain changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnectWallet();
        } else if (account !== accounts[0]) {
          // Account changed, reconnect
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        // Chain changed, reload the page
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account]);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        account,
        chainId,
        contracts,
        contractAddresses,
        user,
        connectWallet,
        disconnectWallet,
        isConnecting,
        error,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);

// Add type definitions for window.ethereum
declare global {
  interface Window {
    ethereum: any;
  }
}
