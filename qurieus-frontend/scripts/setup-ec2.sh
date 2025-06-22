#!/bin/bash

# EC2 Setup Script for Qurieus Monorepo CI/CD Pipeline
# This script should be run on your EC2 instances to prepare them for deployment

set -e

echo "🚀 Setting up EC2 instance for Qurieus monorepo deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ubuntu
    echo "✅ Docker installed successfully"
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose
echo "📦 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed successfully"
else
    echo "✅ Docker Compose already installed"
fi

# Install curl for health checks
echo "📦 Installing curl..."
sudo apt install -y curl

# Create deployment directories for all applications
echo "📁 Creating deployment directories..."
mkdir -p /home/ubuntu/staging/qurieus-frontend
mkdir -p /home/ubuntu/staging/qurieus-backend
mkdir -p /home/ubuntu/staging/qurieus-bot-teams
mkdir -p /home/ubuntu/prod/qurieus-frontend
mkdir -p /home/ubuntu/prod/qurieus-backend
mkdir -p /home/ubuntu/prod/qurieus-bot-teams

# Set proper permissions
sudo chown -R ubuntu:ubuntu /home/ubuntu/staging
sudo chown -R ubuntu:ubuntu /home/ubuntu/prod

echo "✅ EC2 setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Copy docker-compose.yml files to the deployment directories:"
echo "   - Frontend: /home/ubuntu/{staging,prod}/qurieus-frontend/"
echo "   - Backend: /home/ubuntu/{staging,prod}/qurieus-backend/"
echo "   - MSTeamsBot: /home/ubuntu/{staging,prod}/qurieus-bot-teams/"
echo "2. Create .env files with your environment variables"
echo "3. Configure GitHub Actions secrets"
echo "4. Test the deployment pipeline"
echo ""
echo "🔧 Useful commands:"
echo "  - Check Docker status: sudo systemctl status docker"
echo "  - View running containers: docker ps"
echo "  - View container logs: docker logs <container-name>"
echo "  - Restart Docker: sudo systemctl restart docker"
echo ""
echo "🌐 Application ports:"
echo "  - Frontend: 8000"
echo "  - Backend: 8001"
echo "  - MSTeamsBot: 3978" 