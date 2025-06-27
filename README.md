# Text Analyzer

A modern, feature-rich text analysis tool built with Electron, JavaScript, and Tailwind CSS. Analyze your text for character counts, word statistics, and frequency analysis with a beautiful, responsive interface.

## Features

- **Dual Analysis Modes**:
  - **Single Text Analysis**: Analyze entire text blocks with comprehensive statistics
  - **Multi-Line Analysis**: Analyze each line separately with at-a-glance character counts

- **Real-time Analysis**: Instant text analysis as you type
- **Comprehensive Statistics**:
  - Total character count
  - Character count excluding spaces
  - Word count
  - Unique word count
  - Most frequently used word
  - Top 10 word frequency analysis with visual bars

- **Multi-Line Features**:
  - Line-by-line character counting
  - Click any line to see detailed analysis
  - Visual line selection with smooth scrolling
  - Perfect for analyzing lists, scripts, or structured text

- **Modern UI**: Clean, responsive design with dark/light theme support
- **Performance Optimized**: Debounced analysis for smooth performance
- **Keyboard Shortcuts**:
  - `Ctrl/Cmd + K`: Clear text
  - `Ctrl/Cmd + D`: Toggle theme
  - `Ctrl/Cmd + 1`: Switch to Single Text Analysis
  - `Ctrl/Cmd + 2`: Switch to Multi-Line Analysis
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Installation

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Setup
1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development
To run the application in development mode:
```bash
npm run dev
```

### Production
To run the application:
```bash
npm start
```

### Build
To build the application for distribution:
```bash
npm run build
```

## Usage

1. **Launch the Application**: Run `npm start` or `npm run dev`

### Single Text Analysis Tab
2. **Enter Text**: Type or paste your text into the large text area on the left
3. **View Analysis**: Real-time analysis results appear on the right side
4. **See Word Frequency**: Scroll down to see the top 10 most frequent words with visual bars

### Multi-Line Analysis Tab
2. **Switch to Multi-Line**: Click "Multi-Line Analysis" tab or press `Ctrl/Cmd + 2`
3. **Enter Multi-Line Text**: Type or paste text with multiple lines
4. **View Line Statistics**: Each line shows character count at a glance
5. **Click for Details**: Click any line to see comprehensive analysis in the detail panel

### General Features
6. **Theme Toggle**: Click the sun/moon icon to switch between light and dark themes
7. **Clear Text**: Use the "Clear Text" button or press `Ctrl/Cmd + K`
8. **Quick Switching**: Use `Ctrl/Cmd + 1` or `Ctrl/Cmd + 2` to switch tabs

## Architecture

### Files Structure
```
├── src/
│   ├── main.js          # Main Electron process
│   ├── preload.js       # Security bridge between main and renderer
│   ├── renderer.js      # UI logic and text analysis
│   ├── index.html       # Main application interface
│   └── styles.css       # Custom CSS styles
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
└── README.md           # This file
```

### Security
- Context isolation enabled
- Node integration disabled
- Preload script for secure API exposure
- Input sanitization to prevent XSS

### Performance
- Debounced text analysis (300ms delay)
- Efficient DOM updates
- Optimized word frequency calculations
- Responsive design for all screen sizes

## Technical Details

### Text Analysis Algorithm
The application performs comprehensive text analysis including:
- Character counting with and without whitespace
- Word extraction using regex pattern matching
- Frequency analysis with efficient counting algorithms
- Real-time updates with debouncing for performance

### Error Handling
- Graceful fallback for browser environments
- Input validation and sanitization
- Console logging for debugging
- User-friendly error messages

### Accessibility
- Semantic HTML structure
- Keyboard navigation support
- High contrast color schemes
- Screen reader friendly

## Contributing

Feel free to contribute by:
1. Reporting bugs
2. Suggesting new features
3. Submitting pull requests
4. Improving documentation

## License

MIT License - feel free to use this code for your own projects. 

### Duplicate Checker
- **Same Sentence Duplicates**: Highlights words that appear twice or more within the same sentence (pink highlighting)
- **Within 10 Words**: Highlights words that appear twice within a 10-word window (blue highlighting)
- Real-time analysis with debounced updates
- Visual highlighting with color-coded legend
- Statistics showing duplicate counts

### Word Highlighter
- Custom word highlighting with color selection
- Multiple word highlighting simultaneously
- Word count tracking for each highlighted term 