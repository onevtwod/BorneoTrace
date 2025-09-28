# IoT Integration for BorneoTrace

This module provides IoT sensor data integration for the BorneoTrace supply chain tracking system, enabling real-time monitoring of environmental conditions, location tracking, and quality metrics throughout the supply chain.

## Overview

The IoT integration system allows:
- Real-time temperature and humidity monitoring
- GPS location tracking
- Quality parameter monitoring
- Automated alerts and notifications
- Data validation and verification
- Integration with blockchain for immutable records

## Architecture

```
IoT Sensors → Data Collection → Edge Computing → Cloud Processing → Blockchain Integration
     ↓              ↓              ↓              ↓                    ↓
Temperature    Data Aggregation  Local Storage  Data Validation    Smart Contracts
Humidity       Signal Processing Data Filtering Quality Checks    Oracle Integration
GPS Location   Data Compression  Offline Sync   Alert Generation   Batch Updates
Quality        Encryption        Buffer Mgmt    Analytics         Status Changes
```

## Components

### 1. Sensor Types

#### Environmental Sensors
- **Temperature**: Monitor temperature throughout supply chain
- **Humidity**: Track humidity levels for product quality
- **Light**: Monitor light exposure for photosensitive products
- **Pressure**: Track atmospheric pressure changes

#### Location Sensors
- **GPS**: Real-time location tracking
- **Beacon**: Indoor positioning and proximity detection
- **RFID**: Product identification and tracking

#### Quality Sensors
- **pH**: Monitor acidity levels for food products
- **Gas**: Detect harmful gases or quality indicators
- **Vibration**: Monitor handling conditions
- **Weight**: Track product weight changes

### 2. Data Collection Layer

#### Edge Devices
- **Arduino/Raspberry Pi**: Low-cost sensor hubs
- **Industrial IoT Gateways**: Enterprise-grade data collection
- **Mobile Devices**: Smartphone-based sensor collection
- **Dedicated Sensors**: Purpose-built monitoring devices

#### Data Formats
```json
{
  "sensorId": "TEMP_001",
  "batchId": "BATCH_2025_001",
  "timestamp": "2025-01-01T10:00:00Z",
  "location": {
    "latitude": 5.9804,
    "longitude": 116.0735,
    "altitude": 10.5
  },
  "measurements": {
    "temperature": 22.5,
    "humidity": 65.2,
    "unit": "celsius"
  },
  "quality": {
    "signal_strength": 95,
    "battery_level": 87,
    "calibration_status": "valid"
  },
  "metadata": {
    "device_model": "TempHumidity_v2.1",
    "firmware_version": "1.3.2",
    "data_hash": "sha256:abc123..."
  }
}
```

### 3. Data Processing

#### Real-time Processing
- **Stream Processing**: Apache Kafka, Apache Pulsar
- **Edge Computing**: Local data processing and filtering
- **Cloud Processing**: AWS IoT, Azure IoT, Google Cloud IoT

#### Data Validation
- **Range Checking**: Ensure measurements are within expected ranges
- **Anomaly Detection**: Identify unusual patterns or outliers
- **Calibration Verification**: Validate sensor calibration status
- **Cross-validation**: Compare multiple sensor readings

#### Data Storage
- **Time Series Database**: InfluxDB, TimescaleDB
- **NoSQL Database**: MongoDB for flexible schema storage
- **Blockchain**: Immutable records for critical data points
- **Cloud Storage**: AWS S3, Azure Blob for large datasets

## Implementation

### 1. Hardware Requirements

#### Basic IoT Kit
- Arduino Uno/Nano or ESP32
- Temperature/Humidity sensor (DHT22)
- GPS module (NEO-6M)
- SD card module for data logging
- Battery pack and power management
- Enclosure for protection

#### Advanced IoT Kit
- Raspberry Pi 4
- Industrial-grade sensors
- Cellular modem for connectivity
- Solar panel for power
- Weather-resistant enclosure
- Real-time clock (RTC) module

### 2. Software Components

#### Firmware
```cpp
// Example Arduino code for temperature monitoring
#include <DHT.h>
#include <SoftwareSerial.h>
#include <SD.h>

#define DHT_PIN 2
#define DHT_TYPE DHT22
#define GPS_RX 3
#define GPS_TX 4

DHT dht(DHT_PIN, DHT_TYPE);
SoftwareSerial gps(GPS_RX, GPS_TX);

struct SensorData {
  float temperature;
  float humidity;
  float latitude;
  float longitude;
  unsigned long timestamp;
};

void setup() {
  Serial.begin(9600);
  dht.begin();
  gps.begin(9600);
  
  if (!SD.begin(10)) {
    Serial.println("SD card initialization failed");
  }
}

void loop() {
  SensorData data;
  
  // Read sensor data
  data.temperature = dht.readTemperature();
  data.humidity = dht.readHumidity();
  data.timestamp = millis();
  
  // Read GPS data
  while (gps.available()) {
    String gpsData = gps.readStringUntil('\n');
    if (gpsData.startsWith("$GPGGA")) {
      parseGPS(gpsData, &data);
    }
  }
  
  // Validate data
  if (isValidData(data)) {
    // Store to SD card
    logToSD(data);
    
    // Send to cloud if connected
    if (WiFi.status() == WL_CONNECTED) {
      sendToCloud(data);
    }
  }
  
  delay(60000); // Read every minute
}

bool isValidData(SensorData data) {
  return !isnan(data.temperature) && 
         !isnan(data.humidity) &&
         data.temperature >= -40 && 
         data.temperature <= 80 &&
         data.humidity >= 0 && 
         data.humidity <= 100;
}
```

#### Data Processing Service
```typescript
// Node.js service for processing IoT data
import { Kafka, Consumer, Producer } from 'kafkajs';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { ethers } from 'ethers';

interface IoTData {
  sensorId: string;
  batchId: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
  };
  measurements: Record<string, number>;
  quality: Record<string, any>;
}

class IoTDataProcessor {
  private kafka: Kafka;
  private consumer: Consumer;
  private producer: Producer;
  private influxDB: InfluxDB;
  private blockchainContract: ethers.Contract;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'iot-processor',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
    });
    
    this.consumer = this.kafka.consumer({ groupId: 'iot-data-group' });
    this.producer = this.kafka.producer();
    
    this.influxDB = new InfluxDB({
      url: process.env.INFLUXDB_URL || 'http://localhost:8086',
      token: process.env.INFLUXDB_TOKEN || ''
    });
  }

  async start() {
    await this.consumer.connect();
    await this.producer.connect();
    
    await this.consumer.subscribe({ topic: 'iot-sensor-data' });
    
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const data: IoTData = JSON.parse(message.value?.toString() || '{}');
        await this.processData(data);
      }
    });
  }

  private async processData(data: IoTData) {
    try {
      // Validate data
      if (!this.validateData(data)) {
        console.error('Invalid IoT data:', data);
        return;
      }

      // Store in time series database
      await this.storeInInfluxDB(data);

      // Check for alerts
      await this.checkAlerts(data);

      // Update blockchain if critical data
      if (this.isCriticalData(data)) {
        await this.updateBlockchain(data);
      }

      console.log(`Processed IoT data for batch ${data.batchId}`);
    } catch (error) {
      console.error('Error processing IoT data:', error);
    }
  }

  private validateData(data: IoTData): boolean {
    // Temperature range check
    if (data.measurements.temperature < -40 || data.measurements.temperature > 80) {
      return false;
    }

    // Humidity range check
    if (data.measurements.humidity < 0 || data.measurements.humidity > 100) {
      return false;
    }

    // GPS coordinates check
    if (data.location.latitude < -90 || data.location.latitude > 90 ||
        data.location.longitude < -180 || data.location.longitude > 180) {
      return false;
    }

    return true;
  }

  private async storeInInfluxDB(data: IoTData) {
    const writeApi = this.influxDB.getWriteApi(
      process.env.INFLUXDB_ORG || 'borneo-trace',
      process.env.INFLUXDB_BUCKET || 'iot-data'
    );

    const point = new Point('sensor_data')
      .tag('sensor_id', data.sensorId)
      .tag('batch_id', data.batchId)
      .timestamp(new Date(data.timestamp))
      .floatField('temperature', data.measurements.temperature)
      .floatField('humidity', data.measurements.humidity)
      .floatField('latitude', data.location.latitude)
      .floatField('longitude', data.location.longitude);

    writeApi.writePoint(point);
    await writeApi.close();
  }

  private async checkAlerts(data: IoTData) {
    // Temperature alert
    if (data.measurements.temperature > 30 || data.measurements.temperature < 2) {
      await this.sendAlert({
        type: 'TEMPERATURE_ALERT',
        batchId: data.batchId,
        message: `Temperature out of range: ${data.measurements.temperature}°C`,
        severity: 'HIGH'
      });
    }

    // Humidity alert
    if (data.measurements.humidity > 80 || data.measurements.humidity < 20) {
      await this.sendAlert({
        type: 'HUMIDITY_ALERT',
        batchId: data.batchId,
        message: `Humidity out of range: ${data.measurements.humidity}%`,
        severity: 'MEDIUM'
      });
    }
  }

  private isCriticalData(data: IoTData): boolean {
    // Critical if temperature is outside safe range
    return data.measurements.temperature > 30 || data.measurements.temperature < 2;
  }

  private async updateBlockchain(data: IoTData) {
    // Update batch status on blockchain with IoT data hash
    const dataHash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(JSON.stringify(data))
    );

    // This would interact with the smart contract
    // const tx = await this.blockchainContract.updateBatchWithIoTData(
    //   data.batchId,
    //   dataHash,
    //   data.timestamp
    // );
    
    console.log(`Updated blockchain with IoT data hash: ${dataHash}`);
  }

  private async sendAlert(alert: any) {
    await this.producer.send({
      topic: 'alerts',
      messages: [{
        value: JSON.stringify(alert)
      }]
    });
  }
}

export default IoTDataProcessor;
```

## Integration with BorneoTrace

### 1. Smart Contract Integration

#### Oracle Contract
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract IoTOracle {
    struct IoTData {
        string sensorId;
        string batchId;
        uint256 timestamp;
        int256 temperature;
        uint256 humidity;
        int256 latitude;
        int256 longitude;
        bytes32 dataHash;
    }

    mapping(bytes32 => IoTData) private iotData;
    mapping(string => bytes32[]) private batchIoTData;
    
    address public owner;
    mapping(address => bool) public authorizedOracles;

    event IoTDataUpdated(bytes32 indexed dataHash, string indexed batchId);
    event OracleAuthorized(address indexed oracle);
    event OracleRevoked(address indexed oracle);

    modifier onlyAuthorized() {
        require(authorizedOracles[msg.sender], "Not authorized oracle");
        _;
    }

    function updateIoTData(IoTData memory data) external onlyAuthorized {
        bytes32 dataHash = keccak256(abi.encode(data));
        iotData[dataHash] = data;
        batchIoTData[data.batchId].push(dataHash);
        
        emit IoTDataUpdated(dataHash, data.batchId);
    }

    function getBatchIoTData(string memory batchId) external view returns (bytes32[] memory) {
        return batchIoTData[batchId];
    }

    function getIoTData(bytes32 dataHash) external view returns (IoTData memory) {
        return iotData[dataHash];
    }
}
```

### 2. Frontend Integration

#### IoT Dashboard Component
```typescript
// React component for IoT data visualization
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from 'recharts';

interface IoTData {
  timestamp: string;
  temperature: number;
  humidity: number;
  latitude: number;
  longitude: number;
  sensorId: string;
}

const IoTDashboard: React.FC<{ batchId: string }> = ({ batchId }) => {
  const [iotData, setIoTData] = useState<IoTData[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchIoTData();
    const interval = setInterval(fetchIoTData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [batchId]);

  const fetchIoTData = async () => {
    try {
      const response = await fetch(`/api/iot/data/${batchId}`);
      const data = await response.json();
      setIoTData(data);
      
      // Check for alerts
      const currentAlerts = data.filter((d: IoTData) => 
        d.temperature > 30 || d.temperature < 2 || 
        d.humidity > 80 || d.humidity < 20
      );
      setAlerts(currentAlerts);
    } catch (error) {
      console.error('Failed to fetch IoT data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        IoT Monitoring - Batch {batchId}
      </Typography>

      {alerts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {alerts.length} alert(s) detected. Please check the monitoring data.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Temperature & Humidity Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={iotData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="temperature" stroke="#8884d8" />
                  <Line type="monotone" dataKey="humidity" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Conditions
              </Typography>
              {iotData.length > 0 && (
                <Box>
                  <Typography variant="body1">
                    Temperature: {iotData[iotData.length - 1].temperature}°C
                  </Typography>
                  <Typography variant="body1">
                    Humidity: {iotData[iotData.length - 1].humidity}%
                  </Typography>
                  <Typography variant="body1">
                    Last Update: {new Date(iotData[iotData.length - 1].timestamp).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Location Tracking
              </Typography>
              {iotData.length > 0 && (
                <MapContainer
                  center={[iotData[0].latitude, iotData[0].longitude]}
                  zoom={10}
                  style={{ height: '400px', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {iotData.map((data, index) => (
                    <Marker
                      key={index}
                      position={[data.latitude, data.longitude]}
                    >
                      <Popup>
                        <div>
                          <p>Time: {new Date(data.timestamp).toLocaleString()}</p>
                          <p>Temperature: {data.temperature}°C</p>
                          <p>Humidity: {data.humidity}%</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default IoTDashboard;
```

## Deployment and Configuration

### 1. Environment Setup

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Set up InfluxDB
docker run -d -p 8086:8086 influxdb:2.0

# Set up Kafka
docker run -d -p 9092:9092 apache/kafka:latest

# Start IoT data processor
npm run start:iot-processor
```

### 2. Hardware Deployment

1. **Sensor Installation**: Mount sensors in appropriate locations
2. **Power Setup**: Install battery packs or solar panels
3. **Connectivity**: Configure WiFi or cellular connectivity
4. **Calibration**: Calibrate sensors for accurate readings
5. **Testing**: Verify data transmission and processing

### 3. Monitoring and Maintenance

- **Regular Calibration**: Monthly sensor calibration
- **Battery Monitoring**: Check and replace batteries as needed
- **Data Validation**: Monitor data quality and accuracy
- **Alert Management**: Configure and test alert systems
- **Performance Monitoring**: Track system performance and uptime

## Future Enhancements

1. **Machine Learning**: Predictive analytics for quality issues
2. **Edge AI**: Local processing for real-time decision making
3. **5G Integration**: High-speed connectivity for real-time data
4. **Blockchain Oracles**: Decentralized IoT data verification
5. **Mobile App**: Smartphone-based sensor integration
6. **Voice Alerts**: Audio notifications for critical events

---

This IoT integration system provides comprehensive monitoring capabilities for the BorneoTrace supply chain, ensuring product quality and traceability through real-time environmental and location tracking.
