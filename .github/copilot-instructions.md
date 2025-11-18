# Copilot Instructions for Anime Vanguards Tier List

## Project Overview
React + Vite + Tailwind CSS tier list creator for Anime Vanguards game units. Single-page app with drag-and-drop, local storage persistence, and modal-based editing.

## Architecture

### Component Structure
- **`src/components/TierListApp.jsx`** - Main monolithic component (650+ lines)
  - All state management, UI logic, and data operations in one file
  - No component splitting - keep additions here unless explicitly refactoring
  - Uses React hooks: `useState`, `useEffect` for state and persistence

### Data Model
- **143 characters** (hardcoded array in useEffect) + 6 familiars (filtered from main list)
- **Tier system**: 6 tiers × 6 categories = 36 separate tier lists
  - Tiers: `['High Tier Meta', 'Meta', 'Low Tier Meta', 'Good', 'Mid', 'Bad']`
  - Categories: `['General Use', 'Pure DPS', 'Support (Buffs)', 'Support (Debuffs)', 'Crowd Control', 'Boss Killing']`
- **State shape**: `tierData[category][tier] = [characterNames]`
- **Rarity system**: Mythic (rainbow gradient), Exclusive (purple-pink gradient), Secret (dark red gradient), Vanguard (custom per-character)

### Key Patterns

#### Rarity Background System
- **Inline styles** (not CSS classes) applied via `getBackgroundStyle()`
- Gradients extracted from reference images in `Images/backgrounds/example images/`
- **Python + PIL workflow**: Extract hex colors → generate CSS gradient → apply inline
- Familiar characters override base rarity with `familiarBackgrounds` object
- Example: Tengon uses Mythic gradient, Gilgamesh uses Exclusive gradient

#### Image Management
- Unit images: `{characterName}.webp` from GitHub raw URLs
- Base URL: `https://raw.githubusercontent.com/hawktuahcoin-hurhur/av-unitlist/main/`
- Custom images: stored in localStorage as data URLs
- Familiars: overlay icons displayed in top-right corner of base unit cards

#### Persistence
- **localStorage keys**: `tierListData`, `customImages`, `characterNotes`
- Auto-save on every state change via `useEffect` hooks
- No backend - entirely client-side

## Development Workflow

### Dev Server
```bash
npm run dev  # Vite on port 3000, auto-opens browser
```
- **Always restart dev server** when it force-closes (user preference)
- HMR enabled - changes reflect immediately

### Color Extraction Pipeline
When adding new rarity backgrounds:
1. Place reference image in `Images/backgrounds/example images/`
2. Run Python script to extract gradient:
   ```python
   python3 << 'PYEOF'
   from PIL import Image
   import numpy as np
   
   img = Image.open('path/to/image.png').convert('RGB')
   # Sample colors, generate gradient
   PYEOF
   ```
3. Apply gradient to `rarityBackgrounds` or `familiarBackgrounds` object
4. Use `125deg` for canted horizontal angle (established pattern)

### Styling Conventions
- Tailwind for layout/spacing: `flex`, `grid`, `gap-*`, `p-*`, `m-*`
- Inline styles for dynamic backgrounds (gradients)
- Custom Tailwind animations: `animate-fadeIn`, `animate-scaleIn`, `animate-slideDown`
- Dark theme baseline: `bg-gray-900`, `text-white`

## Key Functions

- `getCharacterRarity(character)` → `'Mythic'|'Exclusive'|'Secret'|'Vanguard'|'Unknown'`
- `getCharacterBadgeColor(character)` → handles Vanguard variants (Vsjw, Rogita, etc.)
- `getFamiliarFor(character)` → returns familiar name if character has one
- `getBackgroundStyle(character)` → returns inline style object with gradient

## Critical Constraints

1. **Rarity data**: Synced with Anime Vanguards Fandom wiki - don't change mappings without verification
2. **143 characters**: Complete list includes variants like `VogitaSuper`, `BrolziSuper`, `RogitaSuper`
3. **Familiar system**: 6 characters have familiars (Valentine, Gilgamesh, Tengon, Sukono, Obita, Gujo)
4. **Vanguard variants**: 6 special Vanguard units with individual badge colors (see `rarityBadgeColors`)
5. **No test suite**: Manual testing via dev server required

## Common Tasks

### Adding a new character
1. Add to `allCharacters` array (sorted alphabetically)
2. Add rarity to `rarityMap` in `getCharacterRarity()`
3. Add image path to `imageMap` (follow `.webp` naming)
4. If has familiar: add to `familiarMap` and `familiarBackgrounds`

### Changing gradients
- Edit `rarityBackgrounds` for tier-wide changes
- Edit `familiarBackgrounds` for character-specific overrides
- Maintain 125deg angle for consistency with current design
- Use 12-14 color stops for smooth transitions

### Debugging visual issues
- Check browser DevTools → localStorage for persisted data
- Inline styles take precedence over Tailwind classes
- Unit images: 95% opacity with `mix-blend-mode: normal` to avoid overlap with gradients
