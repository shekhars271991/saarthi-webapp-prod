# GitHub Actions Deployment Guide

This guide explains how to set up automated deployment to your AWS EC2 instance using GitHub Actions.

## Prerequisites

1. **AWS EC2 Instance** with Ubuntu/Amazon Linux
2. **GitHub Repository** with your code
3. **SSH Access** to your EC2 instance

## Setup Instructions

### 1. Prepare Your EC2 Instance

First, ensure your EC2 instance has the required software:

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install other dependencies
sudo apt-get install -y git curl wget
```

### 2. Create Production Environment File

Create a production environment file on your EC2 instance:

```bash
# Create production environment file
nano ~/.env.production
```

Add your production environment variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/saarthi?retryWrites=true&w=majority

# Fare Calculation
AIRPORT_BASE_FARE=300
AIRPORT_PER_KM_RATE=15
HOURLY_PER_HOUR_RATE=300
HOURLY_PER_KM_RATE=15
OUTSTATION_PER_KM_RATE=15
OUTSTATION_MULTIPLIER=2.0

# API Configuration
PORT=4000
NODE_ENV=production

# Frontend Configuration (if needed)
NEXT_PUBLIC_API_URL=http://your-ec2-ip:4000
NEXT_PUBLIC_MODE=prod
```

### 3. Configure GitHub Secrets

In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add these secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `AWS_HOST` | Your EC2 instance public IP | `3.15.123.456` |
| `AWS_USERNAME` | EC2 username | `ubuntu` (for Ubuntu) or `ec2-user` (for Amazon Linux) |
| `AWS_PRIVATE_KEY` | Your EC2 private key content | Copy entire content of your `.pem` file |
| `AWS_PORT` | SSH port (optional) | `22` (default) |

#### How to add AWS_PRIVATE_KEY:
1. Open your `.pem` file in a text editor
2. Copy the entire content including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`
3. Paste it as the value for `AWS_PRIVATE_KEY` secret

### 4. Configure EC2 Security Groups

Ensure your EC2 security group allows inbound traffic on:
- **Port 22**: SSH access
- **Port 3000**: Frontend application
- **Port 4000**: Backend API
- **Port 80**: HTTP (optional, for domain)
- **Port 443**: HTTPS (optional, for SSL)

### 5. Test Manual Deployment (Optional)

Before setting up GitHub Actions, test manual deployment:

```bash
# Clone your repository
git clone https://github.com/your-username/saarthi.git
cd saarthi

# Make deployment script executable
chmod +x deploy-github.sh

# Run deployment
./deploy-github.sh
```

### 6. Trigger Automated Deployment

The GitHub Actions workflow will automatically trigger when:
- Code is pushed directly to `master` or `main` branch
- A pull request is merged to `master` or `main` branch

## Workflow Overview

The deployment process includes:

1. **Code Checkout**: Gets the latest code from your repository
2. **Dependencies**: Installs Node.js and project dependencies
3. **Build**: Builds the frontend application
4. **Test**: Runs tests (if available)
5. **Archive**: Creates a deployment package
6. **Deploy**: Transfers files to EC2 and starts services
7. **Health Check**: Verifies services are running correctly

## Monitoring Deployment

### View GitHub Actions Logs
1. Go to your repository on GitHub
2. Click on **Actions** tab
3. Click on the latest workflow run
4. Expand the steps to view detailed logs

### Check Services on EC2
```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Check PM2 status
pm2 status

# View application logs
pm2 logs

# Check specific service logs
pm2 logs saarthi-backend
pm2 logs saarthi-webapp
```

### Access Your Application
- **Frontend**: `http://your-ec2-ip:3000`
- **Backend API**: `http://your-ec2-ip:4000`

## Troubleshooting

### Common Issues

1. **SSH Connection Failed**
   - Verify `AWS_HOST`, `AWS_USERNAME`, and `AWS_PRIVATE_KEY` secrets
   - Ensure EC2 security group allows SSH (port 22)

2. **Services Won't Start**
   - Check environment variables in `~/.env.production`
   - Verify MongoDB connection string
   - Check PM2 logs: `pm2 logs`

3. **Build Failures**
   - Check GitHub Actions logs for specific error messages
   - Ensure all dependencies are listed in `package.json`

4. **Port Conflicts**
   - Services might fail if ports 3000/4000 are in use
   - The deployment script attempts to kill existing processes

### Manual Commands

```bash
# Restart services
pm2 restart ecosystem.config.js

# Stop services
pm2 stop ecosystem.config.js

# View real-time logs
pm2 logs --lines 100

# Check system resources
htop
df -h

# Check network connections
netstat -tlnp | grep -E ':(3000|4000)'
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to your repository
2. **SSH Keys**: Keep your private keys secure and rotate them regularly
3. **Firewall**: Only open necessary ports in your security group
4. **Updates**: Keep your EC2 instance and dependencies updated
5. **SSL**: Consider setting up SSL certificates for production

## Advanced Configuration

### Custom Domain Setup
1. Point your domain to your EC2 instance IP
2. Set up Nginx as a reverse proxy
3. Configure SSL with Let's Encrypt

### Database Backup
Set up regular MongoDB Atlas backups or use automated backup scripts.

### Monitoring
Consider setting up monitoring tools like:
- CloudWatch for AWS metrics
- PM2 monitoring for application metrics
- Uptime monitoring services

## Support

If you encounter issues:
1. Check GitHub Actions logs first
2. SSH into your EC2 instance and check PM2 logs
3. Verify environment variables and configurations
4. Ensure all prerequisites are met

---

**Note**: This deployment setup is suitable for development and small-scale production environments. For high-traffic production applications, consider using load balancers, auto-scaling groups, and container orchestration platforms.
