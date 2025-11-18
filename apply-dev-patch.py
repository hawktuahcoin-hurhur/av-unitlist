#!/usr/bin/env python3
"""
Dev Mode Patch Applier
Applies dev mode changes to source files with automatic backup
"""

import sys
import os
import re
import json
from datetime import datetime
from pathlib import Path

def apply_patch(patch_file):
    """Apply a dev mode patch to the source file"""
    
    # Load patch data
    with open(patch_file, 'r') as f:
        patch = json.load(f)
    
    file_path = Path('src/components/TierListApp.jsx')
    
    if not file_path.exists():
        print(f"❌ Error: {file_path} not found")
        return False
    
    # Create backup
    backup_path = file_path.with_suffix(f'.jsx.backup.{int(datetime.now().timestamp())}')
    with open(file_path, 'r') as src:
        backup_content = src.read()
    with open(backup_path, 'w') as bak:
        bak.write(backup_content)
    print(f"💾 Backup created: {backup_path}")
    
    # Read source file
    with open(file_path, 'r') as f:
        content = f.read()
    
    original_content = content
    changes_made = []
    
    character = patch['character']
    new_name = patch.get('newName')
    new_rarity = patch.get('newRarity')
    custom_color = patch.get('customColor')
    
    # Apply character rename
    if new_name and new_name != character:
        # Replace in character arrays
        content = re.sub(f"'{character}'(?=,|\\s|\\])", f"'{new_name}'", content)
        changes_made.append(f"Renamed '{character}' → '{new_name}'")
    
    # Apply rarity change
    if new_rarity:
        target_name = new_name or character
        # Find and replace rarity mapping
        pattern = f"'{character}':\\s*'\\w+'"
        replacement = f"'{target_name}': '{new_rarity}'"
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content)
            changes_made.append(f"Updated rarity → '{new_rarity}'")
    
    # Apply custom color/background
    if custom_color:
        target_name = new_name or character
        # Check if entry exists in familiarBackgrounds
        familiar_bg_pattern = r"const familiarBackgrounds = \{([^}]+)\}"
        match = re.search(familiar_bg_pattern, content, re.DOTALL)
        
        if match:
            existing_entries = match.group(1)
            entry_pattern = f"'{target_name}':\\s*'[^']*'"
            
            if re.search(entry_pattern, existing_entries):
                # Update existing entry
                content = re.sub(entry_pattern, f"'{target_name}': '{custom_color}'", content)
                changes_made.append(f"Updated custom background for '{target_name}'")
            else:
                # Add new entry
                insertion_point = match.end(1)
                new_entry = f"\n    '{target_name}': '{custom_color}',"
                content = content[:insertion_point] + new_entry + content[insertion_point:]
                changes_made.append(f"Added custom background for '{target_name}'")
    
    # Write changes if any were made
    if content != original_content:
        with open(file_path, 'w') as f:
            f.write(content)
        
        print("\n✅ Changes applied successfully!")
        for change in changes_made:
            print(f"  • {change}")
        print(f"\n📝 Backup: {backup_path}")
        print("🔄 Vite will auto-reload\n")
        return True
    else:
        print("⚠️  No changes were made")
        os.remove(backup_path)  # Remove unnecessary backup
        return False

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python3 apply-dev-patch.py <patch-file.json>")
        sys.exit(1)
    
    patch_file = sys.argv[1]
    if not os.path.exists(patch_file):
        print(f"❌ Error: Patch file not found: {patch_file}")
        sys.exit(1)
    
    success = apply_patch(patch_file)
    sys.exit(0 if success else 1)
