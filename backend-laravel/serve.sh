#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get network IP (works on Linux/Mac)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    NETWORK_IP=$(hostname -I | awk '{print $1}')
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # Mac OSX
    NETWORK_IP=$(ipconfig getifaddr en0)
else
    # Fallback
    NETWORK_IP=$(hostname -i 2>/dev/null | awk '{print $1}')
fi

# Default values
PORT=${1:-8000}
HOST=${2:-0.0.0.0}

echo ""
echo -e "${GREEN}🚀 Laravel Dev Server${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  ${BLUE}➜${NC} Local:   http://localhost:${PORT}"
if [ ! -z "$NETWORK_IP" ]; then
    echo -e "  ${BLUE}➜${NC} Network: http://${NETWORK_IP}:${PORT}"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  ${YELLOW}Press Ctrl+C to stop${NC}"
echo ""

# Start Laravel development server
php artisan serve --host=${HOST} --port=${PORT}
