#!/usr/bin/env python3
"""
Dev Server Restart Script
Automatically restarts the dev server whenever changes are detected
"""

import subprocess
import os
import signal
import time
import sys

WORKSPACE = '/workspaces/av-unitlist'
PID_FILE = '/tmp/vite-dev-server.pid'

def kill_existing_server():
    """Kill any existing dev server process"""
    try:
        # Try to read PID file
        if os.path.exists(PID_FILE):
            with open(PID_FILE, 'r') as f:
                pid = int(f.read().strip())
            try:
                os.kill(pid, signal.SIGTERM)
                time.sleep(2)
                print(f"🛑 Stopped existing server (PID: {pid})")
            except ProcessLookupError:
                pass
            os.remove(PID_FILE)
        
        # Also kill by port
        subprocess.run(
            ['pkill', '-f', 'vite'],
            stderr=subprocess.DEVNULL
        )
    except Exception as e:
        pass

def start_dev_server():
    """Start the dev server in background"""
    kill_existing_server()
    
    print("🚀 Starting dev server...")
    
    # Start in background
    process = subprocess.Popen(
        ['npm', 'run', 'dev'],
        cwd=WORKSPACE,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        preexec_fn=os.setpgrp
    )
    
    # Save PID
    with open(PID_FILE, 'w') as f:
        f.write(str(process.pid))
    
    print(f"✅ Dev server started (PID: {process.pid})")
    print(f"🔗 http://localhost:3000")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "stop":
        kill_existing_server()
        print("👋 Dev server stopped")
    else:
        start_dev_server()
