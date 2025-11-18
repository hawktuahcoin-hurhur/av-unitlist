#!/usr/bin/env python3
"""
Automated Patch Notes Generator
Watches for git changes and updates patch notes automatically
"""

import os
import json
import subprocess
from datetime import datetime

def get_git_changes():
    """Get list of changed files from git"""
    try:
        result = subprocess.run(
            ['git', 'diff', '--name-only', 'HEAD'],
            capture_output=True,
            text=True,
            cwd='/workspaces/av-unitlist'
        )
        return result.stdout.strip().split('\n') if result.stdout else []
    except Exception as e:
        print(f"Error getting git changes: {e}")
        return []

def count_changes():
    """Count the number of changes in the codebase"""
    try:
        result = subprocess.run(
            ['git', 'diff', '--stat'],
            capture_output=True,
            text=True,
            cwd='/workspaces/av-unitlist'
        )
        lines = result.stdout.strip().split('\n')
        # Count files changed
        return len([l for l in lines if '|' in l])
    except Exception:
        return 0

def calculate_version_increment(change_count):
    """Calculate version increment based on number of changes"""
    if change_count <= 3:
        return 0.01
    elif change_count <= 6:
        return 0.1
    else:
        return 1.0

def read_patch_notes():
    """Read current patch notes from file"""
    patch_file = '/workspaces/av-unitlist/src/patchNotes.js'
    try:
        with open(patch_file, 'r') as f:
            content = f.read()
        # Extract the array content
        start = content.find('[')
        end = content.rfind(']') + 1
        if start != -1 and end != 0:
            array_str = content[start:end]
            # Convert JS to JSON-like format for parsing
            # This is a simple parser, might need adjustment for complex cases
            return content
        return None
    except Exception as e:
        print(f"Error reading patch notes: {e}")
        return None

def update_patch_notes(patch_name, changes):
    """Update patch notes with new entry"""
    patch_file = '/workspaces/av-unitlist/src/patchNotes.js'
    
    try:
        with open(patch_file, 'r') as f:
            content = f.read()
        
        # Extract current version from first patch
        import re
        version_match = re.search(r'version:\s*"([0-9.]+)"', content)
        current_version = float(version_match.group(1)) if version_match else 0.1
        
        # Calculate new version
        change_count = len(changes)
        increment = calculate_version_increment(change_count)
        new_version = round(current_version + increment, 2)
        
        # Create new patch entry
        date_str = datetime.now().strftime("%Y-%m-%d")
        changes_str = ',\n      '.join([f'"{change}"' for change in changes])
        
        new_patch = f'''  {{
    version: "{new_version}",
    name: "{patch_name}",
    date: "{date_str}",
    changes: [
      {changes_str}
    ]
  }},'''
        
        # Insert new patch at the beginning of the array
        insert_pos = content.find('[') + 1
        updated_content = content[:insert_pos] + '\n' + new_patch + content[insert_pos:]
        
        with open(patch_file, 'w') as f:
            f.write(updated_content)
        
        print(f"✅ Patch notes updated: {patch_name} v{new_version}")
        print(f"📝 Changes: {change_count}")
        return True
        
    except Exception as e:
        print(f"❌ Error updating patch notes: {e}")
        return False

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python3 update-patch-notes.py <patch_name> <change1> [change2] [...]")
        print("Example: python3 update-patch-notes.py 'Bug Fixes' 'Fixed Rogita passives' 'Added trait system'")
        sys.exit(1)
    
    patch_name = sys.argv[1]
    changes = sys.argv[2:]
    
    success = update_patch_notes(patch_name, changes)
    sys.exit(0 if success else 1)
