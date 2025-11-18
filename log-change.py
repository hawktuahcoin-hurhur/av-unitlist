#!/usr/bin/env python3
"""
Copilot Integration Script
Automatically logs changes made during the conversation and updates patch notes
"""

import sys
import json
import os
from datetime import datetime

WORKSPACE = '/workspaces/av-unitlist'
SESSION_FILE = os.path.join(WORKSPACE, '.copilot-session.json')

def log_change(user_prompt, implementation_summary, files_changed):
    """Log a change to the session file"""
    
    # Load or create session
    if os.path.exists(SESSION_FILE):
        with open(SESSION_FILE, 'r') as f:
            session = json.load(f)
    else:
        session = {
            "sessionStart": datetime.now().isoformat(),
            "currentVersion": "0.1",
            "pendingChanges": [],
            "implementedChanges": []
        }
    
    # Add new change (store files internally but don't display them in patch notes)
    change = {
        "prompt": user_prompt,
        "implementation": implementation_summary,
        "files": files_changed if isinstance(files_changed, list) else [files_changed],
        "timestamp": datetime.now().isoformat()
    }
    
    session['implementedChanges'].append(change)
    
    # Save session
    with open(SESSION_FILE, 'w') as f:
        json.dump(session, f, indent=2)
    
    print(f"✅ Logged: {implementation_summary}")
    
    # Auto-generate patch notes if we have enough changes
    if len(session['implementedChanges']) >= 1:
        os.system(f'cd {WORKSPACE} && python3 auto-patch.py generate')
    
    # Auto-restart dev server (don't log this action itself)
    print("🔄 Restarting dev server...")
    os.system(f'cd {WORKSPACE} && python3 restart-dev.py')

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python3 log-change.py '<user_prompt>' '<implementation>' '<files>'")
        print("Example: python3 log-change.py 'Add trait system' 'Added 7 trait dropdown' 'src/components/TierListApp.jsx'")
        sys.exit(1)
    
    user_prompt = sys.argv[1]
    implementation = sys.argv[2]
    files = sys.argv[3].split(',') if ',' in sys.argv[3] else [sys.argv[3]]
    
    log_change(user_prompt, implementation, files)
