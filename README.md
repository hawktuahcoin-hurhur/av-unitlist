# Anime Vanguards Tier List Creator

A modern, interactive tier list creator for Anime Vanguards characters. Built with React, Vite, and Tailwind CSS.

## Features

- 📊 **Drag & Drop Interface**: Easily organize characters into tier rankings
- 🎨 **Multiple Categories**: General Use, Pure DPS, Support roles, Crowd Control, and Boss Killing
- 📝 **Character Notes**: Add detailed explanations for each character placement
- 🖼️ **Custom Images**: Upload or set custom images for each character
- 🎭 **6-Tier System**: From "High Tier Meta" to "Bad"
- 💾 **Local Persistence**: All data saves automatically to your browser
- 🌙 **Dark Theme**: Beautiful dark UI with gradient accents

## Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hawktuahcoin-hurhur/av-unitlist.git
cd av-unitlist
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
av-unitlist/
├── src/
│   ├── components/
│   │   └── TierListApp.jsx      # Main tier list application
│   ├── App.jsx                   # App root component
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── index.html                    # HTML template
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
└── package.json                 # Project dependencies
```

## Technologies

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

## Features Breakdown

### Tier System
- **High Tier Meta**: Best units in the game
- **Meta**: Top-tier performers
- **Low Tier Meta**: Strong viable units
- **Good**: Solid performers
- **Mid**: Average units
- **Bad**: Underperforming units

### Categories
Switch between different tier lists for:
- General Use
- Pure DPS
- Support (Buffs)
- Support (Debuffs)
- Crowd Control
- Boss Killing

### Character Management
- Drag characters into tiers
- View all available characters
- Upload custom character images
- Search for images via Google
- Add notes explaining placements
- Character count tracking

## Data Persistence

All tier placements and notes are saved in your browser's localStorage, allowing you to return to your tier list later without losing data.

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please open an issue on GitHub.

---

**Made with ❤️ for Anime Vanguards players**
