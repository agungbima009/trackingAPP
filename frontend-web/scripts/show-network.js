import { networkInterfaces } from 'os';

/**
 * Get local network IP address
 */
function getNetworkAddress() {
  const nets = networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal (localhost) and non-IPv4 addresses
      const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
      if (net.family === familyV4Value && !net.internal) {
        results.push({
          name: name,
          address: net.address
        });
      }
    }
  }

  return results;
}

/**
 * Display server information
 */
export function displayServerInfo(port = 5173) {
  console.log('\n');
  console.log('🚀 Dev Server Started');
  console.log('─'.repeat(50));
  console.log(`  ➜ Local:   http://localhost:${port}`);
  
  const networkAddresses = getNetworkAddress();
  if (networkAddresses.length > 0) {
    networkAddresses.forEach(({ name, address }) => {
      console.log(`  ➜ Network: http://${address}:${port} (${name})`);
    });
  } else {
    console.log(`  ➜ Network: No network address found`);
  }
  
  console.log('─'.repeat(50));
  console.log('  Press Ctrl+C to stop');
  console.log('\n');
}

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  displayServerInfo();
}
