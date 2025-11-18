# Patch Notes System - AUTOMATIC

## Overview
Fully automated patch notes tracking that monitors conversation changes and automatically updates the patch notes panel. Detects reverts and removes corresponding entries.

## Features
- ✅ **Auto-tracking**: Monitors all code changes made during Copilot conversations
- ✅ **Smart versioning**: Automatically increments version based on change count
- ✅ **Revert detection**: Removes patch notes when changes are undone
- ✅ **Git integration**: Hooks into git commits for automatic updates
- ✅ **Session persistence**: Maintains change history across sessions

## Version Numbering
- **+0.01**: 1-3 changes (minor fixes)
- **+0.1**: 4-6 changes (moderate update)  
- **+1.0**: 7+ changes (major update)

## How It Works

### 1. Automatic Tracking
After each code change, the system automatically:
- Logs your prompt and what was implemented
- Tracks which files were modified
- Stores changes in `.copilot-session.json`

### 2. Auto-Generation
When enough changes accumulate (or on git commit):
- Summarizes changes into patch notes
- Calculates appropriate version increment
- Generates descriptive patch name
- Updates `src/patchNotes.js`

### 3. Revert Detection
If you undo a change:
- Detects the revert via git history
- Removes corresponding patch entry
- Cleans up session history

## Manual Commands (Optional)

### Generate patch notes now:
```bash
python3 auto-patch.py generate
```

### Manually log a change:
```bash
python3 log-change.py "User prompt" "What was implemented" "file1.js,file2.js"
```

### View session history:
```bash
cat .copilot-session.json
```

## File Structure
- `src/patchNotes.js` - Patch notes data (auto-updated)
- `.copilot-session.json` - Session tracking data
- `auto-patch.py` - Main auto-generation engine
- `log-change.py` - Change logging utility
- `.git/hooks/post-commit` - Git hook for auto-updates

## Display
Patch notes appear in a scrollable glass panel in the center of the menu:
- Newest patches at top
- Version numbers in cyan
- Bullet-pointed changes
- Custom thin scrollbar

## Notes
- The system runs automatically - no manual intervention needed
- Session data persists between conversations
- Revert detection works via git commit messages containing "revert" or "undo"
- Version numbers never decrease (monotonically increasing)
