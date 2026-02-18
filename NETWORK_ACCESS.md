# Development Server Network Access

This guide shows how to access your development servers from any device on your local network.

## Frontend (React/Vite)

### Start the development server:
```bash
cd frontend-web
npm run dev
```

### Expected Output:
```
  VITE v7.3.1  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://10.10.184.147:5173/
  ➜  Network: http://192.168.1.100:5173/
  ➜  press h + enter to show help
```

The server will now be accessible from:
- **Your computer**: `http://localhost:5173`
- **Other devices on your network**: `http://YOUR_IP:5173`

### Show Network Info Only:
```bash
npm run network
```

## Backend (Laravel)

### Option 1: Using the helper script (Recommended):
```bash
cd backend-laravel
./serve.sh
```

This will show:
```
🚀 Laravel Dev Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ➜ Local:   http://localhost:8000
  ➜ Network: http://10.10.184.147:8000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Press Ctrl+C to stop
```

### Option 2: Custom port:
```bash
cd backend-laravel
./serve.sh 8080
```

### Option 3: Standard artisan serve with network access:
```bash
cd backend-laravel
php artisan serve --host=0.0.0.0 --port=8000
```

## Features

### Auto-reload on file changes:
- **Frontend**: Vite HMR (Hot Module Replacement) automatically reloads when you save files
- **Backend**: Use the helper script or manually restart the server

### Access from mobile device:
1. Make sure your mobile device is on the same WiFi network
2. Use the Network URL shown in the terminal
3. Example: `http://10.10.184.147:5173`

### Firewall Configuration:
If you can't access from other devices, you may need to allow the ports:

**Linux:**
```bash
sudo ufw allow 5173/tcp  # Frontend
sudo ufw allow 8000/tcp  # Backend
```

**Windows:**
Allow the ports in Windows Firewall settings

**Mac:**
Check System Preferences > Security & Privacy > Firewall

## Network Configuration

### Frontend (vite.config.js):
```javascript
server: {
  host: '0.0.0.0',       // Listen on all network interfaces
  port: 5173,             // Default port
  strictPort: false,      // Allow fallback if port is busy
  open: false,            // Don't auto-open browser
}
```

### Backend:
The `serve.sh` script automatically configures Laravel to listen on all network interfaces.

## Troubleshooting

### Can't access from other devices:
1. Check if devices are on the same network
2. Verify firewall settings
3. Try pinging your computer's IP from the other device
4. Ensure the dev server is running with `host: 0.0.0.0`

### "Port already in use" error:
- Frontend: Vite will automatically try the next available port
- Backend: Specify a different port: `./serve.sh 8001`

### Can't find network IP:
Run: `ip addr show` (Linux) or `ipconfig` (Windows) or `ifconfig` (Mac)

## Production Note

⚠️ **These configurations are for DEVELOPMENT ONLY!**
Never use `host: 0.0.0.0` or expose development servers in production.
