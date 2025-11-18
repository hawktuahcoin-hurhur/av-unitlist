#!/usr/bin/env python3
"""
Auto-Patch Notes Generator
Monitors conversation context and git changes to automatically generate patch notes
Detects reverts and removes corresponding patch entries
"""

import os
import json
import subprocess
import re
from datetime import datetime
from pathlib import Path

WORKSPACE = '/workspaces/av-unitlist'
SESSION_FILE = os.path.join(WORKSPACE, '.copilot-session.json')
PATCH_FILE = os.path.join(WORKSPACE, 'src/patchNotes.js')

def load_session():
    """Load current session data"""
    try:
        with open(SESSION_FILE, 'r') as f:
            return json.load(f)
    except:
        return {
            "sessionStart": datetime.now().isoformat(),
            "currentVersion": "0.1",
            "pendingChanges": [],
            "implementedChanges": []
        }

def save_session(session):
    """Save session data"""
    with open(SESSION_FILE, 'w') as f:
        json.dump(session, f, indent=2)

def get_git_diff_summary():
    """Get summary of changes from git"""
    try:
        result = subprocess.run(
            ['git', 'diff', '--stat', 'HEAD'],
            capture_output=True,
            text=True,
            cwd=WORKSPACE
        )
        return result.stdout
    except:
        return ""

def get_changed_files():
    """Get list of changed files"""
    try:
        result = subprocess.run(
            ['git', 'diff', '--name-only', 'HEAD'],
            capture_output=True,
            text=True,
            cwd=WORKSPACE
        )
        return [f for f in result.stdout.strip().split('\n') if f]
    except:
        return []

def detect_revert(changed_files, session):
    """Detect if changes have been reverted"""
    reverted_changes = []
    
    for change in session['implementedChanges']:
        # Check if files associated with this change have been modified back
        change_files = set(change.get('files', []))
        current_changed = set(changed_files)
        
        # If the change files overlap with current changes, check git log
        if change_files.intersection(current_changed):
            try:
                # Check if recent commits mention "revert" or "undo"
                result = subprocess.run(
                    ['git', 'log', '--oneline', '-5'],
                    capture_output=True,
                    text=True,
                    cwd=WORKSPACE
                )
                if any(keyword in result.stdout.lower() for keyword in ['revert', 'undo', 'remove']):
                    reverted_changes.append(change)
            except:
                pass
    
    return reverted_changes

def calculate_version_increment(change_count):
    """Calculate version increment"""
    if change_count <= 3:
        return 0.01
    elif change_count <= 6:
        return 0.1
    else:
        return 1.0

def parse_patch_notes():
    """Parse existing patch notes"""
    try:
        with open(PATCH_FILE, 'r') as f:
            content = f.read()
        
        patches = []
        # Extract patch entries using regex
        pattern = r'\{[^}]*version:\s*"([^"]*)"[^}]*name:\s*"([^"]*)"[^}]*date:\s*"([^"]*)"[^}]*changes:\s*\[(.*?)\]\s*\}'
        matches = re.finditer(pattern, content, re.DOTALL)
        
        for match in matches:
            version, name, date, changes_str = match.groups()
            # Extract individual changes
            changes = re.findall(r'"([^"]*)"', changes_str)
            patches.append({
                'version': version,
                'name': name,
                'date': date,
                'changes': changes
            })
        
        return patches
    except:
        return []

def generate_patch_name(changes):
    """Generate a descriptive patch name from changes"""
    if len(changes) == 1:
        # Single feature
        if 'fix' in changes[0].lower() or 'bug' in changes[0].lower():
            return "Bug Fix"
        elif 'add' in changes[0].lower():
            return "Feature Addition"
        elif 'update' in changes[0].lower():
            return "Update"
        else:
            return "Enhancement"
    elif any('fix' in c.lower() or 'bug' in c.lower() for c in changes):
        return "Bug Fixes & Improvements"
    else:
        return "Feature Update"

def summarize_change(prompt, implementation):
    """Create a concise change summary without file/folder references"""
    import re
    
    # Remove file paths and folder references
    # Remove common file patterns like .jsx, .js, .css, .json, etc.
    implementation = re.sub(r'\b\w+\.(jsx|js|tsx|ts|css|json|py|html|md)\b', '', implementation)
    
    # Remove folder paths like src/, Images/, components/, etc.
    implementation = re.sub(r'\b[\w-]+/[\w/.-]*', '', implementation)
    
    # Remove parenthetical file references like (src/file.jsx)
    implementation = re.sub(r'\([^)]*\.(jsx|js|tsx|ts|css|json|py|html|md)[^)]*\)', '', implementation)
    
    # Remove specific folder mentions
    implementation = re.sub(r'\b(Images|src|components|Units|Familiar icons|backgrounds|bgs)/', '', implementation)
    
    # Clean up extra spaces
    implementation = re.sub(r'\s+', ' ', implementation).strip()
    
    # Extract key action words
    action_words = ['add', 'update', 'fix', 'remove', 'create', 'implement', 'change']
    
    for word in action_words:
        if word in prompt.lower():
            # Capitalize first letter
            return f"{word.capitalize()}d: {implementation}"
    
    return implementation

def write_patch_notes(patches):
    """Write patches back to file"""
    content = """// Patch Notes - Auto-updated changelog
// Format: {name} v{version} - {date}
// Version increments: +0.01 (1-3 changes), +0.1 (4-6 changes), +1.0 (7+ changes)

export const patchNotes = [
"""
    
    for patch in patches:
        changes_str = ',\n      '.join([f'"{c}"' for c in patch['changes']])
        content += f'''  {{
    version: "{patch['version']}",
    name: "{patch['name']}",
    date: "{patch['date']}",
    changes: [
      {changes_str}
    ]
  }},
'''
    
    content += "];\n"
    
    with open(PATCH_FILE, 'w') as f:
        f.write(content)

def auto_generate_patch():
    """Main function to auto-generate patch notes"""
    session = load_session()
    changed_files = get_changed_files()
    
    # Check for reverts
    reverted = detect_revert(changed_files, session)
    if reverted:
        print(f"🔄 Detected {len(reverted)} reverted changes")
        patches = parse_patch_notes()
        
        # Remove patches that correspond to reverted changes
        for rev in reverted:
            impl_text = rev.get('implementation', '')
            patches = [p for p in patches if impl_text not in ' '.join(p['changes'])]
            
            # Remove from session
            session['implementedChanges'] = [
                c for c in session['implementedChanges'] 
                if c.get('implementation') != impl_text
            ]
        
        write_patch_notes(patches)
        save_session(session)
        print(f"✅ Removed {len(reverted)} reverted patch entries")
        return
    
    # Generate new patch from NEW implemented changes only
    if session['implementedChanges']:
        # Get only changes since last patch generation
        last_processed_count = session.get('lastProcessedCount', 0)
        new_changes_only = session['implementedChanges'][last_processed_count:]
        
        if not new_changes_only:
            print("ℹ️ No new changes to add to patch notes")
            return
        
        # Filter out dev server/environment related changes
        exclude_keywords = ['dev server', 'restart', 'auto-monitor', 'environment', 'npm run']
        filtered_changes = [
            c for c in new_changes_only 
            if not any(keyword in c['implementation'].lower() or keyword in c['prompt'].lower() 
                      for keyword in exclude_keywords)
        ]
        
        if not filtered_changes:
            print("ℹ️ No user-facing changes to add to patch notes (only dev environment updates)")
            # Still update processed count
            session['lastProcessedCount'] = len(session['implementedChanges'])
            save_session(session)
            return
        
        recent_changes = [
            summarize_change(c['prompt'], c['implementation'])
            for c in filtered_changes
        ]
        
        if recent_changes:
            patches = parse_patch_notes()
            current_version = float(patches[0]['version']) if patches else 0.0
            
            # Calculate new version
            increment = calculate_version_increment(len(recent_changes))
            new_version = round(current_version + increment, 2)
            
            # Generate patch name
            patch_name = generate_patch_name(recent_changes)
            
            # Create new patch entry
            new_patch = {
                'version': str(new_version),
                'name': patch_name,
                'date': datetime.now().strftime("%Y-%m-%d"),
                'changes': recent_changes
            }
            
            # Insert at beginning
            patches.insert(0, new_patch)
            write_patch_notes(patches)
            
            # Update session to track what's been processed
            session['currentVersion'] = str(new_version)
            session['lastProcessedCount'] = len(session['implementedChanges'])
            save_session(session)
            
            print(f"✅ Auto-generated patch: {patch_name} v{new_version}")
            print(f"📝 Changes: {len(recent_changes)}")
            for change in recent_changes:
                print(f"   • {change}")

def add_change(prompt, implementation, files):
    """Add a new change to the session"""
    session = load_session()
    
    change = {
        "prompt": prompt,
        "implementation": implementation,
        "files": files if isinstance(files, list) else [files],
        "timestamp": datetime.now().strftime("%Y-%m-%d")
    }
    
    session['implementedChanges'].append(change)
    save_session(session)
    
    print(f"✅ Tracked change: {implementation}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python3 auto-patch.py generate     - Generate patch notes from session")
        print("  python3 auto-patch.py add <prompt> <implementation> <files>")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "generate":
        auto_generate_patch()
    elif command == "add" and len(sys.argv) >= 4:
        prompt = sys.argv[2]
        implementation = sys.argv[3]
        files = sys.argv[4:] if len(sys.argv) > 4 else []
        add_change(prompt, implementation, files)
    else:
        print("Invalid command or arguments")
        sys.exit(1)
