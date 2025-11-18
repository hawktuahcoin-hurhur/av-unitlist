import React, { useState, useEffect } from 'react';
import { Upload, Search, X } from 'lucide-react';
import { unitPassivesData } from '../unitPassives';
import { patchNotes, currentVersion } from '../patchNotes';
import { ADVANCED_DEV_KEY } from '../config';
import { familiarPassives } from '../familiarPassives';

const TierListApp = () => {
  const defaultTiers = ['High Tier Meta', 'Meta', 'Low Tier Meta', 'Good', 'Mid', 'Bad'];
  const defaultCategories = ['General Use', 'Pure DPS', 'Support (Buffs)', 'Support (Debuffs)', 'Crowd Control', 'Boss Killing'];
  
  const [customTiers, setCustomTiers] = useState(() => {
    const saved = localStorage.getItem('customTiers');
    return saved ? JSON.parse(saved) : [];
  });
  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem('customCategories');
    return saved ? JSON.parse(saved) : [];
  });
  const [customTierData, setCustomTierData] = useState(() => {
    const saved = localStorage.getItem('customTierData');
    return saved ? JSON.parse(saved) : {};
  });
  const [isCustomMode, setIsCustomMode] = useState(false);
  
  const tiers = isCustomMode ? customTiers : defaultTiers;
  const categories = isCustomMode ? customCategories : defaultCategories;
  
  // Base URL for GitHub images
  const imageBaseUrl = 'https://raw.githubusercontent.com/hawktuahcoin-hurhur/av-unitlist/main/';
  
  const [characters, setCharacters] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('General Use');
  const [tierData, setTierData] = useState(() => {
    const initial = {};
    categories.forEach(cat => {
      initial[cat] = {};
      tiers.forEach(tier => {
        initial[cat][tier] = [];
      });
    });
    return initial;
  });
  
  const [images, setImages] = useState({});
  const [notes, setNotes] = useState({});
  const [traits, setTraits] = useState({});
  const [devOverrides, setDevOverrides] = useState({});
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [currentNote, setCurrentNote] = useState('');
  const [showTierInfo, setShowTierInfo] = useState(null);
  const [devMode, setDevMode] = useState(false);
  const [advancedDevMode, setAdvancedDevMode] = useState(false);
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [editingName, setEditingName] = useState('');
  const [editingRarity, setEditingRarity] = useState('');
  const [editingColor, setEditingColor] = useState('');
  const [modalTab, setModalTab] = useState('info');
  const [currentView, setCurrentView] = useState('menu'); // 'menu', 'tierlist', 'unitlist', or 'traitcalc'
  const [searchQuery, setSearchQuery] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  
  // Custom tier list state
  const [showCustomTierManager, setShowCustomTierManager] = useState(false);
  const [newTierName, setNewTierName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingTierIndex, setEditingTierIndex] = useState(null);
  const [editingCategoryIndex, setEditingCategoryIndex] = useState(null);
  
  // Trait calculator state
  const [calcSelectedUnit, setCalcSelectedUnit] = useState(null);
  const [unitSearchQuery, setUnitSearchQuery] = useState('');
  const [unitTraitHistories, setUnitTraitHistories] = useState({}); // Store history per unit
  const [unitCurrentTraits, setUnitCurrentTraits] = useState({}); // Store current trait per unit
  const [showMythicCelebration, setShowMythicCelebration] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [rollUntilMonarch, setRollUntilMonarch] = useState(false);
  const [traitRollerChoiceUnit, setTraitRollerChoiceUnit] = useState(null);
  const [totalRolls, setTotalRolls] = useState(0);
  const [unitPityCounters, setUnitPityCounters] = useState({}); // Store pity counter per unit
  const [mythicTraitToggles, setMythicTraitToggles] = useState({
    Solar: true,
    Deadeye: true,
    Ethereal: true,
    Monarch: true
  });
  
  // Background cycling state with theme configurations
  const backgroundThemes = {
    'Anime-Vanguards-codes-cover.webp': {
      name: 'Anime-Vanguards-codes-cover.webp',
      primary: 'rgba(59, 130, 246, 0.5)', // Blue
      secondary: 'rgba(37, 99, 235, 0.4)',
      accent: '#60a5fa',
      glass: 'rgba(30, 58, 138, 0.3)',
      overlay: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.6), rgba(30, 58, 138, 0.7))'
    },
    'How-to-join-the-Occult-Event-in-Anime-Vanguards-key-art.webp': {
      name: 'How-to-join-the-Occult-Event-in-Anime-Vanguards-key-art.webp',
      primary: 'rgba(139, 92, 246, 0.5)', // Purple
      secondary: 'rgba(124, 58, 237, 0.4)',
      accent: '#a78bfa',
      glass: 'rgba(76, 29, 149, 0.3)',
      overlay: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.6), rgba(76, 29, 149, 0.7))'
    },
    'images (1).jpg': {
      name: 'images (1).jpg',
      primary: 'rgba(236, 72, 153, 0.5)', // Pink
      secondary: 'rgba(219, 39, 119, 0.4)',
      accent: '#f472b6',
      glass: 'rgba(157, 23, 77, 0.3)',
      overlay: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.6), rgba(157, 23, 77, 0.7))'
    },
    'images (2).jpg': {
      name: 'images (2).jpg',
      primary: 'rgba(34, 197, 94, 0.5)', // Green
      secondary: 'rgba(22, 163, 74, 0.4)',
      accent: '#4ade80',
      glass: 'rgba(21, 128, 61, 0.3)',
      overlay: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.6), rgba(21, 128, 61, 0.7))'
    },
    'noFilter (1).webp': {
      name: 'noFilter (1).webp',
      primary: 'rgba(249, 115, 22, 0.5)', // Orange
      secondary: 'rgba(234, 88, 12, 0.4)',
      accent: '#fb923c',
      glass: 'rgba(154, 52, 18, 0.3)',
      overlay: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.6), rgba(154, 52, 18, 0.7))'
    },
    'noFilter.jpg': {
      name: 'noFilter.jpg',
      primary: 'rgba(6, 182, 212, 0.5)', // Cyan
      secondary: 'rgba(8, 145, 178, 0.4)',
      accent: '#22d3ee',
      glass: 'rgba(14, 116, 144, 0.3)',
      overlay: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.6), rgba(14, 116, 144, 0.7))'
    },
    'noFilter.webp': {
      name: 'noFilter.webp',
      primary: 'rgba(239, 68, 68, 0.5)', // Red
      secondary: 'rgba(220, 38, 38, 0.4)',
      accent: '#f87171',
      glass: 'rgba(153, 27, 27, 0.3)',
      overlay: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.6), rgba(153, 27, 27, 0.7))'
    }
  };

  const backgroundImages = Object.keys(backgroundThemes);
  
  const [currentBackground, setCurrentBackground] = useState(() => {
    return backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
  });

  const currentTheme = backgroundThemes[currentBackground];

  const changeView = (newView, category = null) => {
    setIsTransitioning(true);
    // Change background when switching views (except when opening unit modal)
    setCurrentBackground(backgroundImages[Math.floor(Math.random() * backgroundImages.length)]);
    setTimeout(() => {
      setCurrentView(newView);
      if (category) setSelectedCategory(category);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  };

  const isFamiliar = (character) => {
    return character.endsWith('Familiar');
  };

  const tierDescriptions = {
    'High Tier Meta': 'The absolute best units in the game. These characters dominate the meta and are essential for endgame content.',
    'Meta': 'Top-tier units that perform exceptionally well. Highly recommended for all game modes.',
    'Low Tier Meta': 'Strong units that are viable in meta teams but slightly outclassed by higher tiers.',
    'Good': 'Solid performers that work well in most situations. Great for general use and specific strategies.',
    'Mid': 'Average units that can be useful in certain scenarios but are generally outperformed.',
    'Bad': 'Underperforming units that struggle to compete. Only recommended if you have no better options.'
  };

  // Get unit passives from imported data
  const getUnitPassives = (character) => {
    return unitPassivesData[character] || { passives: ['No passive data available'] };
  };
  
  // Custom tier list management functions
  const addCustomTier = () => {
    if (newTierName.trim() && !customTiers.includes(newTierName.trim())) {
      const updatedTiers = [...customTiers, newTierName.trim()];
      setCustomTiers(updatedTiers);
      
      // Initialize this tier in all custom categories
      const updatedData = { ...customTierData };
      customCategories.forEach(cat => {
        if (!updatedData[cat]) updatedData[cat] = {};
        updatedData[cat][newTierName.trim()] = [];
      });
      setCustomTierData(updatedData);
      setNewTierName('');
    }
  };
  
  const addCustomCategory = () => {
    if (newCategoryName.trim() && !customCategories.includes(newCategoryName.trim())) {
      const updatedCategories = [...customCategories, newCategoryName.trim()];
      setCustomCategories(updatedCategories);
      
      // Initialize this category with all custom tiers
      const updatedData = { ...customTierData };
      updatedData[newCategoryName.trim()] = {};
      customTiers.forEach(tier => {
        updatedData[newCategoryName.trim()][tier] = [];
      });
      setCustomTierData(updatedData);
      setNewCategoryName('');
    }
  };
  
  const renameCustomTier = (oldName, newName) => {
    if (newName.trim() && newName !== oldName) {
      const updatedTiers = customTiers.map(t => t === oldName ? newName : t);
      setCustomTiers(updatedTiers);
      
      // Update tier data keys
      const updatedData = { ...customTierData };
      Object.keys(updatedData).forEach(cat => {
        if (updatedData[cat][oldName]) {
          updatedData[cat][newName] = updatedData[cat][oldName];
          delete updatedData[cat][oldName];
        }
      });
      setCustomTierData(updatedData);
      setEditingTierIndex(null);
    }
  };
  
  const renameCustomCategory = (oldName, newName) => {
    if (newName.trim() && newName !== oldName) {
      const updatedCategories = customCategories.map(c => c === oldName ? newName : c);
      setCustomCategories(updatedCategories);
      
      // Update category data keys
      const updatedData = { ...customTierData };
      if (updatedData[oldName]) {
        updatedData[newName] = updatedData[oldName];
        delete updatedData[oldName];
      }
      setCustomTierData(updatedData);
      
      if (selectedCategory === oldName) {
        setSelectedCategory(newName);
      }
      setEditingCategoryIndex(null);
    }
  };
  
  const deleteCustomTier = (tierName) => {
    const updatedTiers = customTiers.filter(t => t !== tierName);
    setCustomTiers(updatedTiers);
    
    // Remove from tier data
    const updatedData = { ...customTierData };
    Object.keys(updatedData).forEach(cat => {
      delete updatedData[cat][tierName];
    });
    setCustomTierData(updatedData);
  };
  
  const deleteCustomCategory = (categoryName) => {
    const updatedCategories = customCategories.filter(c => c !== categoryName);
    setCustomCategories(updatedCategories);
    
    // Remove from tier data
    const updatedData = { ...customTierData };
    delete updatedData[categoryName];
    setCustomTierData(updatedData);
    
    if (selectedCategory === categoryName && updatedCategories.length > 0) {
      setSelectedCategory(updatedCategories[0]);
    }
  };
  
  const switchToCustomMode = () => {
    if (customTiers.length === 0 || customCategories.length === 0) {
      alert('Please create at least one tier and one category in the Custom Tier Manager first!');
      setShowCustomTierManager(true);
      return;
    }
    setIsCustomMode(true);
    setSelectedCategory(customCategories[0]);
  };
  
  const switchToDefaultMode = () => {
    setIsCustomMode(false);
    setSelectedCategory(defaultCategories[0]);
  };

  // Load character list from all available webp images
  useEffect(() => {
    const allCharacters = [
      'Akazo', 'Al', 'Ali', 'Alocard', 'Arc', 'Archer', 'Arin', 'Astolfo', 'Aurin', 'Boohon',
      'Brisket', 'BrolziSuper', 'Byeken', 'Callasuba', 'Cat', 'ChaIn', 'Chaso', 'ChoyJongEn',
      'Clatakiri', 'Conqueror', 'CuChulainn', 'DarkMage', 'Dave', 'Dawntay', 'Deruta', 'Diogo',
      'Divalo', 'Dodara', 'Dot', 'Eizan', 'Emmie', 'Foboko', 'Friran', 'GG', 'Gazelle', 'GearBoy',
      'GiantQueen', 'Gilgamesh', 'GilgameshFamiliar', 'Giro', 'GoblinKiller', 'GodAboveHeaven',
      'GodStandless', 'Gujo', 'GujoFamiliar', 'HarukaRin', 'Hebano', 'Hei', 'Hellkiller', 'Hercool',
      'Hollowseph', 'Ichiga', 'Igros', 'Iscanur', 'Isdead', 'Ishtar', 'Jago', 'Johnni', 'Julias',
      'Karem', 'Kazzy', 'Kempache', 'Ken', 'KidBoo', 'Kiskae', 'Koguro', 'Leo', 'Lfelt',
      'Lilia', 'Lizard', 'LordFriezo', 'LordofShadows', 'Luce', 'Marlin', 'Medea', 'Medusa',
      'Mimi', 'MonkeyKing', 'Newsman', 'Noruto', 'NotGoodGuy', 'Obita', 'ObitaFamiliar', 'Okorun',
      'Orehimi', 'Oryo', 'Priestess', 'Pweeny', 'Quetzalcoatl', 'Regnaw', 'Reimu', 'Renguko', 'Rideon',
      'Riner', 'Rogita', 'RogitaSuper', 'Rohan', 'Roku', 'RomandRan', 'Rudie', 'Rummie', 'Saber',
      'Saiko', 'Sakuya', 'Salter', 'Senator', 'Shero', 'Slime', 'SmithJohn', 'Soburo', 'Sokora',
      'SongJinwu', 'Sosora', 'Sosuke', 'Sukono', 'SukonoFamiliar', 'SuperVogito', 'Tengon',
      'TengonFamiliar', 'TheFalcon', 'TheKing', 'TheSmith', 'TheStruggler', 'TheWitch', 'Thunder',
      'Todu', 'Traitless', 'Tuji', 'Valentine', 'ValentineFamiliar', 'Vigil', 'Vogita', 'VogitaSuper',
      'Vsjw', 'Wolf', 'Yehowach', 'Yomomata', 'Yuruicha', 'Zak', 'Zion'
    ].sort().filter(char => !isFamiliar(char));
    
    setCharacters(allCharacters);
    
    // Pre-load images from GitHub (including familiars)
    const imageMap = {};
    const allCharactersIncludingFamiliars = [
      'Akazo', 'Al', 'Ali', 'Alocard', 'Arc', 'Archer', 'Arin', 'Astolfo', 'Aurin', 'Boohon',
      'Brisket', 'BrolziSuper', 'Byeken', 'Callasuba', 'Cat', 'ChaIn', 'Chaso', 'ChoyJongEn',
      'Clatakiri', 'Conqueror', 'CuChulainn', 'DarkMage', 'Dave', 'Dawntay', 'Deruta', 'Diogo',
      'Divalo', 'Dodara', 'Dot', 'Eizan', 'Emmie', 'Foboko', 'Friran', 'GG', 'Gazelle', 'GearBoy',
      'GiantQueen', 'Gilgamesh', 'GilgameshFamiliar', 'Giro', 'GoblinKiller', 'GodAboveHeaven',
      'GodStandless', 'Gujo', 'GujoFamiliar', 'HarukaRin', 'Hebano', 'Hei', 'Hellkiller', 'Hercool',
      'Hollowseph', 'Ichiga', 'Igros', 'Iscanur', 'Isdead', 'Ishtar', 'Jago', 'Johnni', 'Julias',
      'Karem', 'Kazzy', 'Kempache', 'Ken', 'KidBoo', 'Kiskae', 'Koguro', 'Leo', 'Lfelt',
      'Lilia', 'Lizard', 'LordFriezo', 'LordofShadows', 'Luce', 'Marlin', 'Medea', 'Medusa',
      'Mimi', 'MonkeyKing', 'Newsman', 'Noruto', 'NotGoodGuy', 'Obita', 'ObitaFamiliar', 'Okorun',
      'Orehimi', 'Oryo', 'Priestess', 'Pweeny', 'Quetzalcoatl', 'Regnaw', 'Reimu', 'Renguko', 'Rideon',
      'Riner', 'Rogita', 'RogitaSuper', 'Rohan', 'Roku', 'RomandRan', 'Rudie', 'Rummie', 'Saber',
      'Saiko', 'Sakuya', 'Salter', 'Senator', 'Shero', 'Slime', 'SmithJohn', 'Soburo', 'Sokora',
      'SongJinwu', 'Sosora', 'Sosuke', 'Sukono', 'SukonoFamiliar', 'SuperVogito', 'Tengon',
      'TengonFamiliar', 'TheFalcon', 'TheKing', 'TheSmith', 'TheStruggler', 'TheWitch', 'Thunder',
      'Todu', 'Traitless', 'Tuji', 'Valentine', 'ValentineFamiliar', 'Vigil', 'Vogita', 'VogitaSuper',
      'Vsjw', 'Wolf', 'Yehowach', 'Yomomata', 'Yuruicha', 'Zak', 'Zion'
    ];
    allCharactersIncludingFamiliars.forEach(name => {
      imageMap[name] = imageBaseUrl + name + '.webp';
    });
    setImages(imageMap);
    
    // Load saved notes and traits from localStorage
    const savedNotes = localStorage.getItem('characterNotes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Failed to load notes:', e);
      }
    }
    
    // Load saved traits from localStorage, or use default wiki traits
    const savedTraits = localStorage.getItem('characterTraits');
    if (savedTraits) {
      try {
        setTraits(JSON.parse(savedTraits));
      } catch (e) {
        console.error('Failed to load traits:', e);
      }
    } else {
      // Default all units to Monarch trait
      const defaultTraits = {};
      allCharactersIncludingFamiliars.forEach(char => {
        defaultTraits[char] = 'Monarch';
      });
      setTraits(defaultTraits);
    }
    
    // Load dev mode overrides
    const savedOverrides = localStorage.getItem('devModeOverrides');
    if (savedOverrides) {
      try {
        setDevOverrides(JSON.parse(savedOverrides));
      } catch (e) {
        console.error('Failed to load dev overrides:', e);
      }
    }

    // Check for shared tierlist in URL
    const urlParams = new URLSearchParams(window.location.search);
    const tierlistParam = urlParams.get('tierlist');
    if (tierlistParam) {
      try {
        const decoded = JSON.parse(atob(tierlistParam));
        if (decoded.category && decoded.tiers) {
          setTierData(prev => ({
            ...prev,
            [decoded.category]: decoded.tiers
          }));
          setSelectedCategory(decoded.category);
          if (decoded.notes) setNotes(decoded.notes);
          if (decoded.traits) setTraits(decoded.traits);
          setCurrentView('tierlist');
          console.log('✅ Loaded shared tierlist:', decoded.category);
        }
      } catch (e) {
        console.error('Failed to load shared tierlist:', e);
      }
    }
  }, []);
  
  // Auto-save notes to localStorage
  useEffect(() => {
    if (Object.keys(notes).length > 0) {
      localStorage.setItem('characterNotes', JSON.stringify(notes));
    }
  }, [notes]);
  
  // Auto-save traits to localStorage
  useEffect(() => {
    if (Object.keys(traits).length > 0) {
      localStorage.setItem('characterTraits', JSON.stringify(traits));
    }
  }, [traits]);
  
  // Auto-save dev overrides to localStorage
  useEffect(() => {
    if (Object.keys(devOverrides).length > 0) {
      localStorage.setItem('devModeOverrides', JSON.stringify(devOverrides));
    }
  }, [devOverrides]);
  
  // Auto-save custom tiers and categories
  useEffect(() => {
    localStorage.setItem('customTiers', JSON.stringify(customTiers));
  }, [customTiers]);
  
  useEffect(() => {
    localStorage.setItem('customCategories', JSON.stringify(customCategories));
  }, [customCategories]);
  
  useEffect(() => {
    localStorage.setItem('customTierData', JSON.stringify(customTierData));
  }, [customTierData]);
  
  // Version checking and auto-reload
  useEffect(() => {
    const checkVersion = () => {
      const localVersion = localStorage.getItem('appVersion');
      
      if (!localVersion) {
        // First time loading, save current version
        localStorage.setItem('appVersion', currentVersion);
        console.log(`App version set to: ${currentVersion}`);
      } else if (localVersion !== currentVersion) {
        // Version changed, reload the page
        console.log(`Version updated: ${localVersion} → ${currentVersion}. Reloading...`);
        localStorage.setItem('appVersion', currentVersion);
        window.location.reload();
      }
    };
    
    checkVersion();
    
    // Check for updates every 5 minutes
    const interval = setInterval(checkVersion, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCharacterName = (name) => {
    return name.replace(/([A-Z])/g, ' $1').trim();
  };

  const getFamiliarFor = (character) => {
    const familiarMap = {
      'Valentine': 'ValentineFamiliar',
      'Gilgamesh': 'GilgameshFamiliar',
      'Tengon': 'TengonFamiliar',
      'Sukono': 'SukonoFamiliar',
      'Obita': 'ObitaFamiliar',
      'Gujo': 'GujoFamiliar'
    };
    return familiarMap[character];
  };

  const getFamiliarIconUrl = (familiarName) => {
    // familiarName can be either:
    // 1. The key like "GujoFamiliar" from getFamiliarFor()
    // 2. The actual icon name like "Gujo's Glasses" from familiarPassives
    
    const iconMap = {
      'ValentineFamiliar': 'American Flag.webp',
      'GilgameshFamiliar': 'Key of Babylon.webp',
      'TengonFamiliar': "Tengon's Smokebomb.webp",
      'SukonoFamiliar': "Sukono's Finger.webp",
      'ObitaFamiliar': 'Secluded Kunai.webp',
      'GujoFamiliar': "Gujo's Glasses.webp",
      // Also support direct icon names
      'American Flag': 'American Flag.webp',
      'Key of Babylon': 'Key of Babylon.webp',
      "Tengon's Smokebomb": "Tengon's Smokebomb.webp",
      "Sukono's Finger": "Sukono's Finger.webp",
      'Secluded Kunai': 'Secluded Kunai.webp',
      "Gujo's Glasses": "Gujo's Glasses.webp"
    };
    
    const iconFilename = iconMap[familiarName];
    if (!iconFilename) return null;
    return `${imageBaseUrl}Images/Units/Familiar icons/${encodeURIComponent(iconFilename)}`;
  };

  const getCharacterRarity = (character) => {
    // Check for dev mode override first
    if (devOverrides[character]?.rarity) {
      return devOverrides[character].rarity;
    }
    
    const rarityMap = {
      // Mythic (Blue)
      'Akazo': 'Mythic', 'Archer': 'Mythic', 'Aurin': 'Mythic', 'Brisket': 'Mythic',
      'ChaIn': 'Mythic', 'Chaso': 'Mythic', 'CuChulainn': 'Mythic', 'Dot': 'Mythic', 'GearBoy': 'Mythic', 'Gazelle': 'Mythic',
      'Giro': 'Mythic', 'Hercool': 'Mythic', 'Ichiga': 'Mythic', 'Jago': 'Mythic', 'Johnni': 'Mythic',
      'Kazzy': 'Mythic', 'Kempache': 'Mythic', 'Ken': 'Mythic', 'LordFriezo': 'Mythic', 'Noruto': 'Mythic', 'NotGoodGuy': 'Mythic', 'Oryo': 'Mythic', 'Orehimi': 'Mythic',
      'Riner': 'Mythic', 'Rohan': 'Mythic', 'Saber': 'Mythic', 'SongJinwu': 'Mythic', 'Sosuke': 'Mythic', 'Tengon': 'Mythic', 'TheKing': 'Mythic', 'TheSmith': 'Mythic',
      'TheWitch': 'Mythic', 'Todu': 'Mythic', 'VogitaSuper': 'Mythic', 'Yuruicha': 'Mythic', 'Zak': 'Mythic',
      'Ishtar': 'Mythic', 'Lilia': 'Mythic', 'Medea': 'Mythic', 'Medusa': 'Mythic',
      
      // Exclusive (Pink)
      'Al': 'Exclusive', 'Ali': 'Exclusive', 'Arc': 'Exclusive', 'Callasuba': 'Exclusive',
      'Cat': 'Exclusive', 'DarkMage': 'Exclusive', 'Dave': 'Exclusive',
      'Dawntay': 'Exclusive', 'Deruta': 'Exclusive', 'Diogo': 'Exclusive', 'Dodara': 'Exclusive', 'Emmie': 'Exclusive',
      'Foboko': 'Exclusive', 'GG': 'Exclusive', 'Gilgamesh': 'Exclusive', 'GoblinKiller': 'Exclusive',
      'GiantQueen': 'Exclusive', 'HarukaRin': 'Exclusive', 'Hebano': 'Exclusive', 'Hei': 'Exclusive',
      'Hellkiller': 'Exclusive', 'Hollowseph': 'Exclusive', 'Julias': 'Exclusive',
      'Karem': 'Exclusive', 'Kiskae': 'Exclusive',
      'Lizard': 'Exclusive', 'Luce': 'Exclusive', 'Marlin': 'Exclusive',
      'Mimi': 'Exclusive', 'Okorun': 'Exclusive', 'Pweeny': 'Exclusive',
      'Priestess': 'Exclusive', 'Quetzalcoatl': 'Exclusive', 'Reimu': 'Exclusive', 'Renguko': 'Exclusive',
      'Rideon': 'Exclusive', 'RomandRan': 'Exclusive', 'Rummie': 'Exclusive', 'Rudie': 'Exclusive', 'Saiko': 'Exclusive',
      'Sakuya': 'Exclusive', 'Shero': 'Exclusive', 'Sosora': 'Exclusive',
      'Thunder': 'Exclusive', 'Traitless': 'Exclusive', 'Tuji': 'Exclusive',
      'Vigil': 'Exclusive', 'Zion': 'Exclusive',
      
      // Secret (Red)
      'Alocard': 'Secret', 'Arin': 'Secret', 'Astolfo': 'Secret', 'Boohon': 'Secret', 'Byeken': 'Secret',
      'ChoyJongEn': 'Secret', 'Clatakiri': 'Secret', 'Conqueror': 'Secret', 'Eizan': 'Secret',
      'Friran': 'Secret', 'GodAboveHeaven': 'Secret', 'GodStandless': 'Secret', 'Gujo': 'Secret', 'Igros': 'Secret',
      'Isdead': 'Secret', 'KidBoo': 'Secret', 'Leo': 'Secret', 'Lfelt': 'Secret',
      'LordofShadows': 'Secret', 'MonkeyKing': 'Secret', 'Newsman': 'Secret',
      'Obita': 'Secret', 'Regnaw': 'Secret', 'Roku': 'Secret',
      'RogitaSuper': 'Secret', 'Salter': 'Secret', 'Senator': 'Secret', 'Slime': 'Secret',
      'SmithJohn': 'Secret', 'Soburo': 'Secret', 'Sokora': 'Secret',
      'Sukono': 'Secret', 'SuperVogito': 'Secret', 'TheStruggler': 'Secret',
      'TheFalcon': 'Secret', 'Valentine': 'Secret', 'Vogita': 'Secret', 'Wolf': 'Secret', 'Yehowach': 'Secret',
      'Yomomata': 'Secret',
      
      // Vanguard (Distinct - teal/cyan + custom colors) - LEAVE UNCHANGED
      'Awntay': 'Vanguard', 'Vsjw': 'Vanguard', 'Iscanur': 'Vanguard', 'Divalo': 'Vanguard',
      'Koguro': 'Vanguard', 'BrolziSuper': 'Vanguard', 'Rogita': 'Vanguard',
      
      // Familiars (not in wiki, assigned to Unknown - will be filtered from display)
      'ValentineFamiliar': 'Unknown', 'GilgameshFamiliar': 'Unknown', 'TengonFamiliar': 'Unknown',
      'SukonoFamiliar': 'Unknown', 'ObitaFamiliar': 'Unknown', 'GujoFamiliar': 'Unknown'
    };
    return rarityMap[character] || 'Unknown';
  };

  const rarityColors = {
    'Mythic': 'border-blue-400 from-blue-900 to-blue-800',
    'Exclusive': 'border-pink-400 from-pink-900 to-pink-800',
    'Secret': 'border-red-400 from-red-900 to-red-800',
    'Vanguard': 'border-cyan-400 from-cyan-900 to-cyan-800',
    'Unknown': 'border-gray-400 from-gray-900 to-gray-800'
  };

  const rarityBadgeColors = {
    'Mythic': 'bg-blue-600 text-white border border-blue-400',
    'Exclusive': 'bg-pink-600 text-white border border-pink-400',
    'Secret': 'bg-red-900 text-white border border-red-700',
    'Vanguard': 'bg-cyan-600 text-white border border-cyan-400',
    'VsjwVanguard': 'bg-purple-600 text-white border border-purple-400',
    'RogitaVanguard': 'bg-yellow-600 text-white border border-yellow-400',
    'IscanurVanguard': 'bg-orange-500 text-white border border-orange-400',
    'DivoloVanguard': 'bg-red-900 text-white border border-red-800',
    'KoguroVanguard': 'bg-gray-500 text-white border border-gray-300',
    'BrolziVanguard': 'bg-green-600 text-white border border-green-400',
    'Unknown': 'bg-gray-600 text-white border border-gray-400'
  };

  const getCharacterBadgeColor = (character) => {
    if (character === 'Vsjw') return 'VsjwVanguard';
    if (character === 'Rogita') return 'RogitaVanguard';
    if (character === 'Iscanur') return 'IscanurVanguard';
    if (character === 'Divalo') return 'DivoloVanguard';
    if (character === 'Koguro') return 'KoguroVanguard';
    if (character === 'BrolziSuper') return 'BrolziVanguard';
    const rarity = getCharacterRarity(character);
    return rarityBadgeColors[rarity] ? rarity : 'Unknown';
  };

  const getVanguardMonarchGradient = (character) => {
    const vanguardGradients = {
      'Vsjw': 'linear-gradient(125deg, #2d1b4e 0%, #5b3599 25%, #9a71ed 50%, #d9b7ff 75%, #ffffff 100%)',
      'Rogita': 'linear-gradient(125deg, #a16207 0%, #ca8a04 25%, #facc15 50%, #fde047 75%, #fef9c3 100%)',
      'Iscanur': 'linear-gradient(125deg, #c2410c 0%, #f97316 25%, #fb923c 50%, #fdba74 75%, #fed7aa 100%)',
      'Divalo': 'linear-gradient(125deg, #7f1d1d 0%, #991b1b 25%, #dc2626 50%, #f87171 75%, #fca5a5 100%)',
      'Koguro': 'linear-gradient(125deg, #71717a 0%, #9ca3af 25%, #d4dae3 50%, #f0f4f8 75%, #ffffff 100%)',
      'BrolziSuper': 'linear-gradient(125deg, #15803d 0%, #16a34a 25%, #4ade80 50%, #86efac 75%, #bbf7d0 100%)',
      'Awntay': 'linear-gradient(125deg, #0e7490 0%, #06b6d4 25%, #22d3ee 50%, #67e8f9 75%, #a5f3fc 100%)'
    };
    return vanguardGradients[character] || null;
  };

  const isSpecialVariant = (character) => {
    const badgeKey = getCharacterBadgeColor(character);
    return typeof badgeKey === 'string' && badgeKey.toLowerCase().includes('vanguard');
  };

  const rarityBackgrounds = {
    'Mythic': 'linear-gradient(125deg, #00ff00 0%, #aaff00 6%, #ffff00 12%, #ffaa00 18%, #ff7f00 24%, #ff4500 30%, #ff0000 36%, #ff0040 42%, #ff007f 48%, #ff00ff 54%, #8b00ff 60%, #4b0082 66%, #0000ff 72%, #007fff 78%, #00ffff 84%, #00ff7f 90%, #00ff00 100%)',
    'Exclusive': 'linear-gradient(125deg, #520002 0%, #ec0207 7%, #eb0c19 14%, #ea213e 21%, #e92d54 28%, #e83d70 35%, #e74e8d 42%, #e560af 50%, #e74e8d 57%, #e83d70 64%, #e92d54 71%, #ea213e 78%, #eb0c19 85%, #ec0207 92%, #520002 100%)',
    'Secret': 'linear-gradient(135deg, #5a0000 0%, #450000 35%, #380000 65%, #2a0000 100%), radial-gradient(circle at 20% 30%, rgba(255,255,255,0.03) 0%, transparent 2%), radial-gradient(circle at 60% 70%, rgba(255,255,255,0.03) 0%, transparent 2%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.03) 0%, transparent 2%), radial-gradient(circle at 30% 80%, rgba(255,255,255,0.03) 0%, transparent 2%)',
    'Vanguard': 'linear-gradient(125deg, #0e7490 0%, #06b6d4 25%, #22d3ee 50%, #06b6d4 75%, #0e7490 100%)',
    'VsjwVanguard': 'linear-gradient(125deg, #2d1b4e 0%, #3d2663 6%, #4c2a7e 12%, #5b3599 18%, #6b3fae 24%, #7a4ac3 30%, #8a5dd8 36%, #9a71ed 42%, #a97bff 48%, #b88fff 54%, #c9a3ff 60%, #d9b7ff 66%, #e3cbff 72%, #ecdfff 78%, #f5ebff 84%, #faf5ff 90%, #ffffff 100%)',
    'RogitaVanguard': 'linear-gradient(125deg, #a16207 0%, #ca8a04 25%, #facc15 50%, #ca8a04 75%, #a16207 100%)',
    'IscanurVanguard': 'linear-gradient(125deg, #c2410c 0%, #f97316 25%, #fb923c 50%, #f97316 75%, #c2410c 100%)',
    'DivoloVanguard': 'linear-gradient(125deg, #7f1d1d 0%, #991b1b 25%, #dc2626 50%, #991b1b 75%, #7f1d1d 100%)',
    'KoguroVanguard': 'linear-gradient(125deg, #71717a 0%, #9ca3af 14%, #c0c7d1 28%, #d4dae3 42%, #e5ebf3 57%, #f0f4f8 71%, #f8fafc 85%, #ffffff 100%)',
    'BrolziVanguard': 'linear-gradient(125deg, #15803d 0%, #16a34a 25%, #4ade80 50%, #16a34a 75%, #15803d 100%)',
    'Unknown': '#3a3a3a'
  };

  // Special backgrounds for familiar-linked characters (extracted from familiar icons)
  const familiarBackgrounds = {
    'Valentine': 'linear-gradient(125deg, #ffffff 0%, #f0f9ff 6%, #e0f2fe 12%, #bae6fd 18%, #7dd3fc 24%, #38bdf8 30%, #0ea5e9 36%, #0284c7 42%, #0369a1 48%, #075985 54%, #0c4a6e 60%, #1e3a8a 66%, #1e40af 72%, #2563eb 78%, #3b82f6 84%, #60a5fa 90%, #93c5fd 100%)',
    'Gilgamesh': 'linear-gradient(125deg, #653702 0%, #a75b35 14%, #db8724 28%, #d3ac49 42%, #edc750 57%, #ffe16b 71%, #feff7b 85%, #ffffc3 100%)',
    'Tengon': 'linear-gradient(125deg, #3a1f14 0%, #4d2917 6%, #603419 12%, #734120 18%, #844e21 24%, #975d28 30%, #a36a2d 36%, #b07936 42%, #c58e3f 48%, #d9a54e 54%, #e9b558 60%, #f5c566 66%, #ffda7a 72%, #ffe491 78%, #ffeda8 84%, #fff6c0 90%, #ffffae 100%)',
    'Sukono': 'linear-gradient(125deg, #1a1718 0%, #2e1f29 14%, #462c3f 28%, #603e5b 42%, #7e537b 57%, #9e6e9e 71%, #c18ec2 85%, #eab2ea 100%)',
    'Obita': 'linear-gradient(125deg, #1f0e10 0%, #3a161e 14%, #59212f 28%, #792e43 42%, #9c3f5b 57%, #c15578 71%, #e7719a 85%, #ff93bc 100%)',
    'Gujo': 'linear-gradient(125deg, #0a1820 0%, #162f41 14%, #254963 28%, #376688 42%, #4e87af 57%, #6aacd7 71%, #8dd3ff 85%, #b7f8ff 100%)',
    'BrolziSuper': 'linear-gradient(125deg, #064e3b 0%, #065f46 14%, #047857 28%, #059669 42%, #10b981 57%, #34d399 71%, #6ee7b7 85%, #a7f3d0 100%)',
  };

  // Patch getBackgroundStyle to use dev override colors if available
  const getBackgroundStyle = (character) => {
    // Check for dev mode override background first
    if (devOverrides[character]?.customColor) {
      const gradient = devOverrides[character].customColor;
      const isSolidColor = gradient.startsWith('#');
      if (isSolidColor) {
        return { backgroundColor: gradient };
      }
      return {
        backgroundImage: gradient,
        backgroundSize: '200% 200%',
        backgroundPosition: '0% 0%'
      };
    }
    
    if (familiarBackgrounds[character]) {
      return {
        backgroundImage: familiarBackgrounds[character],
        backgroundSize: '200% 200%',
        backgroundPosition: '0% 0%'
      };
    }
    const rarity = getCharacterRarity(character);
    const badgeColor = getCharacterBadgeColor(character);
    const gradient = rarityBackgrounds[badgeColor] || rarityBackgrounds[rarity] || rarityBackgrounds['Unknown'];
    
    // Handle solid colors vs gradients
    const isSolidColor = gradient.startsWith('#');
    if (isSolidColor) {
      return {
        backgroundColor: gradient
      };
    }
    
    return {
      backgroundImage: gradient,
      backgroundSize: '200% 200%',
      backgroundPosition: '0% 0%'
    };
  };

  const getPlaceholderImage = (character) => {
    const initials = character.split(' ').map(word => word[0]).join('').slice(0, 2);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0ea5e9&color=fff&size=128&bold=true`;
  };

  const getCharacterImageUrl = (character) => {
    // Check if there's a custom uploaded image first
    if (images[character]) {
      return images[character];
    }
    // Try webp first, fallback to jpg
    const webpUrl = `${imageBaseUrl}Images/Units/${encodeURIComponent(character)}.webp`;
    const jpgUrl = `${imageBaseUrl}Images/Units/${encodeURIComponent(character)}.jpg`;
    
    // Return webp with jpg as fallback via onerror
    return webpUrl;
  };

  const getCharacterImageFallback = (character) => {
    return `${imageBaseUrl}Images/Units/${encodeURIComponent(character)}.jpg`;
  };

  const getGoogleImageSearchUrl = (character) => {
    return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent('anime vanguards ' + character)}`;
  };

  const getWikiUrl = (character) => {
    // Special mappings for specific characters that don't follow standard patterns
    const specialMappings = {
      // Units with custom pages
      'Vsjw': 'Units/Song_Jinwu_and_Igros',
      'Igros': 'Units/Song_Jinwu_and_Igros',
      
      // Super forms with special names
      'BrolziSuper': 'Brolzi_Super_(Wrathful)',
      'VogitaSuper': 'Vogita_Super_(Legendary)',
      'RogitaSuper': 'Rogita_Super_(Limit_Breaker)',
      'SuperVogito': 'Super_Vogito',
      
      // Evolved forms
      'VogitaEvolved': 'Vogita_(Evolved)',
      'BrolziEvolved': 'Brolzi_(Evolved)',
      
      // Other special cases
      'GrandpaVogita': 'Vogita_(Grandpa)',
      'SongJinwu': 'Song_Jinwu',
      'SmithJohn': 'Smith_John',
      'ChoyJongEn': 'Choy_Jong_En',
      'CuChulainn': 'Cu_Chulainn',
      'DarkMage': 'Dark_Mage',
      'GearBoy': 'Gear_Boy',
      'GiantQueen': 'Giant_Queen',
      'GoblinKiller': 'Goblin_Killer',
      'GodAboveHeaven': 'God_Above_Heaven',
      'GodStandless': 'God_Standless',
      'HarukaRin': 'Haruka_Rin',
      'KidBoo': 'Kid_Boo',
      'LordFriezo': 'Lord_Friezo',
      'LordofShadows': 'Lord_of_Shadows',
      'MonkeyKing': 'Monkey_King',
      'NotGoodGuy': 'Not_Good_Guy',
      'RomandRan': 'Romand_Ran',
      'TheFalcon': 'The_Falcon',
      'TheKing': 'The_King',
      'TheSmith': 'The_Smith',
      'TheStruggler': 'The_Struggler',
      'TheWitch': 'The_Witch',
      'ChaIn': 'Cha_In'
    };

    // Check if there's a special mapping first
    if (specialMappings[character]) {
      return `https://animevanguards.fandom.com/wiki/${specialMappings[character]}`;
    }

    // Insert spaces between lowercase followed by uppercase (e.g., aB -> a B)
    // This handles cases like "BrolziSuper" -> "Brolzi Super" if not in special mappings
    let formattedName = character.replace(/([a-z])([A-Z])/g, '$1 $2');
    
    // Replace spaces with underscores for URL
    formattedName = formattedName.replace(/\s+/g, '_');
    return `https://animevanguards.fandom.com/wiki/${encodeURIComponent(formattedName)}`;
  };

  const handleImageUpload = (character, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => ({ ...prev, [character]: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openModal = (character, e) => {
    if (e) e.stopPropagation();
    const currentTier = tiers.find(tier => 
      tierData[selectedCategory][tier].includes(character)
    );
    setSelectedUnit({ character, tier: currentTier || 'Unassigned' });
    const noteKey = `${selectedCategory}-${character}`;
    setCurrentNote(notes[noteKey] || '');
    setEditingName(character);
    setEditingRarity(getCharacterRarity(character));
    setEditingColor(getCharacterBadgeColor(character));
    setModalTab('info');
    setImageUrlInput('');
    setShowModal(true);
  };

  const saveNote = () => {
    if (selectedUnit) {
      const noteKey = `${selectedCategory}-${selectedUnit.character}`;
      setNotes(prev => ({ ...prev, [noteKey]: currentNote }));
    }
  };

  const saveTraits = (newTraits) => {
    if (selectedUnit) {
      setTraits(prev => ({
        ...prev,
        [selectedUnit.character]: newTraits
      }));
    }
  };

  const applyDevChanges = async () => {
    if (!selectedUnit || !devMode) return;
    
    const character = selectedUnit.character;
    const newRarity = editingRarity;
    const customColor = editingColor;
    
    // Store overrides in state and localStorage
    const overrides = { ...devOverrides };
    
    if (!overrides[character]) {
      overrides[character] = {};
    }
    
    let changesList = [];
    
    if (newRarity && newRarity !== getCharacterRarity(character)) {
      overrides[character].rarity = newRarity;
      changesList.push(`Rarity → ${newRarity}`);
    }
    
    if (customColor && customColor.trim()) {
      overrides[character].customColor = customColor.trim();
      changesList.push(`Custom background applied`);
    }
    
    // Apply immediately
    setDevOverrides(overrides);
    localStorage.setItem('devModeOverrides', JSON.stringify(overrides));
    
    if (changesList.length > 0) {
      alert(`✅ Changes applied instantly!\n\n${changesList.join('\n')}\n\nThese changes are stored in localStorage and will persist across sessions.\n\nNote: To make permanent source code changes, edit TierListApp.jsx manually.`);
      setShowModal(false);
    } else {
      alert('⚠️ No changes detected');
    }
  };
  
  const clearDevOverrides = () => {
    if (confirm('Clear all dev mode overrides? This will reset all custom edits.')) {
      setDevOverrides({});
      localStorage.removeItem('devModeOverrides');
      alert('✅ All dev overrides cleared!');
    }
  };

  const handleSetImageUrl = () => {
    if (imageUrlInput && imageUrlInput.trim() && selectedUnit) {
      setImages(prev => ({ ...prev, [selectedUnit.character]: imageUrlInput.trim() }));
      setImageUrlInput('');
    }
  };

  const handleDragStart = (e, character) => {
    e.dataTransfer.setData('character', character);
  };

  const handleDrop = (e, tier) => {
    e.preventDefault();
    const character = e.dataTransfer.getData('character');
    
    const dataToUpdate = isCustomMode ? customTierData : tierData;
    const setDataFunction = isCustomMode ? setCustomTierData : setTierData;
    
    setDataFunction(prev => {
      const newData = { ...prev };
      // Ensure category exists
      if (!newData[selectedCategory]) {
        newData[selectedCategory] = {};
        tiers.forEach(t => newData[selectedCategory][t] = []);
      }
      // Remove from all tiers in this category
      tiers.forEach(t => {
        if (!newData[selectedCategory][t]) newData[selectedCategory][t] = [];
        newData[selectedCategory][t] = newData[selectedCategory][t].filter(c => c !== character);
      });
      // Add to target tier
      if (!newData[selectedCategory][tier].includes(character)) {
        newData[selectedCategory][tier] = [...newData[selectedCategory][tier], character];
      }
      return newData;
    });
  };

  const handleDropOnAvailable = (e) => {
    e.preventDefault();
    const character = e.dataTransfer.getData('character');
    
    const setDataFunction = isCustomMode ? setCustomTierData : setTierData;
    
    // Remove from all tiers
    setDataFunction(prev => {
      const newData = { ...prev };
      if (newData[selectedCategory]) {
        tiers.forEach(t => {
          if (newData[selectedCategory][t]) {
            newData[selectedCategory][t] = newData[selectedCategory][t].filter(c => c !== character);
          }
        });
      }
      return newData;
    });
  };

  const generateShareableLink = () => {
    const tierlistData = {
      category: selectedCategory,
      tiers: tierData[selectedCategory],
      notes: notes,
      traits: traits,
      timestamp: new Date().toISOString(),
      version: "0.3"
    };
    
    // Encode data as base64
    const encoded = btoa(JSON.stringify(tierlistData));
    const currentUrl = window.location.origin + window.location.pathname;
    const shareLink = `${currentUrl}?tierlist=${encoded}`;
    
    setShareableLink(shareLink);
    setShowShareModal(true);
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareLink).then(() => {
      console.log('Link copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  // Trait rolling system
  const traitProbabilities = [
    { name: 'Vigor', chance: 26, color: '#9333ea' }, // Purple
    { name: 'Range', chance: 26, color: '#dc2626' }, // Red
    { name: 'Swift', chance: 26, color: '#2563eb' }, // Blue
    { name: 'Scholar', chance: 10, color: '#eab308' }, // Yellow
    { name: 'Marksman', chance: 6.5, color: '#eab308' }, // Yellow
    { name: 'Fortune', chance: 2.5, color: '#eab308' }, // Yellow
    { name: 'Blitz', chance: 1.85, color: '#eab308' }, // Yellow
    { name: 'Solar', chance: 0.5, color: 'rainbow' },
    { name: 'Deadeye', chance: 0.375, color: 'rainbow' },
    { name: 'Ethereal', chance: 0.175, color: 'rainbow' },
    { name: 'Monarch', chance: 0.1, color: 'rainbow' }
  ];

  const rollTrait = () => {
    if (isRolling || !calcSelectedUnit) return; // Prevent rolling during animation
    
    setIsRolling(true);
    
    const performRoll = () => {
      // Increment counters
      setTotalRolls(prev => prev + 1);
      const currentPity = unitPityCounters[calcSelectedUnit] || 0;
      const newPity = currentPity + 1;
      setUnitPityCounters(prev => ({ ...prev, [calcSelectedUnit]: newPity }));
      
      // Check if we hit pity (1500 rolls)
      if (newPity >= 1500) {
        const timestamp = new Date().toLocaleTimeString();
        const monarchTrait = { 
          name: 'Monarch (PITY)', 
          color: 'rainbow',
          time: timestamp
        };
        setUnitCurrentTraits(prev => ({ ...prev, [calcSelectedUnit]: monarchTrait }));
        setUnitTraitHistories(prev => ({ 
          ...prev, 
          [calcSelectedUnit]: [...(prev[calcSelectedUnit] || []), monarchTrait] 
        }));
        setUnitPityCounters(prev => ({ ...prev, [calcSelectedUnit]: 0 })); // Reset pity counter
        
        // Trigger mythic celebration
        setShowMythicCelebration(true);
        setTimeout(() => {
          setShowMythicCelebration(false);
          setIsRolling(false);
        }, 3000);
        return;
      }
      
      const random = Math.random() * 100;
      let cumulative = 0;
      
      // Filter probabilities based on toggles
      const activeProbabilities = traitProbabilities.filter(trait => {
        if (trait.color === 'rainbow') {
          return mythicTraitToggles[trait.name];
        }
        return true;
      });
      
      // Recalculate total probability
      const totalChance = activeProbabilities.reduce((sum, trait) => sum + trait.chance, 0);
      const adjustedRandom = (random * totalChance) / 100;
      
      cumulative = 0;
      for (const trait of activeProbabilities) {
        cumulative += trait.chance;
        if (adjustedRandom <= cumulative) {
          const timestamp = new Date().toLocaleTimeString();
          
          // Determine tier for Vigor, Range, and Swift (50% I, 35% II, 15% III)
          let traitName = trait.name;
          if (['Vigor', 'Range', 'Swift'].includes(trait.name)) {
            const tierRoll = Math.random() * 100;
            if (tierRoll < 50) {
              traitName = `${trait.name} I`;
            } else if (tierRoll < 85) {
              traitName = `${trait.name} II`;
            } else {
              traitName = `${trait.name} III`;
            }
          }
          
          const rolledTrait = { 
            name: traitName, 
            color: trait.color,
            time: timestamp
          };
          setUnitCurrentTraits(prev => ({ ...prev, [calcSelectedUnit]: rolledTrait }));
          setUnitTraitHistories(prev => ({ 
            ...prev, 
            [calcSelectedUnit]: [...(prev[calcSelectedUnit] || []), rolledTrait] 
          }));
          
          // Reset pity counter if Monarch is rolled
          if (trait.name === 'Monarch') {
            setUnitPityCounters(prev => ({ ...prev, [calcSelectedUnit]: 0 }));
          }
          
          // Check if we should continue rolling until Monarch
          if (rollUntilMonarch && trait.name !== 'Monarch') {
            setTimeout(performRoll, 100); // Roll again quickly
            return trait;
          }
          
          // Trigger mythic celebration ONLY for ultra-rare traits (under 1%)
          if (trait.color === 'rainbow' && trait.chance < 1) {
            setShowMythicCelebration(true);
            setTimeout(() => {
              setShowMythicCelebration(false);
              setIsRolling(false);
            }, 3000);
          } else {
            setIsRolling(false);
          }
          
          return trait;
        }
      }
      
      // Fallback to Vigor if something goes wrong
      const fallback = traitProbabilities[0];
      const timestamp = new Date().toLocaleTimeString();
      const rolledTrait = { 
        name: fallback.name, 
        color: fallback.color,
        time: timestamp
      };
      setCurrentTrait(rolledTrait);
      setTraitHistory(prev => [...prev, rolledTrait]);
      setIsRolling(false);
      return fallback;
    };
    
    performRoll();
  };

  const instantMonarchRoll = () => {
    if (isRolling || !calcSelectedUnit) return;
    setIsRolling(true);

    // Check if Monarch is toggled off
    if (!mythicTraitToggles['Monarch']) {
      alert('Monarch must be enabled in Mythic Toggles to use Instant Monarch Roll!');
      setIsRolling(false);
      return;
    }

    // Calculate how many rolls it would take
    const monarchProbability = 0.1; // 0.1% chance
    let rollsNeeded = 0;
    let hitMonarch = false;
    
    // Simulate rolls until Monarch or pity
    const currentPity = unitPityCounters[calcSelectedUnit] || 0;
    const rollsUntilPity = 1500 - currentPity;
    
    // Try to roll Monarch naturally first
    while (!hitMonarch && rollsNeeded < rollsUntilPity) {
      rollsNeeded++;
      const random = Math.random() * 100;
      if (random <= monarchProbability) {
        hitMonarch = true;
        break;
      }
    }

    // If didn't hit naturally, use pity
    const isPity = !hitMonarch;
    if (isPity) {
      rollsNeeded = rollsUntilPity;
    }

    // Update counters
    setTotalRolls(prev => prev + rollsNeeded);
    setUnitPityCounters(prev => ({ ...prev, [calcSelectedUnit]: 0 })); // Reset pity since we got Monarch

    // Create the Monarch trait
    const timestamp = new Date().toLocaleTimeString();
    const monarchTrait = { 
      name: isPity ? `Monarch (PITY after ${rollsNeeded} rolls)` : `Monarch (after ${rollsNeeded} roll${rollsNeeded > 1 ? 's' : ''})`, 
      color: 'rainbow',
      time: timestamp
    };
    
    setUnitCurrentTraits(prev => ({ ...prev, [calcSelectedUnit]: monarchTrait }));
    setUnitTraitHistories(prev => ({ 
      ...prev, 
      [calcSelectedUnit]: [...(prev[calcSelectedUnit] || []), monarchTrait] 
    }));

    // Trigger mythic celebration
    setShowMythicCelebration(true);
    setTimeout(() => {
      setShowMythicCelebration(false);
      setIsRolling(false);
    }, 3000);
  };

  const getTraitColor = (color) => {
    if (color === 'rainbow') {
      return 'background: linear-gradient(90deg, #ef4444, #f59e0b, #eab308, #22c55e, #3b82f6, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;';
    }
    return `color: ${color};`;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const getUnassignedCharacters = () => {
    const assigned = new Set();
    const dataToUse = isCustomMode ? customTierData : tierData;
    
    if (dataToUse[selectedCategory]) {
      tiers.forEach(tier => {
        if (dataToUse[selectedCategory][tier]) {
          dataToUse[selectedCategory][tier].forEach(char => assigned.add(char));
        }
      });
    }
    return characters.filter(c => !assigned.has(c));
  };

  const tierColors = {
    'High Tier Meta': 'from-cyan-500 to-blue-600',
    'Meta': 'from-blue-500 to-indigo-600',
    'Low Tier Meta': 'from-indigo-500 to-purple-600',
    'Good': 'from-teal-500 to-cyan-600',
    'Mid': 'from-slate-500 to-slate-600',
    'Bad': 'from-gray-600 to-gray-700'
  };

  const tierBorders = {
    'High Tier Meta': 'border-cyan-400',
    'Meta': 'border-blue-400',
    'Low Tier Meta': 'border-indigo-400',
    'Good': 'border-teal-400',
    'Mid': 'border-slate-400',
    'Bad': 'border-gray-500'
  };

  const CharacterCard = ({ character, showUpload = true, traitIcon = null, onClickOverride = null }) => {
    const hasCustomImage = images[character];
    const [imgError, setImgError] = useState(false);
    const [imgFallback, setImgFallback] = useState(false);
    const displayImage = imgError ? getPlaceholderImage(character) : getCharacterImageUrl(character);

    const familiarName = getFamiliarFor(character);
    const familiarImage = familiarName ? getFamiliarIconUrl(familiarName) : null;
    const [familiarError, setFamiliarError] = useState(false);
    const [traitError, setTraitError] = useState(false);
    
    // Get background based on rarity or familiar - use getBackgroundStyle function
    const backgroundStyle = getBackgroundStyle(character);
    
    // Check rarity for special effects
    const rarity = getCharacterRarity(character);
    const isVanguard = rarity === 'Vanguard';
    const isMythic = rarity === 'Mythic';
    const isExclusive = rarity === 'Exclusive';
    
    // Get specific Vanguard character effects
    const vanguardEffects = {
      'Vsjw': 'shadow',
      'Divalo': 'scythe',
      'Iscanur': 'flame',
      'Koguro': 'ice-fire',
      'Rogita': 'aura-yellow',
      'BrolziSuper': 'aura-green'
    };
    const vanguardEffect = isVanguard ? vanguardEffects[character] : null;

    return (
      <div className="group">
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, character)}
          onClick={(e) => onClickOverride ? onClickOverride(e) : openModal(character, e)}
          className="relative cursor-pointer transition-all duration-200 hover:scale-110"
        >
          {/* Vsjw - Shadowy effects */}
          {vanguardEffect === 'shadow' && (
            <>
              <div 
                className="absolute inset-[-8px] rounded-xl pointer-events-none z-10"
                style={{
                  background: 'radial-gradient(circle, rgba(75, 0, 130, 0.6), rgba(25, 0, 51, 0.4), transparent 70%)',
                  animation: 'shadowPulse 3s ease-in-out infinite',
                  filter: 'blur(12px)'
                }}
              />
              <div 
                className="absolute inset-[-4px] rounded-xl pointer-events-none z-10"
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(75, 0, 130, 0.8) 50%, transparent 70%)',
                  backgroundSize: '200% 200%',
                  animation: 'shadowWave 2s linear infinite'
                }}
              />
            </>
          )}
          
          {/* Divalo - Scythe behind border */}
          {vanguardEffect === 'scythe' && (
            <>
              <div 
                className="absolute inset-[-6px] rounded-xl pointer-events-none z-10"
                style={{
                  background: 'radial-gradient(circle, rgba(185, 28, 28, 0.4) 0%, rgba(220, 38, 38, 0.2) 50%, transparent 70%)',
                  animation: 'scytheGlow 2s ease-in-out infinite',
                  filter: 'blur(8px)'
                }}
              />
              <div 
                className="absolute inset-[-6px] rounded-xl pointer-events-none z-11 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, 
                    transparent 0%, 
                    transparent 45%,
                    rgba(220, 38, 38, 0) 47%,
                    rgba(239, 68, 68, 0.9) 49%,
                    rgba(248, 113, 113, 1) 50%,
                    rgba(239, 68, 68, 0.9) 51%,
                    rgba(220, 38, 38, 0) 53%,
                    transparent 55%,
                    transparent 100%)`,
                  backgroundSize: '300% 300%',
                  animation: 'scytheSlash 4s ease-in-out infinite',
                  filter: 'drop-shadow(0 0 10px rgba(248, 113, 113, 1)) drop-shadow(0 0 20px rgba(220, 38, 38, 0.8))',
                  opacity: 0
                }}
              />
            </>
          )}
          
          {/* Iscanur - Flaming border */}
          {vanguardEffect === 'flame' && (
            <>
              <div 
                className="absolute inset-[-6px] rounded-xl pointer-events-none z-10"
                style={{
                  background: 'linear-gradient(0deg, rgba(251, 146, 60, 0.8), rgba(249, 115, 22, 0.6), rgba(234, 88, 12, 0.4), transparent)',
                  animation: 'flameFlicker 0.3s ease-in-out infinite alternate'
                }}
              />
              <div 
                className="absolute inset-[-8px] rounded-xl pointer-events-none z-9"
                style={{
                  background: 'radial-gradient(circle, rgba(249, 115, 22, 0.6) 0%, rgba(234, 88, 12, 0.3) 50%, transparent 70%)',
                  animation: 'flameGlow 1.5s ease-in-out infinite',
                  filter: 'blur(8px)'
                }}
              />
            </>
          )}
          
          {/* Koguro - Ice-Fire transition */}
          {vanguardEffect === 'ice-fire' && (
            <div 
              className="absolute inset-[-5px] rounded-xl pointer-events-none z-10"
              style={{
                background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.8), rgba(147, 197, 253, 0.6), rgba(251, 146, 60, 0.6), rgba(249, 115, 22, 0.8))',
                backgroundSize: '300% 100%',
                animation: 'iceFire 3s ease-in-out infinite',
                filter: 'blur(3px)'
              }}
            />
          )}
          
          {/* Rogita - Yellow/Gold Super Saiyan aura */}
          {vanguardEffect === 'aura-yellow' && (
            <>
              <div 
                className="absolute inset-[-10px] rounded-xl pointer-events-none z-10"
                style={{
                  background: 'radial-gradient(circle, rgba(250, 204, 21, 0.7) 0%, rgba(234, 179, 8, 0.5) 40%, transparent 70%)',
                  animation: 'auraFlicker 0.15s ease-in-out infinite',
                  filter: 'blur(6px)'
                }}
              />
              <div 
                className="absolute inset-[-6px] rounded-xl pointer-events-none z-11"
                style={{
                  background: 'linear-gradient(45deg, transparent, rgba(250, 204, 21, 0.4), transparent)',
                  backgroundSize: '200% 200%',
                  animation: 'auraWave 1s linear infinite'
                }}
              />
            </>
          )}
          
          {/* BrolziSuper - Green Super Saiyan aura */}
          {vanguardEffect === 'aura-green' && (
            <>
              <div 
                className="absolute inset-[-10px] rounded-xl pointer-events-none z-10"
                style={{
                  background: 'radial-gradient(circle, rgba(34, 197, 94, 0.7) 0%, rgba(22, 163, 74, 0.5) 40%, transparent 70%)',
                  animation: 'auraFlicker 0.15s ease-in-out infinite',
                  filter: 'blur(6px)'
                }}
              />
              <div 
                className="absolute inset-[-6px] rounded-xl pointer-events-none z-11"
                style={{
                  background: 'linear-gradient(45deg, transparent, rgba(34, 197, 94, 0.4), transparent)',
                  backgroundSize: '200% 200%',
                  animation: 'auraWave 1s linear infinite'
                }}
              />
            </>
          )}
          
          {/* Animated particles for Mythic units */}
          {isMythic && (
            <div 
              className="absolute inset-[-4px] rounded-xl pointer-events-none z-10 overflow-hidden"
              style={{
                background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
                backgroundSize: '200% 200%',
                animation: 'mythicShimmer 2s linear infinite'
              }}
            />
          )}
          
          {/* Pulsing glow for Exclusive units */}
          {isExclusive && (
            <div 
              className="absolute inset-[-5px] rounded-xl pointer-events-none z-10"
              style={{
                background: 'radial-gradient(circle, rgba(236, 2, 7, 0.6), transparent 70%)',
                animation: 'exclusivePulse 2s ease-in-out infinite',
                filter: 'blur(8px)'
              }}
            />
          )}
          
          <div
            className="w-20 h-20 rounded-xl overflow-hidden shadow-2xl relative z-20"
            style={{
              ...backgroundStyle,
              border: '3px solid',
              borderImageSlice: 1,
              borderImageSource: backgroundStyle.backgroundImage,
              boxShadow: isMythic
                ? '0 0 20px rgba(34, 211, 238, 0.6), 0 0 40px rgba(34, 211, 238, 0.3), inset 0 0 30px rgba(0,0,0,0.6)'
                : isExclusive
                ? '0 0 20px rgba(236, 2, 7, 0.6), 0 0 40px rgba(236, 2, 7, 0.3), inset 0 0 30px rgba(0,0,0,0.6)'
                : '0 0 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.4), inset 0 0 30px rgba(0,0,0,0.6)',
            }}
          >
            <img 
              src={displayImage} 
              alt={character}
              crossOrigin="anonymous"
              onError={(e) => {
                if (!imgFallback) {
                  e.target.src = getCharacterImageFallback(character);
                  setImgFallback(true);
                } else {
                  setImgError(true);
                }
              }}
              className="relative z-20 w-full h-full object-contain opacity-95 mix-blend-normal"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 z-25"></div>
            {/* Familiar overlay */}
            {familiarImage && !familiarError && (
              <img
                src={familiarImage}
                alt={`${character} Familiar`}
                crossOrigin="anonymous"
                onError={() => setFamiliarError(true)}
                className="absolute bottom-0 right-0 w-8 h-8 object-cover rounded-tl-lg z-30"
              />
            )}
            {/* Trait icon overlay */}
            {traitIcon && !traitError && (
              <img
                src={`${imageBaseUrl}Images/Trait Icons/${traitIcon.name.split(' ')[0]}.webp`}
                alt={traitIcon.name}
                crossOrigin="anonymous"
                onError={() => setTraitError(true)}
                className="absolute top-0 right-0 w-8 h-8 object-cover rounded-bl-lg z-30"
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-80 transition-all duration-200 flex items-center justify-center p-1 z-40">
              <span className="text-xs text-white text-center leading-tight font-medium opacity-0 group-hover:opacity-100">
                {formatCharacterName(character)}
              </span>
            </div>
          </div>
        </div>
        {showUpload && (
          <div className="flex gap-1 mt-2 justify-center">
            <a
              href={getWikiUrl(character)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center text-xs text-blue-300 hover:text-blue-200 px-2 py-1 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all"
              title="View on Wiki"
            >
              <Search size={12} />
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen p-2 sm:p-4 lg:p-6 relative"
      style={{
        backgroundImage: `url('${imageBaseUrl}Images/backgrounds/bgs/${encodeURIComponent(currentBackground)}')`,
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        transition: 'background-image 0.5s ease-in-out'
      }}
    >
      {/* Dynamic themed overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 transition-all duration-500"
        style={{
          background: currentTheme.overlay
        }}
      />
      
      {/* Custom CSS for themed glass elements */}
      <style>{`
        .glass {
          background: linear-gradient(135deg, ${currentTheme.glass}, ${currentTheme.primary}, ${currentTheme.secondary}) !important;
          backdrop-filter: blur(20px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow: 
            0 8px 32px 0 rgba(0, 0, 0, 0.37), 
            inset 0 1px 2px rgba(255, 255, 255, 0.2),
            inset 0 -1px 2px rgba(0, 0, 0, 0.2);
          transition: all 0.5s ease-in-out;
          position: relative;
        }
        
        .glass::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), transparent);
          border-radius: inherit;
          pointer-events: none;
        }
        
        .glass-card {
          background: linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary}, ${currentTheme.accent}40) !important;
          backdrop-filter: blur(12px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow: 
            0 4px 20px 0 rgba(0, 0, 0, 0.35), 
            inset 0 1px 2px rgba(255, 255, 255, 0.2),
            0 0 40px ${currentTheme.accent}20;
          transition: all 0.3s ease-in-out;
          position: relative;
        }
        
        .glass-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 40%;
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.15), transparent);
          border-radius: inherit;
          pointer-events: none;
        }
        
        .glass-hover:hover {
          background: linear-gradient(135deg, ${currentTheme.accent}60, ${currentTheme.primary}, ${currentTheme.secondary}) !important;
          border-color: ${currentTheme.accent};
          box-shadow: 
            0 12px 32px 0 rgba(0, 0, 0, 0.45), 
            0 0 30px ${currentTheme.accent}60,
            inset 0 1px 2px rgba(255, 255, 255, 0.3);
          transform: translateY(-3px) scale(1.02);
        }
        
        .bg-cyan-600 {
          background: linear-gradient(135deg, ${currentTheme.accent}, ${currentTheme.secondary}) !important;
          box-shadow: 0 4px 16px ${currentTheme.accent}60;
        }
        
        button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }
        
        button:hover::before {
          left: 100%;
        }
        
        button:active {
          transform: scale(0.95);
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: ${currentTheme.glass};
          border-radius: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, ${currentTheme.accent}, ${currentTheme.secondary});
          border-radius: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, ${currentTheme.secondary}, ${currentTheme.primary});
        }
      `}</style>
      {currentView === 'menu' ? (
        <div className={`flex flex-col min-h-screen ${isTransitioning ? 'page-transition-exit' : 'page-transition-enter'} relative`}>
          {/* Feedback Links - Top Left */}
          <div className="absolute top-2 sm:top-4 lg:top-6 left-2 sm:left-4 lg:left-6 flex flex-col sm:flex-row gap-2 sm:gap-3 z-50">
            <a
              href="https://docs.google.com/forms/d/1u4aCoOpiv3L7Z6QCHgzH6thwwWdEeZNI320oBcOgZCQ/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold text-red-400 hover:text-red-300 glass-hover transition-all flex items-center gap-1 sm:gap-2"
            >
              🐛 <span className="hidden sm:inline">Bug Reports</span><span className="sm:hidden">Bugs</span>
            </a>
            <a
              href="https://docs.google.com/forms/d/1EdYUAhXflSGNc8IhE0DvawsVA5GraZ8dFmWbMO3vK6s/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold text-blue-400 hover:text-blue-300 glass-hover transition-all flex items-center gap-1 sm:gap-2"
            >
              💡 <span className="hidden sm:inline">Suggestions</span><span className="sm:hidden">Ideas</span>
            </a>
            <button
              onClick={() => setShowGuideModal(true)}
              className="glass-card px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold hover:text-white glass-hover transition-all flex items-center gap-1 sm:gap-2"
              style={{ color: currentTheme.accent }}
            >
              📖 Guide
            </button>
            <a
              href="https://github.com/hawktuahcoin-hurhur"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold text-purple-400 hover:text-purple-300 glass-hover transition-all flex items-center gap-1 sm:gap-2"
            >
              🔗 Github
            </a>
          </div>

          {/* Audio Player - Loops Continuously */}
          <audio 
            id="background-audio"
            autoPlay 
            loop
            onError={(e) => console.error('Audio error:', e)}
          >
            <source src={`${imageBaseUrl}Images/music/videoplayback.mp4`} type="video/mp4" />
          </audio>

          {/* Title at Top */}
          <div className="text-center mb-4 sm:mb-6 relative pt-4 sm:pt-8 px-2">
            <h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-2 sm:mb-3 lg:mb-4 transition-all duration-500"
              style={{
                color: currentTheme.accent,
                textShadow: `0 0 40px ${currentTheme.accent}80, 0 0 20px ${currentTheme.accent}60`
              }}
            >
              Anime Vanguards
            </h1>
            <p 
              className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 transition-all duration-500"
              style={{ color: currentTheme.accent }}
            >
              Tier List Creator
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-slate-400">Update 9 Anniversary • {characters.length} Units</p>
            
            {/* Video Player - Center Right */}
            <div className="hidden xl:flex absolute top-0 right-[280px] flex-col gap-2">
              <video 
                className="w-64 rounded-xl shadow-2xl border-2 border-opacity-50 transition-all duration-300 hover:scale-105"
                style={{ 
                  borderColor: currentTheme.accent,
                  boxShadow: `0 0 30px ${currentTheme.accent}40`
                }}
                autoPlay 
                loop 
                muted
                playsInline
                controls={false}
                onError={(e) => console.error('Video error:', e)}
              >
                <source src={`${imageBaseUrl}Images/music/videoplayback.mp4`} type="video/mp4" />
              </video>
              
              {/* Audio Control Button */}
              <button
                onClick={() => {
                  const audio = document.getElementById('background-audio');
                  if (audio) {
                    if (audioMuted) {
                      audio.play();
                      setAudioMuted(false);
                    } else {
                      audio.pause();
                      setAudioMuted(true);
                    }
                  }
                }}
                className="glass-card px-3 py-2 rounded-lg text-sm font-semibold glass-hover transition-all text-center"
                style={{ color: currentTheme.accent }}
              >
                {audioMuted ? '🔇 Unmute' : '🔊 Mute'}
              </button>
            </div>
            
            {/* Dev Mode Toggles */}
            <div className="absolute top-2 sm:top-0 right-2 sm:right-0 flex flex-col gap-1 sm:gap-2">
              <button
                onClick={() => setDevMode(!devMode)}
                className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-md sm:rounded-lg text-xs sm:text-sm lg:text-base font-semibold transition-all ${devMode ? 'bg-purple-600 bg-opacity-80 backdrop-blur-lg text-white ring-2 ring-purple-400 shadow-lg shadow-purple-500/50' : 'glass-card text-slate-300 hover:text-white glass-hover'}`}
              >
                🔧 {devMode ? <><span className="hidden sm:inline">Dev Mode </span>ON</> : <span className="hidden sm:inline">Dev Mode</span>}
              </button>
              
              {devMode && (
                <button
                  onClick={() => {
                    if (advancedDevMode) {
                      setAdvancedDevMode(false);
                    } else {
                      setShowApiKeyPrompt(true);
                    }
                  }}
                  className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all ${advancedDevMode ? 'bg-red-600 bg-opacity-80 backdrop-blur-lg text-white ring-2 ring-red-400 shadow-lg shadow-red-500/50' : 'glass-card text-slate-300 hover:text-white glass-hover'}`}
                >
                  {advancedDevMode ? '⚠️ Advanced Mode ON' : '⚠️ Advanced Mode'}
                </button>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 flex-1 overflow-auto">
            {/* Left Sidebar - Tier List Categories */}
            <div className="w-full lg:w-72 flex-shrink-0 flex flex-col">
              <div className="glass rounded-xl p-3 lg:p-4 mb-3 backdrop-blur-xl">
                <h3 className="text-cyan-400 font-bold text-base lg:text-lg mb-0.5">Tier Lists</h3>
                <p className="text-slate-400 text-xs">Select category</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-col gap-2 lg:gap-3">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => changeView('tierlist', cat)}
                    className="group glass-card rounded-lg p-3 lg:p-4 hover:border-cyan-500 glass-hover transition-all duration-300 text-left"
                  >
                    <div className="flex items-center gap-2 lg:gap-3">
                      <div className="text-xl lg:text-2xl">
                        {cat === 'General Use' && '⚔️'}
                        {cat === 'Pure DPS' && '💥'}
                        {cat === 'Support (Buffs)' && '✨'}
                        {cat === 'Support (Debuffs)' && '🌀'}
                        {cat === 'Crowd Control' && '❄️'}
                        {cat === 'Boss Killing' && '👑'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs md:text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {cat}
                        </h3>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Disclaimer */}
              <div className="glass-card rounded-lg p-3 mt-4 border-2 border-yellow-600 border-opacity-40">
                <p className="text-yellow-300 text-xs leading-relaxed">
                  <strong>💡 Note:</strong> Enable <span className="text-yellow-200 font-semibold">Dev Mode</span> to edit unit notes, custom images, and tier list details.
                </p>
              </div>
            </div>

            {/* Center - Patch Notes */}
            <div className="flex-1 flex items-center justify-center px-2 sm:px-4">
              <div className="glass-card rounded-xl p-4 lg:p-6 backdrop-blur-xl w-full max-w-md h-[400px] sm:h-[500px] lg:h-[600px] flex flex-col">
                <h3 className="text-cyan-400 font-bold text-lg sm:text-xl lg:text-2xl mb-2 text-center flex items-center justify-center gap-2">
                  <span className="text-2xl lg:text-3xl">📜</span> Patch Notes
                </h3>
                <p className="text-slate-400 text-xs text-center mb-4">Latest Updates</p>
                
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                  {patchNotes.map((patch, index) => (
                    <div key={index} className="glass rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-bold text-white">
                          {patch.name} <span className="text-cyan-400">v{patch.version}</span>
                        </h4>
                        <span className="text-xs text-slate-500">{patch.date}</span>
                      </div>
                      <ul className="space-y-1">
                        {patch.changes.map((change, changeIndex) => (
                          <li key={changeIndex} className="text-sm text-slate-300 flex gap-2">
                            <span className="text-cyan-400">•</span>
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Unit List */}
            <div className="w-72 flex-shrink-0 flex flex-col gap-4 items-start h-full">
              <button
                onClick={() => changeView('unitlist')}
                className="group w-full glass-card rounded-xl p-4 md:p-6 lg:p-8 hover:border-indigo-500 glass-hover transition-all duration-300 flex flex-col items-center justify-center gap-3 md:gap-4 lg:gap-6 flex-1"
              >
                <div className="text-5xl md:text-6xl lg:text-8xl">📋</div>
                <div className="text-center">
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 md:mb-2 group-hover:text-indigo-400 transition-colors">
                    Unit List
                  </h3>
                  <p className="text-xs md:text-sm lg:text-base text-slate-400 group-hover:text-slate-300 transition-colors">
                    Browse all {characters.length} units
                  </p>
                </div>
              </button>
              
              <button
                onClick={() => changeView('traitcalc')}
                className="group w-full glass-card rounded-xl p-4 md:p-6 lg:p-8 hover:border-purple-500 glass-hover transition-all duration-300 flex flex-col items-center justify-center gap-3 md:gap-4 lg:gap-6 flex-1"
              >
                <div className="text-5xl md:text-6xl lg:text-8xl">🎲</div>
                <div className="text-center">
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 md:mb-2 group-hover:text-purple-400 transition-colors">
                    Trait Roller
                  </h3>
                  <p className="text-xs md:text-sm lg:text-base text-slate-400 group-hover:text-slate-300 transition-colors">
                    Roll for trait bonuses
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      ) : currentView === 'traitcalc' ? (
        <div className={`w-full h-screen px-2 sm:px-4 lg:px-8 py-3 sm:py-4 ${isTransitioning ? 'page-transition-exit' : 'page-transition-enter'}`}>
          <div className="text-center mb-4 sm:mb-6 relative pt-12 sm:pt-0">
            <button
              onClick={() => changeView('menu')}
              className="absolute top-0 left-0 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all flex items-center gap-2"
            >
              ← <span className="hidden sm:inline">Back to Menu</span><span className="sm:hidden">Menu</span>
            </button>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-600 mb-2 sm:mb-3">
              🎲 Trait Roller
            </h1>
            <p className="text-sm sm:text-base lg:text-xl text-slate-300">Roll for trait bonuses on your units</p>
          </div>

          <div className="glass rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-8 shadow-2xl overflow-auto">
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 min-h-[600px] lg:h-[calc(100vh-200px)]">
              {/* Far left - Unit images grid */}
              <div className="w-64 flex flex-col">
                {/* Search box */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={unitSearchQuery}
                    onChange={(e) => setUnitSearchQuery(e.target.value)}
                    className="w-full glass-card text-slate-200 text-sm pl-10 pr-3 py-2 rounded-lg bg-slate-900 bg-opacity-80 border-2 border-slate-700 focus:border-purple-600 focus:outline-none transition-all"
                  />
                </div>

                {/* Unit images grid */}
                <div className="glass-card rounded-xl p-3 flex-1 overflow-y-auto scrollbar-thin bg-slate-900 bg-opacity-80">
                  <div className="grid grid-cols-3 gap-2">
                    {characters
                      .filter(char => char.toLowerCase().includes(unitSearchQuery.toLowerCase()))
                      .map(character => (
                        <div
                          key={character}
                          className={`transition-all rounded-lg overflow-hidden ${
                            calcSelectedUnit === character
                              ? 'ring-2 ring-purple-500 scale-105'
                              : ''
                          }`}
                        >
                          <CharacterCard 
                            character={character} 
                            showUpload={false}
                            onClickOverride={(e) => {
                              e.stopPropagation();
                              setTraitRollerChoiceUnit(character);
                            }}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Middle - Unit display and history */}
              <div className="flex-1 flex flex-col gap-3 lg:gap-4">
                {/* Top - Selected unit with name and trait */}
                <div className="glass-card rounded-xl p-3 lg:p-4 bg-slate-900 bg-opacity-80">
                  {calcSelectedUnit ? (
                    <div className="flex flex-col sm:flex-row items-center gap-3 lg:gap-4">
                      <div className="scale-125 sm:scale-150 origin-center sm:origin-left">
                        <CharacterCard character={calcSelectedUnit} showUpload={false} traitIcon={unitCurrentTraits[calcSelectedUnit]} />
                      </div>
                      <div className="flex-1 sm:ml-4 lg:ml-8 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full">
                        <input
                          type="text"
                          value={calcSelectedUnit}
                          readOnly
                          className="w-full sm:w-48 glass-card text-white text-sm px-4 py-2 rounded-xl bg-slate-900 bg-opacity-70 font-medium text-center sm:text-left"
                        />
                        {unitCurrentTraits[calcSelectedUnit] && (
                          <div className="flex items-center justify-center gap-2 sm:gap-4 glass-card px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-slate-900 bg-opacity-70 flex-1">
                            <span 
                              className="text-lg sm:text-xl lg:text-2xl font-bold"
                              style={unitCurrentTraits[calcSelectedUnit].color === 'rainbow' ? {
                                background: 'linear-gradient(90deg, #ef4444, #f59e0b, #eab308, #22c55e, #3b82f6, #a855f7, #ec4899)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                              } : { color: unitCurrentTraits[calcSelectedUnit].color }}
                            >
                              {unitCurrentTraits[calcSelectedUnit].name}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Confetti effect for mythic traits */}
                      {showMythicCelebration && (
                        <div className="confetti-container">
                          {[...Array(50)].map((_, i) => (
                            <div
                              key={i}
                              className="confetti"
                              style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 0.5}s`,
                                animationDuration: `${1 + Math.random() * 2}s`,
                                backgroundColor: ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'][Math.floor(Math.random() * 7)]
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 py-8 text-lg">
                      No unit selected
                    </div>
                  )}
                </div>

                {/* Bottom - Trait History */}
                <div className="glass-card rounded-xl p-3 lg:p-4 flex-1 overflow-y-auto scrollbar-thin bg-slate-900 bg-opacity-80 flex flex-col-reverse max-h-[400px] lg:max-h-none">
                  {!calcSelectedUnit || !(unitTraitHistories[calcSelectedUnit]?.length > 0) ? (
                    <div className="text-slate-500 text-sm lg:text-base text-center py-6 lg:py-8">
                      {!calcSelectedUnit ? 'No unit selected' : 'No traits rolled yet'}
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 flex flex-col-reverse">
                        {unitTraitHistories[calcSelectedUnit].map((trait, index) => (
                          <div key={index} className="glass rounded-lg p-2 lg:p-3 flex items-center gap-2 lg:gap-3 bg-slate-800 bg-opacity-60">
                            <img 
                              src={`${imageBaseUrl}Images/Trait Icons/${trait.name.split(' ')[0]}.webp`}
                              alt={trait.name}
                              className="w-8 h-8 sm:w-10 sm:h-10"
                            />
                            <span 
                              className="text-base lg:text-lg font-bold"
                              style={trait.color === 'rainbow' ? {
                                background: 'linear-gradient(90deg, #ef4444, #f59e0b, #eab308, #22c55e, #3b82f6, #a855f7, #ec4899)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                              } : { color: trait.color }}
                            >
                              {trait.name}
                            </span>
                            <span className="text-slate-500 text-sm ml-auto">{trait.time}</span>
                          </div>
                        ))}
                      </div>
                      <h4 className="text-slate-200 font-bold text-xl mb-3">Trait History</h4>
                    </>
                  )}
                </div>
              </div>

              {/* Far right - Toggles and roll button */}
              <div className="w-full lg:w-80 flex flex-col gap-3 lg:gap-4">
                {/* Roll Counters */}
                <div className="glass-card rounded-xl p-3 lg:p-4 bg-slate-900 bg-opacity-80 border-2 border-slate-700">
                  <h4 className="text-slate-200 font-bold text-base lg:text-lg mb-2 lg:mb-3">Roll Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 text-sm">Total Rolls:</span>
                      <span className="text-purple-400 font-bold text-lg">{totalRolls}</span>
                    </div>
                    {calcSelectedUnit && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 text-sm">Pity Counter:</span>
                          <span className="text-yellow-400 font-bold text-lg">{unitPityCounters[calcSelectedUnit] || 0} / 1500</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-yellow-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((unitPityCounters[calcSelectedUnit] || 0) / 1500) * 100}%` }}
                          ></div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Mythic trait toggles */}
                <div className="glass-card rounded-xl p-3 lg:p-4 bg-slate-900 bg-opacity-80 border-2 border-slate-700">
                  <h4 className="text-slate-200 font-bold text-base lg:text-lg mb-2 lg:mb-3">Mythic Toggles</h4>
                  <div className="grid grid-cols-4 sm:grid-cols-2 gap-2">
                    {['Solar', 'Deadeye', 'Ethereal', 'Monarch'].map(traitName => (
                      <div
                        key={traitName}
                        onClick={() => setMythicTraitToggles(prev => ({
                          ...prev,
                          [traitName]: !prev[traitName]
                        }))}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border-2 ${
                          mythicTraitToggles[traitName]
                            ? 'bg-purple-900 bg-opacity-40 border-purple-700'
                            : 'bg-slate-800 bg-opacity-30 border-slate-600 opacity-50'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          mythicTraitToggles[traitName]
                            ? 'bg-purple-700 border-purple-600'
                            : 'border-slate-600'
                        }`}>
                          {mythicTraitToggles[traitName] && (
                            <span className="text-white text-xs font-bold">✓</span>
                          )}
                        </div>
                        <img 
                          src={`${imageBaseUrl}Images/Trait Icons/${traitName}.webp`}
                          alt={traitName}
                          className="w-6 h-6"
                        />
                        <span 
                          className="text-xs font-bold"
                          style={{
                            background: 'linear-gradient(90deg, #ef4444, #f59e0b, #eab308, #22c55e, #3b82f6, #a855f7, #ec4899)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}
                        >
                          {traitName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Roll until Monarch toggle */}
                <div 
                  onClick={() => setRollUntilMonarch(!rollUntilMonarch)}
                  className={`glass-card rounded-xl p-4 cursor-pointer transition-all border-2 ${
                    rollUntilMonarch
                      ? 'bg-purple-900 bg-opacity-40 border-purple-700'
                      : 'bg-slate-900 bg-opacity-80 border-slate-700 hover:border-purple-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                      rollUntilMonarch
                        ? 'bg-purple-700 border-purple-600'
                        : 'border-slate-600'
                    }`}>
                      {rollUntilMonarch && (
                        <span className="text-white text-sm font-bold">✓</span>
                      )}
                    </div>
                    <span className="text-slate-200 font-bold text-sm">Roll Until Monarch</span>
                  </div>
                </div>

                {/* Instant Monarch Roll button */}
                <button
                  onClick={instantMonarchRoll}
                  disabled={isRolling || !calcSelectedUnit}
                  className={`glass-card rounded-xl p-3 lg:p-4 transition-all border-2 min-h-[50px] ${
                    isRolling || !calcSelectedUnit
                      ? 'opacity-50 cursor-not-allowed border-slate-600 bg-slate-800'
                      : 'cursor-pointer border-yellow-600 bg-gradient-to-br from-yellow-900 via-amber-900 to-yellow-900 hover:border-yellow-500 hover:shadow-xl hover:shadow-yellow-500/30 transform hover:scale-105 active:scale-95'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl lg:text-2xl">⚡</span>
                    <span className="text-slate-200 font-bold text-sm lg:text-base">Instant Monarch</span>
                  </div>
                </button>

                {/* Roll button */}
                <button
                  onClick={rollTrait}
                  disabled={isRolling || !calcSelectedUnit}
                  className={`relative overflow-hidden rounded-xl p-4 lg:p-6 transition-all duration-300 border-2 min-h-[60px] ${
                    isRolling || !calcSelectedUnit
                      ? 'opacity-50 cursor-not-allowed border-slate-600 bg-slate-800'
                      : 'cursor-pointer border-purple-600 bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105'
                  }`}
                >
                  <div className="relative z-10 flex flex-col items-center gap-2 lg:gap-3">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <img 
                        src={`${imageBaseUrl}Images/backgrounds/example images/Trait_Reroll.webp`}
                        alt="Trait Reroll"
                        className={`w-10 h-10 lg:w-12 lg:h-12 ${
                          isRolling ? 'animate-spin' : ''
                        }`}
                      />
                      <span className="text-white font-black text-xl lg:text-2xl tracking-wider">
                        {isRolling ? 'ROLLING...' : 'ROLL'}
                      </span>
                      <img 
                        src={`${imageBaseUrl}Images/backgrounds/example images/Trait_Reroll.webp`}
                        alt="Trait Reroll"
                        className={`w-10 h-10 lg:w-12 lg:h-12 ${
                          isRolling ? 'animate-spin' : ''
                        }`}
                      />
                    </div>
                    {!calcSelectedUnit && (
                      <div className="text-slate-400 text-xs">Select a unit first</div>
                    )}
                  </div>
                  {!isRolling && calcSelectedUnit && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-400/30 to-purple-600/0 animate-shimmer"></div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Choice menu modal for trait roller */}
          {traitRollerChoiceUnit && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={() => setTraitRollerChoiceUnit(null)}>
              <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 max-w-md w-full bg-slate-900 bg-opacity-95 border-2 border-purple-600" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl sm:text-2xl font-bold text-purple-300 mb-4 sm:mb-6 text-center">{traitRollerChoiceUnit}</h3>
                
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="scale-125 sm:scale-150">
                    <CharacterCard character={traitRollerChoiceUnit} showUpload={false} />
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <button
                    onClick={() => {
                      setCalcSelectedUnit(traitRollerChoiceUnit);
                      setTraitRollerChoiceUnit(null);
                    }}
                    className="w-full glass-card rounded-lg sm:rounded-xl p-3 sm:p-4 bg-purple-900 bg-opacity-40 border-2 border-purple-700 hover:bg-purple-800 hover:bg-opacity-60 active:scale-95 transition-all text-white font-bold text-base sm:text-lg"
                  >
                    Select for Rolling
                  </button>
                  
                  <button
                    onClick={() => {
                      openModal(traitRollerChoiceUnit, null);
                      setTraitRollerChoiceUnit(null);
                    }}
                    className="w-full glass-card rounded-lg sm:rounded-xl p-3 sm:p-4 bg-slate-800 bg-opacity-60 border-2 border-slate-700 hover:bg-slate-700 hover:bg-opacity-80 active:scale-95 transition-all text-white font-bold text-base sm:text-lg"
                  >
                    View Overview
                  </button>
                  
                  <button
                    onClick={() => setTraitRollerChoiceUnit(null)}
                    className="w-full glass-card rounded-lg sm:rounded-xl p-3 sm:p-4 bg-slate-800 bg-opacity-40 border-2 border-slate-600 hover:bg-slate-700 hover:bg-opacity-60 active:scale-95 transition-all text-slate-300 font-semibold text-base"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : currentView === 'unitlist' ? (
        <div className={`w-full px-2 sm:px-4 lg:px-6 ${isTransitioning ? 'page-transition-exit' : 'page-transition-enter'}`}>
          <div className="text-center mb-6 sm:mb-8 relative pt-12 sm:pt-0">
            <button
              onClick={() => changeView('menu')}
              className="absolute top-0 left-0 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all flex items-center gap-2"
            >
              ← <span className="hidden sm:inline">Back to Menu</span><span className="sm:hidden">Menu</span>
            </button>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-600 mb-2 sm:mb-3">
              Unit List
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-300">{characters.length} Total Units</p>
          </div>

          <div className="mb-4 sm:mb-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search units by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full glass-card text-white pl-10 sm:pl-14 pr-10 sm:pr-12 py-3 sm:py-4 rounded-lg sm:rounded-xl focus:border-indigo-500 focus:outline-none text-base sm:text-lg transition-all focus:shadow-lg focus:shadow-indigo-500/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          <div className="glass rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-2xl">
            <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
              {characters
                .filter(char => char.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(character => (
                  <CharacterCard key={character} character={character} showUpload={false} />
                ))}
              {characters.filter(char => char.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <div className="w-full text-center py-8 sm:py-12">
                  <p className="text-slate-400 text-base sm:text-lg lg:text-xl">No units found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className={`max-w-7xl mx-auto ${isTransitioning ? 'page-transition-exit' : 'page-transition-enter'}`}>
          <div className="text-center mb-8 relative">
            <button
              onClick={() => changeView('menu')}
              className="absolute top-0 left-0 px-4 py-2 rounded-lg font-semibold glass-card text-slate-300 hover:text-white glass-hover transition-all flex items-center gap-2"
            >
              ← Back to Menu
            </button>
            <div className="absolute top-0 right-0 flex gap-2">
              <button
                onClick={() => setDevMode(!devMode)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${devMode ? 'bg-purple-600 bg-opacity-80 backdrop-blur-lg text-white ring-2 ring-purple-400 shadow-lg shadow-purple-500/50' : 'glass-card text-slate-300 hover:text-white glass-hover'}`}
              >
                {devMode ? '🔧 Dev Mode ON' : '🔧 Dev Mode'}
              </button>
              {devMode && (
                <button
                  onClick={() => {
                    if (advancedDevMode) {
                      setAdvancedDevMode(false);
                    } else {
                      setShowApiKeyPrompt(true);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${advancedDevMode ? 'bg-red-600 bg-opacity-80 backdrop-blur-lg text-white ring-2 ring-red-400 shadow-lg shadow-red-500/50' : 'glass-card text-slate-300 hover:text-white glass-hover'}`}
                >
                  {advancedDevMode ? '⚠️ Advanced' : '⚠️ Advanced'}
                </button>
              )}
            </div>
            {devMode && Object.keys(devOverrides).length > 0 && (
              <button
                onClick={clearDevOverrides}
                className="absolute top-0 right-40 px-3 py-2 rounded-lg font-semibold text-xs bg-red-900 bg-opacity-80 backdrop-blur-lg text-red-200 hover:bg-red-800 transition-all shadow-lg shadow-red-500/30"
              >
                Clear Overrides ({Object.keys(devOverrides).length})
              </button>
            )}
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-2 lg:mb-3 transition-all duration-500"
            style={{
              color: currentTheme.accent,
              textShadow: `0 0 40px ${currentTheme.accent}80, 0 0 20px ${currentTheme.accent}60`
            }}
          >
            Anime Vanguards
          </h1>
          <p 
            className="text-base sm:text-lg lg:text-xl font-semibold mb-1 transition-all duration-500"
            style={{ color: currentTheme.accent }}
          >
            Tier List Creator
          </p>
          <p className="text-xs sm:text-sm text-slate-400">Update 9 Anniversary • {characters.length} Units</p>
        </div>

        {/* Mode Switcher and Custom Tier Manager */}
        {devMode && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center items-center mb-4 sm:mb-6 px-2">
            <div className="flex gap-2">
              <button
                onClick={switchToDefaultMode}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  !isCustomMode
                    ? 'bg-cyan-600 text-white ring-2 ring-cyan-400 shadow-lg'
                    : 'glass-card text-slate-300 hover:text-white glass-hover'
                }`}
              >
                📋 Default Lists
              </button>
              <button
                onClick={switchToCustomMode}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  isCustomMode
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400 shadow-lg'
                    : 'glass-card text-slate-300 hover:text-white glass-hover'
                }`}
              >
                ⚡ Custom Lists
              </button>
            </div>
            <button
              onClick={() => setShowCustomTierManager(true)}
              className="px-4 py-2 rounded-lg font-semibold text-sm bg-indigo-900 bg-opacity-80 text-indigo-200 hover:bg-indigo-800 transition-all shadow-lg flex items-center gap-2"
            >
              ⚙️ Manage Custom Tiers
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-4 sm:mb-6 lg:mb-8 px-2">\n          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold transition-all duration-500 transform ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 bg-opacity-90 backdrop-blur-lg text-white shadow-2xl shadow-cyan-500/50 scale-105 sm:scale-110 ring-2 ring-cyan-400'
                  : 'glass-card text-slate-300 hover:text-white glass-hover hover:scale-105'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Create Tierlist Button */}
        <div className="flex flex-col items-center gap-2 mb-4 sm:mb-6 px-2">
          <button
            onClick={generateShareableLink}
            className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base lg:text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl shadow-green-500/30 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 sm:gap-3"
          >
            <span>🔗</span>
            <span className="hidden sm:inline">Create Shareable Tierlist</span>
            <span className="sm:hidden">Share Tierlist</span>
          </button>
          
          {!devMode && (
            <div className="glass-card px-4 py-2 rounded-lg text-xs sm:text-sm text-slate-300 text-center max-w-md">
              💡 <span className="font-semibold">Tip:</span> Enable <span className="text-purple-400 font-bold">Dev Mode</span> to edit unit notes, add custom traits, and unlock advanced features!
            </div>
          )}
        </div>

        <div id="tierlist-container" className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 transition-all duration-500 ease-in-out px-2">
          {tiers.map(tier => {
            const currentData = isCustomMode ? customTierData : tierData;
            const tierUnits = currentData[selectedCategory]?.[tier] || [];
            
            return (
            <div key={tier}>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch">
                <div 
                  className={`w-full sm:w-40 lg:w-52 shrink-0 bg-gradient-to-r ${tierColors[tier] || 'from-slate-500 to-slate-600'} rounded-lg sm:rounded-xl shadow-xl flex items-center justify-center p-3 sm:p-4 border-2 ${tierBorders[tier] || 'border-slate-500'} cursor-pointer hover:scale-105 transition-transform`}
                  onClick={() => setShowTierInfo(showTierInfo === tier ? null : tier)}
                >
                  <span className="text-white font-black text-lg sm:text-xl tracking-wide drop-shadow-lg">
                    {tier}
                  </span>
                </div>
                <div
                  onDrop={(e) => handleDrop(e, tier)}
                  onDragOver={handleDragOver}
                  className={`flex-1 min-h-24 sm:min-h-28 glass-card rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-wrap gap-2 sm:gap-3 border-2 ${tierBorders[tier] || 'border-slate-500'} border-opacity-30 hover:border-opacity-60 transition-all duration-300 backdrop-blur-lg`}
                >
                  {tierUnits.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm italic">
                      Drag units here
                    </div>
                  ) : (
                    tierUnits.map(character => (
                      <CharacterCard key={character} character={character} showUpload={false} />
                    ))
                  )}
                </div>
              </div>
              {showTierInfo === tier && tierDescriptions[tier] && (
                <div className={`mt-2 sm:ml-44 lg:ml-56 bg-gradient-to-r ${tierColors[tier] || 'from-slate-500 to-slate-600'} bg-opacity-20 border-2 ${tierBorders[tier] || 'border-slate-500'} border-opacity-50 rounded-lg p-3 sm:p-4 animate-slideDown`}>
                  <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                    {tierDescriptions[tier]}
                  </p>
                </div>
              )}
            </div>
            );
          })}
        </div>

        <div className="glass rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4 sm:mb-5">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400">
              Available Units
            </h2>
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 glass-card rounded-full backdrop-blur-lg">
              <span className="text-cyan-200 font-bold text-sm sm:text-base lg:text-lg">
                {getUnassignedCharacters().length} units
              </span>
            </div>
          </div>
          <div 
            className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4"
            onDrop={handleDropOnAvailable}
            onDragOver={handleDragOver}
          >
            {getUnassignedCharacters().map(character => (
              <CharacterCard key={character} character={character} showUpload={true} />
            ))}
          </div>
        </div>
        </div>
      )}

      {/* Custom Tier Manager Modal */}
      {showCustomTierManager && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn overflow-y-auto" 
          onClick={() => setShowCustomTierManager(false)}
        >
          <div 
            className="glass rounded-2xl p-6 sm:p-8 max-w-4xl w-full border-2 border-indigo-500 shadow-2xl animate-scaleIn backdrop-blur-2xl my-8" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-indigo-400">⚙️ Custom Tier Manager</h3>
              <button 
                onClick={() => setShowCustomTierManager(false)} 
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Tier Management */}
              <div>
                <h4 className="text-lg font-bold text-purple-300 mb-3">Tiers (Rows)</h4>
                <div className="glass-card rounded-lg p-4 mb-4">
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newTierName}
                      onChange={(e) => setNewTierName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCustomTier()}
                      placeholder="New tier name..."
                      className="flex-1 px-3 py-2 rounded-lg glass text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={addCustomTier}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm transition-all"
                    >
                      Add
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {customTiers.map((tier, index) => (
                      <div key={index} className="flex items-center gap-2 bg-slate-800 bg-opacity-60 p-2 rounded-lg">
                        {editingTierIndex === index ? (
                          <>
                            <input
                              type="text"
                              defaultValue={tier}
                              onBlur={(e) => renameCustomTier(tier, e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  renameCustomTier(tier, e.target.value);
                                }
                              }}
                              autoFocus
                              className="flex-1 px-2 py-1 rounded glass text-white text-sm focus:outline-none"
                            />
                            <button
                              onClick={() => setEditingTierIndex(null)}
                              className="text-slate-400 hover:text-white text-xs"
                            >
                              ✓
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-sm text-white">{tier}</span>
                            <button
                              onClick={() => setEditingTierIndex(index)}
                              className="text-blue-400 hover:text-blue-300 text-xs"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete tier "${tier}"?`)) deleteCustomTier(tier);
                              }}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                    {customTiers.length === 0 && (
                      <p className="text-slate-500 text-sm text-center py-4">No custom tiers yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Management */}
              <div>
                <h4 className="text-lg font-bold text-cyan-300 mb-3">Categories (Columns)</h4>
                <div className="glass-card rounded-lg p-4 mb-4">
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCustomCategory()}
                      placeholder="New category name..."
                      className="flex-1 px-3 py-2 rounded-lg glass text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <button
                      onClick={addCustomCategory}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold text-sm transition-all"
                    >
                      Add
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {customCategories.map((category, index) => (
                      <div key={index} className="flex items-center gap-2 bg-slate-800 bg-opacity-60 p-2 rounded-lg">
                        {editingCategoryIndex === index ? (
                          <>
                            <input
                              type="text"
                              defaultValue={category}
                              onBlur={(e) => renameCustomCategory(category, e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  renameCustomCategory(category, e.target.value);
                                }
                              }}
                              autoFocus
                              className="flex-1 px-2 py-1 rounded glass text-white text-sm focus:outline-none"
                            />
                            <button
                              onClick={() => setEditingCategoryIndex(null)}
                              className="text-slate-400 hover:text-white text-xs"
                            >
                              ✓
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-sm text-white">{category}</span>
                            <button
                              onClick={() => setEditingCategoryIndex(index)}
                              className="text-blue-400 hover:text-blue-300 text-xs"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete category "${category}"?`)) deleteCustomCategory(category);
                              }}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                    {customCategories.length === 0 && (
                      <p className="text-slate-500 text-sm text-center py-4">No custom categories yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-lg p-4 mt-6">
              <p className="text-slate-400 text-sm mb-2">
                <strong>💡 Tips:</strong>
              </p>
              <ul className="text-slate-400 text-xs space-y-1 ml-4">
                <li>• Create at least one tier and one category to use custom lists</li>
                <li>• Click "Custom Lists" button to switch to your custom tier list</li>
                <li>• Custom lists are saved separately from default lists</li>
                <li>• Rename or delete tiers/categories anytime</li>
              </ul>
            </div>

            <button
              onClick={() => setShowCustomTierManager(false)}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn" 
          onClick={() => setShowShareModal(false)}
        >
          <div 
            className="glass rounded-2xl p-8 max-w-2xl w-full border-2 border-green-500 shadow-2xl animate-scaleIn backdrop-blur-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-green-400">🔗 Shareable Tierlist Created!</h3>
              <button 
                onClick={() => setShowShareModal(false)} 
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-slate-300 mb-4">
              Your <strong>{selectedCategory}</strong> tier list has been encoded into a shareable link. 
              Anyone with this link can view your placements, unit notes, and recommended traits.
            </p>

            <div className="mb-6">
              <label className="text-sm text-slate-400 mb-2 block">Shareable Link (Copied to Clipboard)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareableLink}
                  readOnly
                  className="flex-1 px-4 py-3 rounded-lg glass text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareableLink);
                    alert('✅ Link copied to clipboard!');
                  }}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="glass-card rounded-lg p-4 mb-4">
              <p className="text-slate-400 text-sm">
                <strong>📋 What's included:</strong>
              </p>
              <ul className="text-slate-400 text-sm mt-2 space-y-1 ml-4">
                <li>• All unit placements in {selectedCategory}</li>
                <li>• Unit notes and explanations</li>
                <li>• Recommended traits for each unit</li>
                <li>• Timestamp: {new Date().toLocaleString()}</li>
              </ul>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* API Key Prompt Modal */}
      {showApiKeyPrompt && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn" 
          onClick={() => { setShowApiKeyPrompt(false); setApiKeyInput(''); }}
        >
          <div 
            className="glass rounded-2xl p-8 max-w-md w-full border-2 border-red-500 shadow-2xl animate-scaleIn backdrop-blur-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-red-400">⚠️ Advanced Dev Mode</h3>
              <button 
                onClick={() => { setShowApiKeyPrompt(false); setApiKeyInput(''); }} 
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-slate-300 mb-6">
              Advanced Dev Mode allows editing character icons, rarity, and color scales. 
              Enter the API key to enable.
            </p>

            <div className="mb-6">
              <label className="text-sm text-slate-400 mb-2 block">API Key</label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Enter API key..."
                className="w-full px-4 py-3 rounded-lg glass text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (apiKeyInput === ADVANCED_DEV_KEY) {
                      setAdvancedDevMode(true);
                      setShowApiKeyPrompt(false);
                      setApiKeyInput('');
                    } else {
                      alert('❌ Invalid API key. Access denied.');
                      setApiKeyInput('');
                    }
                  }
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (apiKeyInput === ADVANCED_DEV_KEY) {
                    setAdvancedDevMode(true);
                    setShowApiKeyPrompt(false);
                    setApiKeyInput('');
                  } else {
                    alert('❌ Invalid API key. Access denied.');
                    setApiKeyInput('');
                  }
                }}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
              >
                Unlock
              </button>
              <button
                onClick={() => { setShowApiKeyPrompt(false); setApiKeyInput(''); }}
                className="flex-1 px-6 py-3 glass-card hover:glass-hover text-slate-300 rounded-lg font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && selectedUnit && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" 
          onClick={() => { saveNote(); setShowModal(false); }}
        >
          <div 
            className="glass rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-cyan-500 shadow-2xl animate-scaleIn backdrop-blur-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-cyan-500 shadow-lg flex-shrink-0">
                  <img 
                    src={getCharacterImageUrl(selectedUnit.character)} 
                    alt={selectedUnit.character}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      if (e.target.src !== getCharacterImageFallback(selectedUnit.character)) {
                        e.target.src = getCharacterImageFallback(selectedUnit.character);
                      } else {
                        e.target.src = getPlaceholderImage(selectedUnit.character);
                      }
                    }}
                  />
                </div>
                <h3 className="text-3xl font-bold text-cyan-400">{devMode && editingName ? formatCharacterName(editingName) : formatCharacterName(selectedUnit.character)}</h3>
              </div>
              <button 
                onClick={() => { saveNote(); setShowModal(false); }} 
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 border-b border-slate-700 border-opacity-30 pb-2">
              <button
                onClick={() => setModalTab('info')}
                className={`px-4 py-2 rounded-t-lg font-semibold transition-all ${modalTab === 'info' ? 'bg-cyan-600 bg-opacity-80 backdrop-blur-lg text-white shadow-lg shadow-cyan-500/30' : 'glass-card text-slate-400 hover:text-white'}`}
              >
                Info
              </button>
              <button
                onClick={() => setModalTab('traits')}
                className={`px-4 py-2 rounded-t-lg font-semibold transition-all ${modalTab === 'traits' ? 'bg-cyan-600 bg-opacity-80 backdrop-blur-lg text-white shadow-lg shadow-cyan-500/30' : 'glass-card text-slate-400 hover:text-white'}`}
              >
                Recommended Traits
              </button>
              {familiarPassives[selectedUnit?.character] && (
                <button
                  onClick={() => setModalTab('familiar')}
                  className={`px-4 py-2 rounded-t-lg font-semibold transition-all flex items-center gap-2 ${modalTab === 'familiar' ? 'bg-cyan-600 bg-opacity-80 backdrop-blur-lg text-white shadow-lg shadow-cyan-500/30' : 'glass-card text-slate-400 hover:text-white'}`}
                >
                  <div 
                    className="w-5 h-5 rounded-full overflow-hidden shadow-lg relative"
                    style={getBackgroundStyle(selectedUnit.character)}
                  >
                    <img 
                      src={getFamiliarIconUrl(familiarPassives[selectedUnit.character].familiarName)}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{ opacity: 0.95 }}
                    />
                  </div>
                  {familiarPassives[selectedUnit.character].familiarName}
                </button>
              )}
              {devMode && (
                <button
                  onClick={() => setModalTab('devEdit')}
                  className={`px-4 py-2 rounded-t-lg font-semibold transition-all ${modalTab === 'devEdit' ? 'bg-purple-600 bg-opacity-80 backdrop-blur-lg text-white shadow-lg shadow-purple-500/30' : 'glass-card text-slate-400 hover:text-white'}`}
                >
                  🔧 Dev Edit
                </button>
              )}
            </div>

            {/* Info Tab */}
            {modalTab === 'info' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card rounded-lg p-4 backdrop-blur-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-semibold text-base">Placement:</span>
                      <span className={`px-3 py-1.5 rounded-lg font-bold text-sm bg-gradient-to-r ${tierColors[selectedUnit.tier] || 'from-slate-600 to-slate-700'} text-white shadow-lg`}>
                        {selectedUnit.tier}
                      </span>
                    </div>
                  </div>

                  <div className="glass-card rounded-lg p-4 backdrop-blur-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-semibold text-base">Rarity:</span>
                      <span className={`rarity-swatch ${isSpecialVariant(selectedUnit.character) ? `tl-${selectedUnit.character.toLowerCase()}` : `tl-${getCharacterRarity(selectedUnit.character).toLowerCase()}`}`} aria-hidden="true" />
                      <span className={`px-3 py-1.5 rounded-lg font-bold text-sm ${rarityBadgeColors[getCharacterBadgeColor(selectedUnit.character)]}`}>
                        {getCharacterRarity(selectedUnit.character)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Passives Section */}
                <div className="glass rounded-lg p-5 border border-cyan-500 border-opacity-50 backdrop-blur-lg">
                  <h4 className="text-cyan-400 font-bold text-xl mb-4 flex items-center gap-2">
                    <span>⚡</span>
                    Passive Abilities
                  </h4>
                  <div className="space-y-3">
                    {getUnitPassives(selectedUnit.character).passives.map((passive, index) => (
                      <div key={index} className="glass-card rounded-lg p-4 backdrop-blur-lg">
                        <p className="text-slate-200 text-base leading-relaxed">{passive}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes Section */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-3 text-lg">
                    Why is this unit here?
                  </label>
                  <textarea
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    placeholder="Explain the placement reasoning..."
                    disabled={!devMode}
                    className={`w-full px-4 py-3 rounded-lg border min-h-40 resize-none text-base ${devMode ? 'glass-card text-white border-slate-600 border-opacity-50 focus:border-cyan-500 focus:outline-none backdrop-blur-lg' : 'bg-slate-900 bg-opacity-30 text-slate-500 border-slate-700 cursor-not-allowed backdrop-blur-lg'}`}
                  />
                  {!devMode && (
                    <p className="text-slate-500 text-sm mt-2">🔒 Enable Dev Mode to edit notes</p>
                  )}
                </div>
              </div>
            )}

            {/* Traits Tab */}
            {modalTab === 'traits' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-slate-300 font-semibold mb-3 text-lg">
                    Recommended Trait for {formatCharacterName(selectedUnit.character)}
                  </label>
                  <select
                    value={traits[selectedUnit.character] || 'Monarch'}
                    onChange={(e) => saveTraits(e.target.value)}
                    disabled={!devMode}
                    className={`w-full px-4 py-3 rounded-lg border text-base ${devMode ? 'glass-card text-white border-slate-600 border-opacity-50 focus:border-cyan-500 focus:outline-none backdrop-blur-lg' : 'bg-slate-900 bg-opacity-30 text-slate-500 border-slate-700 cursor-not-allowed backdrop-blur-lg'}`}
                  >
                    <option value="Monarch">Monarch</option>
                    <option value="Ethereal">Ethereal</option>
                    <option value="Deadeye">Deadeye</option>
                    <option value="Solar">Solar</option>
                    <option value="Blitz">Blitz</option>
                    <option value="Marksman">Marksman</option>
                    <option value="Fortune">Fortune</option>
                  </select>
                  {!devMode && (
                    <p className="text-slate-500 text-sm mt-2">🔒 Enable Dev Mode to edit traits</p>
                  )}
                </div>
              </div>
            )}

            {/* Familiar Tab */}
            {modalTab === 'familiar' && familiarPassives[selectedUnit?.character] && (
              <div className="space-y-6">
                {/* Familiar Header */}
                <div className="flex items-center gap-4 glass rounded-lg p-5 border border-cyan-500 border-opacity-50 backdrop-blur-lg">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-cyan-400 shadow-lg" style={getBackgroundStyle(selectedUnit.character)}>
                    <img 
                      src={getFamiliarIconUrl(familiarPassives[selectedUnit.character].familiarName)}
                      alt={familiarPassives[selectedUnit.character].familiarName}
                      className="w-full h-full object-cover"
                      style={{ opacity: 0.95 }}
                    />
                  </div>
                  <div>
                    <h4 className="text-cyan-400 font-bold text-2xl">
                      {familiarPassives[selectedUnit.character].familiarName}
                    </h4>
                    <p className="text-slate-400 text-sm">Vanguard Familiar</p>
                  </div>
                </div>

                {/* Familiar Passives */}
                <div className="glass rounded-lg p-5 border border-cyan-500 border-opacity-50 backdrop-blur-lg">
                  <h4 className="text-cyan-400 font-bold text-xl mb-4 flex items-center gap-2">
                    <span>✨</span>
                    Familiar Abilities
                  </h4>
                  <div className="space-y-3">
                    {familiarPassives[selectedUnit.character].passives.map((passive, index) => (
                      <div key={index} className="glass-card rounded-lg p-4 backdrop-blur-lg">
                        <p className="text-slate-200 text-base leading-relaxed">{passive}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Dev Edit Tab */}
            {modalTab === 'devEdit' && devMode && (
              <div className="space-y-6">
                {!advancedDevMode ? (
                  <div className="bg-red-900 bg-opacity-40 backdrop-blur-lg border border-red-500 border-opacity-50 rounded-lg p-6 text-center">
                    <p className="text-red-300 font-semibold text-lg mb-3">🔒 Advanced Dev Mode Required</p>
                    <p className="text-slate-400 text-sm mb-4">
                      Editing character icons, rarity, and color scales requires Advanced Dev Mode.
                    </p>
                    <button
                      onClick={() => setShowApiKeyPrompt(true)}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
                    >
                      Unlock Advanced Mode
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-red-900 bg-opacity-40 backdrop-blur-lg border border-red-500 border-opacity-50 rounded-lg p-4 mb-4">
                      <p className="text-red-300 font-semibold">⚠️ Advanced Developer Mode - Edit character properties</p>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-3 text-lg">
                        Character Name:
                      </label>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full glass-card text-white px-4 py-3 rounded-lg border border-slate-600 border-opacity-50 focus:border-red-500 focus:outline-none text-base backdrop-blur-lg"
                        placeholder="CharacterName"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-3 text-lg">
                        Rarity:
                      </label>
                      <select
                        value={editingRarity}
                        onChange={(e) => setEditingRarity(e.target.value)}
                        className="w-full glass-card text-white px-4 py-3 rounded-lg border border-slate-600 border-opacity-50 focus:border-red-500 focus:outline-none text-base backdrop-blur-lg"
                      >
                        <option value="Mythic">Mythic</option>
                        <option value="Exclusive">Exclusive</option>
                        <option value="Secret">Secret</option>
                        <option value="Vanguard">Vanguard</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-3 text-lg">
                        Custom Color/Badge (hex or gradient CSS):
                      </label>
                      <textarea
                        value={editingColor}
                        onChange={(e) => setEditingColor(e.target.value)}
                        placeholder="#ff0000 or linear-gradient(...)"
                        className="w-full glass-card text-white px-4 py-3 rounded-lg border border-slate-600 border-opacity-50 focus:border-red-500 focus:outline-none min-h-24 resize-none text-base font-mono text-sm backdrop-blur-lg"
                      />
                    </div>

                    <div className="glass-card rounded-lg p-4 backdrop-blur-lg">
                      <p className="text-slate-400 text-sm">
                        💾 <strong>How it works:</strong> Click the button to save the modified file directly using your browser. Replace the original file and Vite will auto-reload.
                      </p>
                      <p className="text-slate-400 text-xs mt-2">
                        If file picker isn't supported, instructions will be copied to clipboard.
                      </p>
                    </div>

                    <button
                      onClick={applyDevChanges}
                      className="w-full bg-red-600 bg-opacity-80 backdrop-blur-lg hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/30"
                    >
                      <span>💾</span>
                      Save Modified File
                    </button>
                  </>
                )}
              </div>
            )}

            <button
              onClick={() => { saveNote(); setShowModal(false); }}
              className="mt-6 w-full bg-gradient-to-r from-cyan-600 to-blue-600 bg-opacity-90 backdrop-blur-lg hover:from-cyan-700 hover:to-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-cyan-500/30"
            >
              Save & Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes vanguardPulse {
          0%, 100% { 
            box-shadow: 0 0 25px rgba(6, 182, 212, 0.9), 0 0 50px rgba(6, 182, 212, 0.6), 0 0 75px rgba(6, 182, 212, 0.3), inset 0 0 40px rgba(0,0,0,0.6), 0 4px 20px rgba(0,0,0,0.9);
            border-width: 4px;
          }
          50% { 
            box-shadow: 0 0 30px rgba(6, 182, 212, 1), 0 0 60px rgba(6, 182, 212, 0.8), 0 0 90px rgba(6, 182, 212, 0.5), inset 0 0 40px rgba(0,0,0,0.6), 0 4px 20px rgba(0,0,0,0.9);
            border-width: 5px;
          }
        }
        @keyframes vanguardBorder {
          0% { 
            background-position: 0% 50%;
            box-shadow: 0 0 25px rgba(6, 182, 212, 0.9), 0 0 50px rgba(6, 182, 212, 0.6), 0 0 75px rgba(6, 182, 212, 0.3), inset 0 0 40px rgba(0,0,0,0.6), 0 4px 20px rgba(0,0,0,0.9);
          }
          50% { 
            background-position: 100% 50%;
            box-shadow: 0 0 35px rgba(6, 182, 212, 1), 0 0 70px rgba(6, 182, 212, 0.8), 0 0 100px rgba(6, 182, 212, 0.5), inset 0 0 40px rgba(0,0,0,0.6), 0 4px 20px rgba(0,0,0,0.9);
          }
          100% { 
            background-position: 0% 50%;
            box-shadow: 0 0 25px rgba(6, 182, 212, 0.9), 0 0 50px rgba(6, 182, 212, 0.6), 0 0 75px rgba(6, 182, 212, 0.3), inset 0 0 40px rgba(0,0,0,0.6), 0 4px 20px rgba(0,0,0,0.9);
          }
        }
        @keyframes shadowPulse {
          0%, 100% { 
            opacity: 0.4;
            transform: scale(1);
          }
          50% { 
            opacity: 0.8;
            transform: scale(1.15);
          }
        }
        @keyframes shadowWave {
          0% { 
            background-position: -200% 0;
          }
          100% { 
            background-position: 200% 0;
          }
        }
        @keyframes scytheSlash {
          0% { 
            background-position: -100% -100%;
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          25% { 
            background-position: 200% 200%;
            opacity: 1;
          }
          30% {
            opacity: 0;
          }
          100% { 
            background-position: 200% 200%;
            opacity: 0;
          }
        }
        @keyframes scytheGlow {
          0%, 100% { 
            opacity: 0.3;
            transform: scale(1);
          }
          50% { 
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
        @keyframes flameFlicker {
          0% { 
            opacity: 0.7;
            transform: scaleY(1) translateY(0);
          }
          100% { 
            opacity: 0.9;
            transform: scaleY(1.1) translateY(-2px);
          }
        }
        @keyframes flameGlow {
          0%, 100% { 
            opacity: 0.5;
            transform: scale(1);
          }
          50% { 
            opacity: 0.8;
            transform: scale(1.2);
          }
        }
        @keyframes iceFire {
          0% { 
            background-position: 0% 50%;
            filter: blur(3px) hue-rotate(0deg);
          }
          50% { 
            background-position: 100% 50%;
            filter: blur(3px) hue-rotate(30deg);
          }
          100% { 
            background-position: 0% 50%;
            filter: blur(3px) hue-rotate(0deg);
          }
        }
        @keyframes auraFlicker {
          0%, 100% { 
            opacity: 0.6;
            transform: scale(1);
          }
          50% { 
            opacity: 0.9;
            transform: scale(1.08);
          }
        }
        @keyframes auraWave {
          0% { 
            background-position: 0% 0%;
            opacity: 0.4;
          }
          50% { 
            opacity: 0.7;
          }
          100% { 
            background-position: 200% 200%;
            opacity: 0.4;
          }
        }
        @keyframes mythicShimmer {
          0% { 
            background-position: -200% 0;
          }
          100% { 
            background-position: 200% 0;
          }
        }
        @keyframes exclusivePulse {
          0%, 100% { 
            opacity: 0.3;
            transform: scale(1);
          }
          50% { 
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>

      {/* Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-6 animate-fadeIn">
          <div className="glass-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-3xl font-bold" style={{ color: currentTheme.accent }}>
                📖 Tier List Creator Guide
              </h2>
              <button onClick={() => setShowGuideModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={28} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto scrollbar-thin space-y-6">
              {/* Getting Started */}
              <div className="glass rounded-xl p-5">
                <h3 className="text-2xl font-bold mb-3" style={{ color: currentTheme.accent }}>🚀 Getting Started</h3>
                <div className="space-y-2 text-slate-300">
                  <p><strong className="text-white">1. Select a Category:</strong> Choose from General Use, Pure DPS, Support, Crowd Control, or Boss Killing</p>
                  <p><strong className="text-white">2. Drag & Drop Units:</strong> Drag units from the unranked section into tier rows (High Tier Meta, Meta, Low Tier Meta, Good, Mid, Bad)</p>
                  <p><strong className="text-white">3. Click Units:</strong> Click any unit to view passives, add notes, and set recommended traits</p>
                  <p><strong className="text-white">4. Export:</strong> Use the "Create Shareable Tierlist" button to generate a shareable link</p>
                </div>
              </div>

              {/* Dev Mode */}
              <div className="glass rounded-xl p-5">
                <h3 className="text-2xl font-bold mb-3" style={{ color: currentTheme.accent }}>🔧 Dev Mode</h3>
                <div className="space-y-3 text-slate-300">
                  <p className="text-white font-semibold">Enabling Dev Mode:</p>
                  <p>Click the "Dev Mode" button in the top-right corner. This unlocks editing features:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Edit unit notes and placement reasoning</li>
                    <li>Change recommended traits for units</li>
                    <li>Upload custom unit images</li>
                  </ul>
                  
                  <p className="text-white font-semibold mt-4">Advanced Dev Mode:</p>
                  <p>Click "Advanced" button (requires API key) for power-user features:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Edit character names</li>
                    <li>Change unit rarities and colors</li>
                    <li>Modify character metadata</li>
                  </ul>
                  <p className="text-yellow-400 text-sm">⚠️ Advanced mode changes are stored locally and won't affect the base game data</p>
                </div>
              </div>

              {/* Exporting */}
              <div className="glass rounded-xl p-5">
                <h3 className="text-2xl font-bold mb-3" style={{ color: currentTheme.accent }}>📤 Exporting Your Tier List</h3>
                <div className="space-y-3 text-slate-300">
                  <p className="text-white font-semibold">Shareable Link</p>
                  <p>1. Click "Create Shareable Tierlist" button in your chosen category</p>
                  <p>2. A link will be generated and automatically copied to clipboard</p>
                  <p>3. Share the link with friends - it contains all your rankings, notes, and trait selections</p>
                  <p>4. Recipients can view your tier list or use it as a starting point for their own</p>
                </div>
              </div>

              {/* Tips & Tricks */}
              <div className="glass rounded-xl p-5">
                <h3 className="text-2xl font-bold mb-3" style={{ color: currentTheme.accent }}>💡 Tips & Tricks</h3>
                <div className="space-y-2 text-slate-300">
                  <p>• <strong className="text-white">Search:</strong> Use the search bar to quickly find specific units</p>
                  <p>• <strong className="text-white">Familiar Units:</strong> Units with familiars show a special "Familiar" tab with bonus abilities</p>
                  <p>• <strong className="text-white">Backgrounds:</strong> The background and UI theme changes automatically when switching views</p>
                  <p>• <strong className="text-white">Local Storage:</strong> Your tier lists are saved locally - they persist even after closing the browser</p>
                  <p>• <strong className="text-white">Multiple Categories:</strong> You can create different tier lists for each category independently</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-6 py-3 rounded-lg font-semibold text-white glass-hover transition-all"
                style={{ background: `linear-gradient(135deg, ${currentTheme.accent}, ${currentTheme.secondary})` }}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Ultra-rare trait icon overlay - positioned at root level for true centering */}
      {showMythicCelebration && calcSelectedUnit && unitCurrentTraits[calcSelectedUnit] && (
        <div className="mythic-icon-overlay">
          <img 
            src={`${imageBaseUrl}Images/Trait Icons/${unitCurrentTraits[calcSelectedUnit].name.split(' ')[0]}.webp`}
            alt={unitCurrentTraits[calcSelectedUnit].name}
            className="mythic-celebration-icon"
          />
        </div>
      )}
    </div>
  );
};

export default TierListApp;
