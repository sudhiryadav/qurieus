# Nginx Configuration for AWS Server

This directory contains the Nginx configuration files for the Qurieus application running on AWS.

## Configuration Files

### 1. Main Configuration (`nginx.conf`)
The main Nginx configuration file includes:
- Basic server settings
- SSL/TLS configuration
- Logging settings
- Gzip compression
- Virtual host configurations

### 2. Site Configuration (`sites-available/qurieus`)
The site-specific configuration for Qurieus includes:
- SSL certificate configuration (using Let's Encrypt)
- Domain configuration (qurieus.com and www.qurieus.com)
- API proxy settings
- Frontend proxy settings
- File upload size limits

## Key Features

### SSL/TLS Configuration
- Automatic HTTP to HTTPS redirection
- SSL certificates managed by Certbot
- Modern SSL protocols (TLSv1.2 and TLSv1.3)

### API Proxy Settings
- Proxies `/api/v1/` requests to the FastAPI backend (port 8001)
- Configured with WebSocket support
- Increased timeouts for file uploads
- Proper header forwarding

### Frontend Proxy
- Serves the Next.js frontend (port 8000)
- Supports WebSocket connections
- Handles client-side routing

### File Upload Settings
- Maximum file size: 60MB
- Increased proxy timeouts for large file uploads
- Proper handling of multipart/form-data

## Installation and Setup

1. Install Nginx:
```bash
sudo apt update
sudo apt install nginx
```

2. Install SSL certificates using Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d qurieus.com -d www.qurieus.com
```

3. Copy configuration files:
```bash
sudo cp nginx.conf /etc/nginx/nginx.conf
sudo cp sites-available/qurieus /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/qurieus /etc/nginx/sites-enabled/
```

4. Test and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Maintenance

### Logs
- Error logs: `/var/log/nginx/qurieus_error.log`
- Access logs: `/var/log/nginx/qurieus_access.log`

### SSL Certificate Renewal
Certbot automatically sets up a renewal cron job. To manually renew:
```bash
sudo certbot renew --dry-run
```

### Troubleshooting
1. Check Nginx status:
```bash
sudo systemctl status nginx
```

2. Test configuration:
```bash
sudo nginx -t
```

3. View error logs:
```bash
sudo tail -f /var/log/nginx/qurieus_error.log
```

## Security Considerations

1. SSL/TLS Configuration
   - Uses modern SSL protocols
   - Automatic HTTP to HTTPS redirection
   - Secure certificate storage

2. File Upload Security
   - Size limits enforced
   - Proper timeout settings
   - Secure file handling

3. Proxy Security
   - Proper header forwarding
   - WebSocket security
   - CORS configuration

## Performance Tuning

1. Worker Processes
   - Automatically set based on CPU cores
   - Optimized for AWS EC2 instances

2. Caching
   - Static file caching
   - Proxy caching for API responses

3. Compression
   - Gzip enabled for text-based content
   - Optimized compression settings

## Monitoring

1. Log Monitoring
   - Regular log rotation
   - Error log monitoring
   - Access log analysis

2. SSL Certificate Monitoring
   - Automatic renewal checks
   - Certificate expiration monitoring

3. Performance Monitoring
   - Response time tracking
   - Error rate monitoring
   - Resource usage tracking 