import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

// CORS for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dev API server is running' });
});

// API endpoint to update source code
app.post('/api/update-source', async (req, res) => {
  console.log('📥 Received request:', req.body);
  try {
    const { character, newName, newRarity, customColor } = req.body;
    
    const filePath = path.join(__dirname, 'src', 'components', 'TierListApp.jsx');
    console.log('📂 Reading file:', filePath);
    let sourceCode = await fs.readFile(filePath, 'utf-8');
    
    let updated = false;
    let changes = [];
    
    // Update character name in allCharacters array
    if (newName && newName !== character) {
      const namePattern = new RegExp(`'${character}'(?=,|\\s|\\])`, 'g');
      if (sourceCode.match(namePattern)) {
        sourceCode = sourceCode.replace(namePattern, `'${newName}'`);
        changes.push(`Renamed '${character}' to '${newName}' in character list`);
        updated = true;
      }
    }
    
    // Update rarity mapping
    if (newRarity) {
      const targetName = newName || character;
      const rarityPattern = new RegExp(`'${character}':\\s*'\\w+'`, 'g');
      if (sourceCode.match(rarityPattern)) {
        sourceCode = sourceCode.replace(rarityPattern, `'${targetName}': '${newRarity}'`);
        changes.push(`Updated rarity for '${targetName}' to '${newRarity}'`);
        updated = true;
      } else {
        // Add new rarity mapping if not found
        const rarityMapMatch = sourceCode.match(/const rarityMap = \{([^}]+)\}/s);
        if (rarityMapMatch) {
          const insertPos = sourceCode.indexOf(rarityMapMatch[0]) + rarityMapMatch[0].length - 1;
          const newEntry = `\n      '${targetName}': '${newRarity}',`;
          sourceCode = sourceCode.slice(0, insertPos) + newEntry + sourceCode.slice(insertPos);
          changes.push(`Added new rarity mapping for '${targetName}': '${newRarity}'`);
          updated = true;
        }
      }
    }
    
    // Update custom color/background
    if (customColor && customColor.trim()) {
      const targetName = newName || character;
      const familiarBgPattern = /const familiarBackgrounds = \{([^}]+)\}/s;
      const match = sourceCode.match(familiarBgPattern);
      
      if (match) {
        const existingEntries = match[1];
        const entryPattern = new RegExp(`'${targetName}':\\s*'[^']*'`, 'g');
        
        if (existingEntries.match(entryPattern)) {
          // Update existing entry
          sourceCode = sourceCode.replace(entryPattern, `'${targetName}': '${customColor.trim()}'`);
          changes.push(`Updated custom background for '${targetName}'`);
        } else {
          // Add new entry
          const insertPos = sourceCode.indexOf(match[0]) + match[0].length - 3;
          const newEntry = `\n    '${targetName}': '${customColor.trim()}',`;
          sourceCode = sourceCode.slice(0, insertPos) + newEntry + sourceCode.slice(insertPos);
          changes.push(`Added custom background for '${targetName}'`);
        }
        updated = true;
      }
    }
    
    if (updated) {
      // Write back to file
      console.log('💾 Writing changes to file...');
      await fs.writeFile(filePath, sourceCode, 'utf-8');
      console.log('✅ Changes applied:', changes);
      res.json({ 
        success: true, 
        message: 'Source code updated successfully',
        changes 
      });
    } else {
      console.log('⚠️ No changes were made');
      res.json({ 
        success: false, 
        message: 'No changes were made' 
      });
    }
    
  } catch (error) {
    console.error('❌ Error updating source:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

const PORT = 3002;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Dev API server running on http://localhost:${PORT}`);
  console.log(`Accessible from: http://0.0.0.0:${PORT}`);
});
