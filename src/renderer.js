/**
 * Text Analyzer Renderer Process
 * Handles UI interactions and text analysis
 */

// DOM element references - Single Line Tab
const textInput = document.getElementById('text-input');
const liveCount = document.getElementById('live-count');
const totalCharsEl = document.getElementById('total-chars');
const charsNoSpacesEl = document.getElementById('chars-no-spaces');
const wordCountEl = document.getElementById('word-count');
const uniqueWordsEl = document.getElementById('unique-words');
const mostUsedWordEl = document.getElementById('most-used-word');
const mostUsedCountEl = document.getElementById('most-used-count');
const wordFrequencyListEl = document.getElementById('word-frequency-list');

// DOM element references - Multi-Line Tab
const multiLineInput = document.getElementById('multi-line-input');
const multiLineCount = document.getElementById('multi-line-count');
const lineAnalysisListEl = document.getElementById('line-analysis-list');
const selectedLineDetailsEl = document.getElementById('selected-line-details');
const selectedTotalCharsEl = document.getElementById('selected-total-chars');
const selectedCharsNoSpacesEl = document.getElementById('selected-chars-no-spaces');
const selectedWordCountEl = document.getElementById('selected-word-count');
const selectedUniqueWordsEl = document.getElementById('selected-unique-words');
const selectedLinePreviewEl = document.getElementById('selected-line-preview');

// DOM element references - General
const clearBtn = document.getElementById('clear-btn');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// State management
let analysisTimeout = null;
let multiLineAnalysisTimeout = null;
let selectedLineIndex = -1;
let currentLines = [];
const DEBOUNCE_DELAY = 300; // ms

/**
 * Updates the analysis results in the UI
 * @param {Object} results - Analysis results from text analyzer
 */
const updateAnalysisResults = (results) => {
  try {
    // Update basic stats with animation
    const elements = [
      { el: totalCharsEl, value: results.totalCharacters },
      { el: charsNoSpacesEl, value: results.charactersNoSpaces },
      { el: wordCountEl, value: results.wordCount },
      { el: uniqueWordsEl, value: results.uniqueWordCount }
    ];

    elements.forEach(({ el, value }) => {
      el.textContent = value.toLocaleString();
      el.parentElement.classList.add('fade-in');
    });

    // Update most used word
    mostUsedWordEl.textContent = results.mostUsedWord || '-';
    mostUsedCountEl.textContent = results.mostUsedWordCount.toLocaleString();

    // Update word frequency list
    updateWordFrequencyList(results.wordFrequency);

  } catch (error) {
    console.error('Error updating analysis results:', error);
    showErrorMessage('Failed to update analysis results');
  }
};

/**
 * Updates the word frequency list
 * @param {Array} wordFrequency - Array of [word, count] pairs
 */
const updateWordFrequencyList = (wordFrequency) => {
  if (!wordFrequency || wordFrequency.length === 0) {
    wordFrequencyListEl.innerHTML = '<div class="text-sm text-gray-600 italic font-serif">No words to analyze...</div>';
    return;
  }

  const maxCount = Math.max(...wordFrequency.map(([, count]) => count));
  
  const listHTML = wordFrequency
    .map(([word, count]) => {
      const percentage = (count / maxCount) * 100;
      return `
        <div class="flex items-center justify-between py-2 px-3 transition-colors duration-200">
          <div class="flex items-center space-x-3 flex-1">
            <span class="font-serif text-sm font-medium text-gray-900 min-w-0 flex-1 truncate">${escapeHtml(word)}</span>
            <div class="flex-1 h-2 max-w-24 bg-gray-300">
              <div class="bg-gray-700 h-2 transition-all duration-300" style="width: ${percentage}%"></div>
            </div>
          </div>
          <span class="text-sm font-semibold text-gray-900 ml-3">${count}</span>
        </div>
      `;
    })
    .join('');

  wordFrequencyListEl.innerHTML = listHTML;
};

/**
 * Escapes HTML characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Shows an error message to the user
 * @param {string} message - Error message
 */
const showErrorMessage = (message) => {
  console.error(message);
  // In a real app, you might want to show a toast notification
};

/**
 * Performs text analysis with debouncing
 * @param {string} text - Text to analyze
 */
const performAnalysis = (text) => {
  // Clear previous timeout
  if (analysisTimeout) {
    clearTimeout(analysisTimeout);
  }

  // Update live count immediately
  liveCount.textContent = `${text.length.toLocaleString()} characters`;

  // Debounce the full analysis
  analysisTimeout = setTimeout(() => {
    try {
      if (window.electronAPI && window.electronAPI.textAnalyzer) {
        const results = window.electronAPI.textAnalyzer.analyzeText(text);
        updateAnalysisResults(results);
      } else {
        // Fallback for browser testing
        console.warn('Electron API not available, using fallback analysis');
        const results = fallbackAnalysis(text);
        updateAnalysisResults(results);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      showErrorMessage('Error analyzing text');
    }
  }, DEBOUNCE_DELAY);
};

/**
 * Fallback analysis function for browser environment
 * @param {string} text - Text to analyze
 * @returns {Object} Analysis results
 */
const fallbackAnalysis = (text) => {
  const totalCharacters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);

  const wordCount = words.length;
  const uniqueWords = [...new Set(words)];
  const uniqueWordCount = uniqueWords.length;

  const wordFrequency = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});

  const mostUsedWord = wordCount > 0 
    ? Object.entries(wordFrequency)
        .reduce((max, [word, count]) => count > max.count ? { word, count } : max, { word: '', count: 0 })
    : { word: '', count: 0 };

  return {
    totalCharacters,
    charactersNoSpaces,
    wordCount,
    uniqueWordCount,
    mostUsedWord: mostUsedWord.word,
    mostUsedWordCount: mostUsedWord.count,
    wordFrequency: Object.entries(wordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
  };
};

/**
 * Clears all text and resets analysis
 */
const clearText = () => {
  // Get current active tab
  const activeTab = document.querySelector('.tab-button.active').dataset.tab;
  
  if (activeTab === 'single-line') {
    textInput.value = '';
    textInput.focus();
    performAnalysis('');
  } else {
    multiLineInput.value = '';
    multiLineInput.focus();
    performMultiLineAnalysis('');
  }
};

/**
 * Switches between tabs
 * @param {string} tabName - Name of the tab to switch to
 */
const switchTab = (tabName) => {
  // Update tab buttons
  tabButtons.forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
      btn.classList.remove('border-transparent', 'text-gray-500');
      btn.classList.add('border-blue-500', 'text-blue-600');
    } else {
      btn.classList.remove('active');
      btn.classList.remove('border-blue-500', 'text-blue-600');
      btn.classList.add('border-transparent', 'text-gray-500');
    }
  });

  // Update tab content
  tabContents.forEach(content => {
    if (content.id === `${tabName}-tab`) {
      content.classList.remove('hidden');
    } else {
      content.classList.add('hidden');
    }
  });

  // Focus appropriate input
  if (tabName === 'single-line') {
    setTimeout(() => textInput?.focus(), 100);
  } else {
    setTimeout(() => multiLineInput?.focus(), 100);
  }
};

/**
 * Performs multi-line text analysis
 * @param {string} text - Multi-line text to analyze
 */
const performMultiLineAnalysis = (text) => {
  // Clear previous timeout
  if (multiLineAnalysisTimeout) {
    clearTimeout(multiLineAnalysisTimeout);
  }

  const lines = text.split('\n');
  currentLines = lines;
  
  // Update live count immediately
  multiLineCount.textContent = `${lines.length.toLocaleString()} lines`;

  // Debounce the full analysis
  multiLineAnalysisTimeout = setTimeout(() => {
    updateMultiLineAnalysis(lines);
  }, DEBOUNCE_DELAY);
};

/**
 * Updates the multi-line analysis display
 * @param {Array} lines - Array of text lines
 */
const updateMultiLineAnalysis = (lines) => {
  if (!lines || lines.length === 0 || (lines.length === 1 && lines[0] === '')) {
    lineAnalysisListEl.innerHTML = '<div class="text-sm text-gray-600 italic font-serif">Enter multi-line text to see per-line analysis...</div>';
    selectedLineDetailsEl.classList.add('hidden');
    selectedLineIndex = -1;
    return;
  }

  const analysisHTML = lines
    .map((line, index) => {
      const analysis = getTextAnalysis(line);
      const isEmpty = line.trim() === '';
      return `
        <div class="line-item ${selectedLineIndex === index ? 'selected' : ''}" data-line-index="${index}">
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <div class="line-preview">${escapeHtml(line) || '<em class="text-gray-500">Empty Line</em>'}</div>
              <div class="line-stats ${isEmpty ? 'empty-line' : ''}">
                ${analysis.totalCharacters} chars${analysis.charactersNoSpaces !== analysis.totalCharacters ? ` (${analysis.charactersNoSpaces} no spaces)` : ''}${analysis.wordCount > 0 ? ` • ${analysis.wordCount} words` : ''}
              </div>
            </div>
            <div class="character-count text-sm ml-3">
              ${analysis.totalCharacters}
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  lineAnalysisListEl.innerHTML = analysisHTML;

  // Add click event listeners to line items
  const lineItems = lineAnalysisListEl.querySelectorAll('.line-item');
  lineItems.forEach((item, index) => {
    item.addEventListener('click', () => selectLine(index));
  });
};

/**
 * Selects a line for detailed analysis
 * @param {number} lineIndex - Index of the line to select
 */
const selectLine = (lineIndex) => {
  if (lineIndex < 0 || lineIndex >= currentLines.length) return;

  selectedLineIndex = lineIndex;
  const line = currentLines[lineIndex];
  const analysis = getTextAnalysis(line);

  // Update line item selection
  const lineItems = lineAnalysisListEl.querySelectorAll('.line-item');
  lineItems.forEach((item, index) => {
    if (index === lineIndex) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });

  // Update selected line details
  selectedTotalCharsEl.textContent = analysis.totalCharacters.toLocaleString();
  selectedCharsNoSpacesEl.textContent = analysis.charactersNoSpaces.toLocaleString();
  selectedWordCountEl.textContent = analysis.wordCount.toLocaleString();
  selectedUniqueWordsEl.textContent = analysis.uniqueWordCount.toLocaleString();
  selectedLinePreviewEl.textContent = line || '(Empty Line)';

  // Show details panel
  selectedLineDetailsEl.classList.remove('hidden');
  selectedLineDetailsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

/**
 * Gets text analysis for any string (reusable function)
 * @param {string} text - Text to analyze
 * @returns {Object} Analysis results
 */
const getTextAnalysis = (text) => {
  try {
    if (window.electronAPI && window.electronAPI.textAnalyzer) {
      return window.electronAPI.textAnalyzer.analyzeText(text);
    } else {
      return fallbackAnalysis(text);
    }
  } catch (error) {
    console.error('Analysis error:', error);
    return fallbackAnalysis(text);
  }
};



/**
 * Handles keyboard shortcuts
 * @param {KeyboardEvent} event - Keyboard event
 */
const handleKeyboardShortcuts = (event) => {
  // Ctrl/Cmd + K to clear text
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault();
    clearText();
  }

  // Ctrl/Cmd + 1 to switch to single-line tab
  if ((event.ctrlKey || event.metaKey) && event.key === '1') {
    event.preventDefault();
    switchTab('single-line');
  }

  // Ctrl/Cmd + 2 to switch to multi-line tab
  if ((event.ctrlKey || event.metaKey) && event.key === '2') {
    event.preventDefault();
    switchTab('multi-line');
  }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Focus text input on load
  textInput.focus();
  
  // Perform initial analysis for both tabs
  performAnalysis('');
  performMultiLineAnalysis('');
});

// Single line text input event listeners
textInput.addEventListener('input', (event) => {
  performAnalysis(event.target.value);
});

textInput.addEventListener('paste', (event) => {
  setTimeout(() => {
    performAnalysis(textInput.value);
  }, 10);
});

// Multi-line text input event listeners
multiLineInput.addEventListener('input', (event) => {
  performMultiLineAnalysis(event.target.value);
});

multiLineInput.addEventListener('paste', (event) => {
  setTimeout(() => {
    performMultiLineAnalysis(multiLineInput.value);
  }, 10);
});

// Tab switching event listeners
tabButtons.forEach(button => {
  button.addEventListener('click', (event) => {
    const tabName = event.target.dataset.tab;
    switchTab(tabName);
  });
});

// Button event listeners
clearBtn.addEventListener('click', clearText);

// Keyboard shortcuts
document.addEventListener('keydown', handleKeyboardShortcuts);

// Handle window resize for responsive layout
window.addEventListener('resize', debounce(() => {
  // Recalculate layout if needed
}, 250));

/**
 * Debounce utility function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
} 