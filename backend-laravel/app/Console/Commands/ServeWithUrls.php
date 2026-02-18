<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ServeWithUrls extends Command
{
    protected $signature = 'serve:urls {--host=0.0.0.0 : The host address to serve on} {--port=8000 : The port to serve on}';
    protected $description = 'Start Laravel development server with URL display';

    public function handle()
    {
        $host = $this->option('host');
        $port = $this->option('port');

        $localIP = $this->getLocalIPAddress();

        $this->newLine();
        $this->info(str_repeat('━', 60));
        $this->line('  <fg=green>🚀 Laravel Development Server</>');
        $this->info(str_repeat('━', 60));
        $this->line("  <fg=blue>➜</> Local:   <fg=cyan>http://localhost:{$port}</>");

        if ($localIP !== 'localhost') {
            $this->line("  <fg=blue>➜</> Network: <fg=cyan>http://{$localIP}:{$port}</>");
        }

        $this->info(str_repeat('━', 60));
        $this->line('  <fg=yellow>Press Ctrl+C to stop</>');
        $this->info(str_repeat('━', 60));
        $this->newLine();

        // Start Laravel server
        $this->call('serve', [
            '--host' => $host,
            '--port' => $port,
        ]);
    }

    protected function getLocalIPAddress()
    {
        // Try to get IP address based on OS
        if (PHP_OS_FAMILY === 'Windows') {
            return $this->getWindowsIP();
        } else {
            return $this->getUnixIP();
        }
    }

    protected function getWindowsIP()
    {
        $output = shell_exec("ipconfig");

        if ($output && preg_match('/IPv4 Address[\s.]+:\s+([^\s]+)/', $output, $matches)) {
            return $matches[1];
        }

        return 'localhost';
    }

    protected function getUnixIP()
    {
        // Try hostname -I first (Linux)
        $output = shell_exec("hostname -I 2>/dev/null");
        if ($output && trim($output)) {
            $ips = explode(' ', trim($output));
            // Get first non-localhost IP
            foreach ($ips as $ip) {
                if ($ip !== '127.0.0.1' && filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
                    return $ip;
                }
            }
        }

        // Try ip route (Linux)
        $output = shell_exec("ip route get 1 2>/dev/null | awk '{print \$7; exit}'");
        if ($output && trim($output) && filter_var(trim($output), FILTER_VALIDATE_IP)) {
            return trim($output);
        }

        // Try ifconfig (Mac/Linux)
        $output = shell_exec("ifconfig 2>/dev/null | grep 'inet ' | grep -v '127.0.0.1' | awk '{print \$2}' | head -n 1");
        if ($output && trim($output)) {
            return trim($output);
        }

        return 'localhost';
    }
}
