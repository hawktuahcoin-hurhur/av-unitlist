# Dev Mode Guide

## Two-Tier Developer System

### 🔧 Standard Dev Mode
Accessible by clicking "🔧 Dev Mode" button on any page.

**Features:**
- Edit tier list placements
- Add/edit unit notes
- Change recommended traits
- Export tier lists
- Clear saved data

**Restrictions:**
- Cannot edit character icons
- Cannot modify character names in source
- Cannot change rarity assignments
- Cannot alter color scales

### ⚠️ Advanced Dev Mode
Requires API key authentication. Click "⚠️ Advanced Mode" after enabling Dev Mode.

**Additional Features:**
- Edit character names in source
- Modify rarity assignments
- Custom color/badge gradients
- Direct source file editing

**API Key:**
```
lYr7xLHDtyORhz0uBPvZZHeeF6692DOpJtCBNjtH3M8
```

**Security:** Keep this key private. Do not commit to public repositories.

---

## Overview
Dev Mode allows you to edit unit properties (name, rarity, custom colors) directly from the UI and generate patch files that can be applied to the source code.

## Setup

No special setup required! Just run the dev server:

```bash
npm run dev
```

## Using Dev Mode

### 1. Enable Dev Mode
- Click the "🔧 Dev Mode" button in the top-right corner of the page
- The button will turn purple when active

### 2. Open a Unit
- Click on any unit card to open the modal
- You'll see three tabs: **Info**, **Recommended Traits**, and **🔧 Dev Edit**

### 3. Edit Unit Properties
Click the "🔧 Dev Edit" tab to access:

- **Character Name**: Change the unit's internal name (affects all references)
- **Rarity**: Select from Mythic, Exclusive, Secret, Vanguard, or Unknown
- **Custom Color/Badge**: Enter hex colors or gradient CSS for custom backgrounds

### 4. Generate Patch Files
- Click "💾 Download Patch Files" button
- Two files will download:
  1. `dev-patch-{character}-{timestamp}.json` - Structured patch data
  2. `apply-dev-changes-{character}-{timestamp}.sh` - Shell script to apply changes

### 5. Apply Changes

**Option 1 - Shell Script (Linux/Mac/WSL):**
```bash
chmod +x apply-dev-changes-*.sh
./apply-dev-changes-*.sh
```

**Option 2 - Python Script (All platforms):**
```bash
python3 apply-dev-patch.py dev-patch-*.json
```

### 6. Verify Changes
- The files are automatically modified with backups created
- Vite dev server auto-reloads
- Your changes are now in the source code
- Commit when ready

## What Gets Modified

The patch system modifies these sections of `TierListApp.jsx`:

1. **Character Lists**: Updates all instances of the character name in arrays
2. **Rarity Mapping**: Updates or adds entries in `getCharacterRarity()`
3. **Custom Backgrounds**: Updates or adds entries in `familiarBackgrounds`

## Example Workflow

```
1. Enable Dev Mode → Click 🔧 Dev Mode button
2. Click on "Gujo" unit card
3. Switch to "🔧 Dev Edit" tab
4. Change rarity to "Mythic"
5. Add custom gradient: linear-gradient(125deg, #00ff00 0%, #ff00ff 100%)
6. Click "Download Patch Files"
7. In terminal: python3 apply-dev-patch.py dev-patch-Gujo-*.json
8. ✅ Changes applied! Page auto-reloads
```

## Patch File Format

The JSON patch file contains:
```json
{
  "character": "CurrentName",
  "newName": "NewName",
  "newRarity": "Mythic",
  "customColor": "linear-gradient(...)",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Safety Features

✅ **Automatic Backups**: Every change creates a timestamped backup file
✅ **No Server Required**: Works entirely offline
✅ **Cross-Platform**: Python script works on Windows, Mac, Linux
✅ **Reversible**: Backups allow easy rollback
✅ **Git-Friendly**: All changes are in source control

## Troubleshooting

### "No changes were made"
- The patch values match the current source code
- Try making different changes

### Script permission denied (Linux/Mac)
```bash
chmod +x apply-dev-changes-*.sh
```

### Python script not found
Make sure you're in the project root directory where `apply-dev-patch.py` exists

### Backups piling up
You can safely delete `.backup.*` files after confirming changes work:
```bash
rm src/components/*.backup.*
```

## Limitations

- Cannot add entirely new characters (must exist in source)
- Regex-based replacements may have edge cases with special characters
- Complex refactoring should be done manually
- Does not modify image files or external resources
