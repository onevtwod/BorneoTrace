# BorneoTrace Mobile Application

A React Native mobile application for the BorneoTrace supply chain tracking system, providing QR code scanning, product verification, and real-time tracking capabilities for consumers and supply chain participants.

## Features

### Consumer Features
- **QR Code Scanning**: Quick product verification
- **Product History**: Complete supply chain journey
- **Certificate Verification**: Authenticate certifications
- **Real-time Tracking**: Live location and status updates
- **Alerts & Notifications**: Quality and status notifications
- **Offline Mode**: Basic functionality without internet

### Producer Features
- **Batch Management**: Create and manage product batches
- **Certificate Linking**: Link certifications to batches
- **Transfer Operations**: Transfer ownership to next party
- **Status Updates**: Update batch status and location
- **Analytics**: View batch performance metrics

### Verifier Features
- **Verification Queue**: Review pending batch verifications
- **Approval Workflow**: Approve or reject batch requests
- **Quality Checks**: Perform quality assessments
- **History Tracking**: View verification history

## Technology Stack

- **React Native**: Cross-platform mobile development
- **TypeScript**: Type-safe development
- **Expo**: Development and deployment platform
- **React Navigation**: Navigation between screens
- **React Native Camera**: QR code scanning
- **Ethers.js**: Blockchain interaction
- **AsyncStorage**: Local data storage
- **Push Notifications**: Real-time alerts
- **React Native Maps**: Location services

## Project Structure

```
mobile-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── QRScanner.tsx
│   │   ├── BatchCard.tsx
│   │   ├── CertificateCard.tsx
│   │   └── LoadingSpinner.tsx
│   ├── screens/            # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── ScanScreen.tsx
│   │   ├── VerifyScreen.tsx
│   │   ├── ProducerDashboard.tsx
│   │   ├── VerifierDashboard.tsx
│   │   └── SettingsScreen.tsx
│   ├── navigation/         # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── TabNavigator.tsx
│   ├── services/          # API and blockchain services
│   │   ├── api.ts
│   │   ├── blockchain.ts
│   │   ├── storage.ts
│   │   └── notifications.ts
│   ├── hooks/             # Custom React hooks
│   │   ├── useWallet.ts
│   │   ├── useBatches.ts
│   │   └── useCertificates.ts
│   ├── utils/             # Utility functions
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   └── constants.ts
│   ├── types/             # TypeScript type definitions
│   │   ├── api.ts
│   │   ├── blockchain.ts
│   │   └── navigation.ts
│   └── assets/            # Images, fonts, and other assets
│       ├── images/
│       ├── fonts/
│       └── icons/
├── android/               # Android-specific files
├── ios/                   # iOS-specific files
├── app.json              # Expo configuration
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Installation and Setup

### Prerequisites
- Node.js 16+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- React Native development environment
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd mobile-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the development server**
```bash
npm start
```

5. **Run on device/emulator**
```bash
# For Android
npm run android

# For iOS
npm run ios
```

## Key Components

### 1. QR Code Scanner

```typescript
// src/components/QRScanner.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Camera } from 'expo-camera';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onError }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: any) => {
    if (scanned) return;
    
    setScanned(true);
    
    try {
      // Extract batch ID from QR code data
      let batchId = data;
      if (data.includes('/verify/')) {
        batchId = data.split('/verify/')[1];
      }
      
      onScan(batchId);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Scan failed');
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>Camera permission denied</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setHasPermission(null)}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.overlay}>
        <View style={styles.scanArea} />
        <Text style={styles.instruction}>
          Position QR code within the frame
        </Text>
      </View>

      {scanned && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.buttonText}>Scan Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  instruction: {
    color: 'white',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  button: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: '#2e7d32',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QRScanner;
```

### 2. Wallet Integration

```typescript
// src/services/wallet.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ethers } from 'ethers';

interface WalletConfig {
  address: string;
  privateKey?: string;
  mnemonic?: string;
}

class WalletService {
  private wallet: ethers.Wallet | null = null;
  private provider: ethers.providers.JsonRpcProvider | null = null;

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    const rpcUrl = process.env.EXPO_PUBLIC_RPC_URL || 'https://testnet-rpc.maschain.org';
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  }

  async createWallet(): Promise<WalletConfig> {
    const wallet = ethers.Wallet.createRandom();
    
    const config: WalletConfig = {
      address: wallet.address,
      mnemonic: wallet.mnemonic.phrase
    };

    await this.saveWallet(config);
    this.wallet = wallet.connect(this.provider!);
    
    return config;
  }

  async importWallet(mnemonic: string): Promise<WalletConfig> {
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    
    const config: WalletConfig = {
      address: wallet.address,
      mnemonic: wallet.mnemonic.phrase
    };

    await this.saveWallet(config);
    this.wallet = wallet.connect(this.provider!);
    
    return config;
  }

  async loadWallet(): Promise<WalletConfig | null> {
    try {
      const walletData = await AsyncStorage.getItem('wallet');
      if (walletData) {
        const config: WalletConfig = JSON.parse(walletData);
        if (config.mnemonic) {
          this.wallet = ethers.Wallet.fromMnemonic(config.mnemonic).connect(this.provider!);
        }
        return config;
      }
      return null;
    } catch (error) {
      console.error('Failed to load wallet:', error);
      return null;
    }
  }

  private async saveWallet(config: WalletConfig) {
    try {
      await AsyncStorage.setItem('wallet', JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save wallet:', error);
      throw error;
    }
  }

  async sendTransaction(to: string, value: string, data?: string) {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    const tx = await this.wallet.sendTransaction({
      to,
      value: ethers.utils.parseEther(value),
      data
    });

    return tx;
  }

  getWallet(): ethers.Wallet | null {
    return this.wallet;
  }

  getAddress(): string | null {
    return this.wallet?.address || null;
  }

  async clearWallet() {
    await AsyncStorage.removeItem('wallet');
    this.wallet = null;
  }
}

export const walletService = new WalletService();
export default walletService;
```

### 3. Batch Management

```typescript
// src/screens/ProducerDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { batchService } from '../services/batchService';
import { Batch } from '../types/batch';

const ProducerDashboard: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      setLoading(true);
      const userBatches = await batchService.getUserBatches();
      setBatches(userBatches);
    } catch (error) {
      Alert.alert('Error', 'Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBatches();
    setRefreshing(false);
  };

  const handleCreateBatch = () => {
    navigation.navigate('CreateBatch' as never);
  };

  const handleBatchPress = (batch: Batch) => {
    navigation.navigate('BatchDetails' as never, { batchId: batch.tokenId } as never);
  };

  const renderBatchItem = ({ item }: { item: Batch }) => (
    <TouchableOpacity
      style={styles.batchItem}
      onPress={() => handleBatchPress(item)}
    >
      <Text style={styles.batchId}>Batch #{item.batchId}</Text>
      <Text style={styles.productType}>{item.productType}</Text>
      <Text style={styles.quantity}>
        {item.quantity} {item.unit}
      </Text>
      <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
        <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusStyle = (status: number) => {
    switch (status) {
      case 0: return styles.statusPending;
      case 1: return styles.statusActive;
      case 2: return styles.statusInTransit;
      case 3: return styles.statusReceived;
      case 4: return styles.statusCancelled;
      default: return styles.statusPending;
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return 'Pending Verification';
      case 1: return 'Active';
      case 2: return 'In Transit';
      case 3: return 'Received';
      case 4: return 'Cancelled';
      default: return 'Unknown';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Batches</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateBatch}
        >
          <Text style={styles.createButtonText}>+ Create Batch</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={batches}
        renderItem={renderBatchItem}
        keyExtractor={(item) => item.tokenId.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No batches created yet</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleCreateBatch}
            >
              <Text style={styles.emptyButtonText}>Create Your First Batch</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  batchItem: {
    backgroundColor: 'white',
    margin: 8,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  batchId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  productType: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  quantity: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  statusPending: {
    backgroundColor: '#ff9800',
  },
  statusActive: {
    backgroundColor: '#4caf50',
  },
  statusInTransit: {
    backgroundColor: '#2196f3',
  },
  statusReceived: {
    backgroundColor: '#9c27b0',
  },
  statusCancelled: {
    backgroundColor: '#f44336',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProducerDashboard;
```

## Configuration

### Environment Variables

```bash
# .env file
EXPO_PUBLIC_API_URL=https://api.borneotrace.com
EXPO_PUBLIC_RPC_URL=https://testnet-rpc.maschain.org
EXPO_PUBLIC_CHAIN_ID=1001
EXPO_PUBLIC_CONTRACT_ADDRESSES={"registry":"0x...","certificateNFT":"0x...","batchNFT":"0x..."}
EXPO_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

### App Configuration

```json
// app.json
{
  "expo": {
    "name": "BorneoTrace",
    "slug": "borneo-trace",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#2e7d32"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.borneotrace.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#2e7d32"
      },
      "package": "com.borneotrace.app",
      "permissions": [
        "CAMERA",
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow BorneoTrace to access your camera to scan QR codes for product verification."
        }
      ],
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow BorneoTrace to access your location for supply chain tracking."
        }
      ]
    ]
  }
}
```

## Build and Deployment

### Development Build

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Production Build

```bash
# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Submit to app stores
eas submit --platform android
eas submit --platform ios
```

## Features Implementation

### 1. Push Notifications

```typescript
// src/services/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  async registerForPushNotifications() {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push token:', token);

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  }

  async scheduleBatchAlert(batchId: string, message: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'BorneoTrace Alert',
        body: message,
        data: { batchId },
      },
      trigger: null,
    });
  }
}
```

### 2. Offline Support

```typescript
// src/services/offline.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export class OfflineService {
  private isOnline = true;
  private pendingActions: any[] = [];

  constructor() {
    this.setupNetworkListener();
  }

  private setupNetworkListener() {
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected ?? false;
      
      if (this.isOnline && this.pendingActions.length > 0) {
        this.processPendingActions();
      }
    });
  }

  async storeOffline(action: any) {
    this.pendingActions.push({
      ...action,
      timestamp: Date.now()
    });
    
    await AsyncStorage.setItem(
      'pendingActions',
      JSON.stringify(this.pendingActions)
    );
  }

  private async processPendingActions() {
    const actions = [...this.pendingActions];
    this.pendingActions = [];
    
    for (const action of actions) {
      try {
        await this.executeAction(action);
      } catch (error) {
        console.error('Failed to execute pending action:', error);
        this.pendingActions.push(action);
      }
    }
    
    await AsyncStorage.setItem(
      'pendingActions',
      JSON.stringify(this.pendingActions)
    );
  }

  private async executeAction(action: any) {
    // Execute the action based on type
    switch (action.type) {
      case 'CREATE_BATCH':
        // Execute batch creation
        break;
      case 'TRANSFER_BATCH':
        // Execute batch transfer
        break;
      // Add more action types as needed
    }
  }
}
```

## Testing

### Unit Tests

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage
```

### E2E Tests

```bash
# Run E2E tests with Detox
npm run e2e:ios
npm run e2e:android
```

## Security Considerations

1. **Private Key Management**: Store private keys securely using device keychain
2. **API Security**: Use HTTPS and proper authentication
3. **Data Encryption**: Encrypt sensitive data in local storage
4. **Certificate Pinning**: Implement certificate pinning for API calls
5. **Biometric Authentication**: Use device biometrics for sensitive operations

## Performance Optimization

1. **Image Optimization**: Compress and optimize images
2. **Lazy Loading**: Implement lazy loading for large lists
3. **Caching**: Cache frequently accessed data
4. **Bundle Splitting**: Split code bundles for faster loading
5. **Memory Management**: Properly dispose of resources

---

This mobile application provides a comprehensive solution for supply chain tracking and verification, with offline support, real-time notifications, and seamless blockchain integration.
