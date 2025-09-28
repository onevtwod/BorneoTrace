# BorneoTrace CI/CD Pipeline Setup Guide

This guide provides comprehensive instructions for setting up and configuring the CI/CD pipeline for the BorneoTrace project.

## 🏗️ Architecture Overview

The CI/CD pipeline consists of multiple workflows:

1. **Smart Contracts** (`smart-contracts.yml`) - Contract testing, security audits, and deployment
2. **Frontend** (`frontend.yml`) - Frontend testing, building, and deployment
3. **Backend API** (`backend.yml`) - Backend testing, building, and deployment
4. **Mobile App** (`mobile.yml`) - Mobile app testing, building, and deployment
5. **Security** (`security.yml`) - Comprehensive security scanning and compliance checks
6. **Monitoring** (`monitoring.yml`) - Health checks and performance monitoring

## 🔧 Prerequisites

### Required Tools
- GitHub repository with Actions enabled
- Docker and Docker Compose
- Node.js 18+
- Access to deployment platforms (Vercel, AWS, etc.)

### Required Accounts
- GitHub (for CI/CD)
- Vercel (for frontend deployment)
- AWS (for backend deployment)
- Google Play Console (for Android)
- Apple App Store Connect (for iOS)
- Polygon/Mumbai testnet access

## 🔐 Environment Variables Setup

### GitHub Secrets Configuration

Navigate to your GitHub repository → Settings → Secrets and variables → Actions

#### Required Secrets:

```bash
# Smart Contract Deployment
MUMBAI_PRIVATE_KEY=your_mumbai_private_key
POLYGON_PRIVATE_KEY=your_polygon_private_key
POLYGON_MUMBAI_RPC=https://rpc-mumbai.maticvigil.com
POLYGON_MAINNET_RPC=https://polygon-rpc.com
POLYGONSCAN_API_KEY=your_polygonscan_api_key
MYTHX_API_KEY=your_mythx_api_key

# Frontend Deployment
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id

# Backend Deployment
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
DATABASE_URL=your_database_connection_string

# Mobile App Deployment
APPLE_ID=your_apple_id
APPLE_ID_PASSWORD=your_apple_id_password
APP_STORE_CONNECT_API_KEY=your_app_store_connect_api_key
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=your_google_play_service_account_json
IOS_SIGNING_IDENTITY=your_ios_signing_identity
IOS_PROVISIONING_PROFILE=your_ios_provisioning_profile
ANDROID_KEYSTORE_PASSWORD=your_android_keystore_password
ANDROID_KEY_ALIAS=your_android_key_alias
ANDROID_KEY_PASSWORD=your_android_key_password

# Security and Monitoring
SNYK_TOKEN=your_snyk_token
SONAR_TOKEN=your_sonar_token
SLACK_WEBHOOK=your_slack_webhook_url
LHCI_SERVER_URL=your_lighthouse_ci_server_url
LHCI_TOKEN=your_lighthouse_ci_token
LHCI_GITHUB_APP_TOKEN=your_lighthouse_ci_github_app_token

# Contract Addresses (Updated after deployment)
REGISTRY_CONTRACT_ADDRESS=deployed_registry_address
CERTIFICATE_NFT_ADDRESS=deployed_certificate_nft_address
BATCH_NFT_ADDRESS=deployed_batch_nft_address
```

## 🚀 Deployment Environments

### Environment Configuration

The pipeline supports multiple environments:

1. **Development** - Local development with Docker Compose
2. **Staging** - Pre-production testing environment
3. **Production** - Live production environment

### Environment-Specific Settings

#### Staging Environment
- **Frontend**: `https://borneotrace-staging.vercel.app`
- **Backend**: `https://api-staging.borneotrace.com`
- **Blockchain**: Mumbai testnet
- **Database**: Staging PostgreSQL instance

#### Production Environment
- **Frontend**: `https://borneotrace.vercel.app`
- **Backend**: `https://api.borneotrace.com`
- **Blockchain**: Polygon mainnet
- **Database**: Production PostgreSQL instance

## 📋 Workflow Triggers

### Automatic Triggers
- **Push to `main`**: Triggers production deployment
- **Push to `develop`**: Triggers staging deployment
- **Pull Request**: Triggers testing and validation
- **Schedule**: Weekly security scans and monitoring

### Manual Triggers
- **Workflow Dispatch**: Manual deployment to specific environments
- **Repository Dispatch**: External triggers for health checks

## 🔄 Deployment Process

### Smart Contracts Deployment

1. **Testing Phase**
   ```bash
   npm run test
   npm run test:coverage
   npm run test:gas
   ```

2. **Security Audit**
   ```bash
   # Slither analysis
   slither contracts/
   
   # MythX analysis
   mythx analyze contracts/
   ```

3. **Deployment**
   ```bash
   # Mumbai testnet
   npm run deploy:mumbai
   npm run verify:mumbai
   
   # Polygon mainnet
   npm run deploy:polygon
   npm run verify:polygon
   ```

### Frontend Deployment

1. **Build and Test**
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   # Staging
   vercel --prod=false
   
   # Production
   vercel --prod=true
   ```

### Backend Deployment

1. **Build and Test**
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

2. **Docker Build and Push**
   ```bash
   docker build -t borneotrace-backend .
   docker push your-registry/borneotrace-backend
   ```

3. **Deploy to AWS ECS**
   ```bash
   aws ecs update-service --cluster borneotrace-production --service borneotrace-backend
   ```

## 🔍 Monitoring and Health Checks

### Health Check Endpoints

- **Frontend**: `GET /health`
- **Backend**: `GET /health`
- **Database**: Connection test
- **Blockchain**: Network connectivity test

### Monitoring Stack

- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization
- **Lighthouse CI**: Performance monitoring
- **Snyk**: Security monitoring

### Alerting

- **Slack**: Real-time notifications
- **Email**: Critical alerts
- **PagerDuty**: On-call notifications

## 🛡️ Security Measures

### Automated Security Checks

1. **Dependency Scanning**
   - npm audit
   - Snyk vulnerability scanning
   - Dependabot automated updates

2. **Code Quality**
   - ESLint security rules
   - SonarCloud analysis
   - CodeQL analysis

3. **Smart Contract Security**
   - Slither static analysis
   - MythX security analysis
   - Echidna fuzzing

4. **Infrastructure Security**
   - Trivy vulnerability scanning
   - Docker image scanning
   - Compliance checks

## 📊 Performance Monitoring

### Key Metrics

- **Frontend Performance**
  - Lighthouse scores
  - Core Web Vitals
  - Bundle size analysis

- **Backend Performance**
  - API response times
  - Database query performance
  - Memory and CPU usage

- **Blockchain Performance**
  - Transaction confirmation times
  - Gas usage optimization
  - Network congestion monitoring

## 🔧 Local Development Setup

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services Included

- **Hardhat Node**: Local blockchain
- **PostgreSQL**: Database
- **Redis**: Caching
- **Backend API**: Express.js server
- **Frontend**: React development server
- **IPFS**: Decentralized storage
- **Monitoring**: Prometheus + Grafana

## 🚨 Troubleshooting

### Common Issues

1. **Deployment Failures**
   - Check environment variables
   - Verify network connectivity
   - Review deployment logs

2. **Test Failures**
   - Update test data
   - Check environment configuration
   - Review test coverage

3. **Security Scan Failures**
   - Update vulnerable dependencies
   - Fix security issues
   - Review security policies

### Debug Commands

```bash
# Check workflow status
gh run list

# View workflow logs
gh run view <run-id>

# Rerun failed workflow
gh run rerun <run-id>

# Cancel running workflow
gh run cancel <run-id>
```

## 📚 Additional Resources

### Documentation Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [AWS ECS Deployment Guide](https://docs.aws.amazon.com/ecs/)
- [Polygon Documentation](https://docs.polygon.technology/)

### Support Channels

- **GitHub Issues**: Bug reports and feature requests
- **Slack**: Real-time team communication
- **Email**: Security and critical issues

## 🎯 Best Practices

### Development

1. **Branch Strategy**
   - Use feature branches for new features
   - Keep `main` branch stable
   - Use `develop` for integration testing

2. **Commit Messages**
   - Use conventional commit format
   - Include issue references
   - Keep messages descriptive

3. **Code Review**
   - Require reviews for all changes
   - Test changes locally before pushing
   - Ensure all checks pass

### Deployment

1. **Environment Promotion**
   - Deploy to staging first
   - Run comprehensive tests
   - Monitor before production deployment

2. **Rollback Strategy**
   - Keep previous versions available
   - Test rollback procedures
   - Monitor post-deployment

3. **Security**
   - Regular security audits
   - Keep dependencies updated
   - Monitor for vulnerabilities

---

**Pipeline Status**: ✅ Fully Configured  
**Last Updated**: January 2025  
**Version**: 1.0  

The CI/CD pipeline is now ready for automated testing, deployment, and monitoring of the BorneoTrace project.
