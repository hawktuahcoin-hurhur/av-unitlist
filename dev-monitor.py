#!/usr/bin/env python3
"""
Dev Server Auto-Monitor
Automatically starts and monitors the Vite dev server
Restarts if server becomes inaccessible
"""

import subprocess
import requests
import time
import sys
import os
import signal
from datetime import datetime

WORKSPACE = '/workspaces/av-unitlist'
DEV_URL = 'http://localhost:3000'
CHECK_INTERVAL = 5  # seconds
MAX_RETRIES = 3
STARTUP_WAIT = 10  # seconds to wait for initial startup

class DevServerMonitor:
    def __init__(self):
        self.process = None
        self.restart_count = 0
        self.running = True
        
    def log(self, message):
        """Print timestamped log message"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")
        
    def check_server(self):
        """Check if dev server is accessible"""
        try:
            response = requests.get(DEV_URL, timeout=3)
            return response.status_code == 200
        except requests.exceptions.RequestException:
            return False
    
    def start_server(self):
        """Start the Vite dev server"""
        self.log("🚀 Starting dev server...")
        
        try:
            # Kill any existing process on port 3000
            subprocess.run(
                ['lsof', '-ti:3000'],
                capture_output=True,
                text=True
            )
            
            self.process = subprocess.Popen(
                ['npm', 'run', 'dev'],
                cwd=WORKSPACE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                preexec_fn=os.setsid  # Create new process group
            )
            
            # Wait for server to start
            self.log(f"⏳ Waiting {STARTUP_WAIT}s for server to start...")
            time.sleep(STARTUP_WAIT)
            
            if self.check_server():
                self.log(f"✅ Dev server running at {DEV_URL}")
                self.restart_count += 1
                
                # Auto-open in browser (only on first start)
                if self.restart_count == 1:
                    try:
                        subprocess.run(['$BROWSER', DEV_URL], check=False)
                        self.log("🌐 Opened in browser")
                    except:
                        self.log("💡 Server ready - open http://localhost:3000 in your browser")
                
                return True
            else:
                self.log("⚠️  Server started but not accessible yet...")
                return False
                
        except Exception as e:
            self.log(f"❌ Error starting server: {e}")
            return False
    
    def stop_server(self):
        """Stop the dev server"""
        if self.process:
            self.log("🛑 Stopping dev server...")
            try:
                # Kill process group to ensure all child processes are killed
                os.killpg(os.getpgid(self.process.pid), signal.SIGTERM)
                self.process.wait(timeout=5)
            except Exception as e:
                self.log(f"⚠️  Error stopping server: {e}")
                try:
                    os.killpg(os.getpgid(self.process.pid), signal.SIGKILL)
                except:
                    pass
            
            self.process = None
    
    def monitor(self):
        """Main monitoring loop"""
        self.log("👀 Dev Server Auto-Monitor starting...")
        self.log(f"📍 Workspace: {WORKSPACE}")
        self.log(f"🔗 URL: {DEV_URL}")
        self.log(f"⏱️  Check interval: {CHECK_INTERVAL}s")
        print()
        
        # Initial start
        if not self.start_server():
            self.log("❌ Failed to start server initially")
            return
        
        consecutive_failures = 0
        
        try:
            while self.running:
                time.sleep(CHECK_INTERVAL)
                
                if self.check_server():
                    consecutive_failures = 0
                    # Silent when healthy
                else:
                    consecutive_failures += 1
                    self.log(f"⚠️  Server not accessible (attempt {consecutive_failures}/{MAX_RETRIES})")
                    
                    if consecutive_failures >= MAX_RETRIES:
                        self.log("🔄 Server unresponsive - restarting...")
                        self.stop_server()
                        time.sleep(2)
                        
                        if self.start_server():
                            consecutive_failures = 0
                        else:
                            self.log("❌ Failed to restart server")
                            if self.restart_count > 5:
                                self.log("❌ Too many restart failures - giving up")
                                break
                
        except KeyboardInterrupt:
            self.log("\n⌨️  Keyboard interrupt received")
        finally:
            self.stop_server()
            self.log("👋 Monitor stopped")
    
    def signal_handler(self, signum, frame):
        """Handle termination signals"""
        self.running = False

if __name__ == "__main__":
    monitor = DevServerMonitor()
    
    # Register signal handlers
    signal.signal(signal.SIGINT, monitor.signal_handler)
    signal.signal(signal.SIGTERM, monitor.signal_handler)
    
    monitor.monitor()
