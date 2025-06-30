/**
 * Writurr - Browser Text Analysis Tool
 * Web version without Electron dependencies
 */

// Text Analysis App - Desktop + Mobile
let selectedWordControls = [];
let currentSelectedLine = null;

// DOM elements
const textInput = document.getElementById('text-input');
const liveCount = document.getElementById('live-count');
const totalChars = document.getElementById('total-chars');
const charsNoSpaces = document.getElementById('chars-no-spaces');
const wordCount = document.getElementById('word-count');
const uniqueWords = document.getElementById('unique-words');
const mostUsedWord = document.getElementById('most-used-word');
const mostUsedCount = document.getElementById('most-used-count');
const wordFrequencyList = document.getElementById('word-frequency-list');

// Multi-line elements
const multiLineInput = document.getElementById('multi-line-input');
const multiLineCount = document.getElementById('multi-line-count');
const lineAnalysisList = document.getElementById('line-analysis-list');
const selectedLineDetails = document.getElementById('selected-line-details');

// Duplicate checker elements
const duplicateCheckerInput = document.getElementById('duplicate-checker-input');
const duplicateCheckerCount = document.getElementById('duplicate-checker-count');
const duplicateCheckerDisplay = document.getElementById('duplicate-checker-display');
const sameSentenceDuplicates = document.getElementById('same-sentence-duplicates');
const withinTenWordsDuplicates = document.getElementById('within-ten-words-duplicates');

// Highlighter elements
const highlighterInput = document.getElementById('highlighter-input');
const highlightedTextDisplay = document.getElementById('highlighted-text-display');
const wordHighlightControls = document.getElementById('word-highlight-controls');
const addWordBtn = document.getElementById('add-word-btn');

// Side-by-side elements
const sideBySideLeftInput = document.getElementById('side-by-side-left-input');
const sideBySideRightInput = document.getElementById('side-by-side-right-input');
const sideBySideLeftCount = document.getElementById('side-by-side-left-count');
const sideBySideRightCount = document.getElementById('side-by-side-right-count');

// Tab elements
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Clear button
const clearBtn = document.getElementById('clear-btn');

// State management
let analysisTimeout = null;
let multiLineAnalysisTimeout = null;
let duplicateCheckerTimeout = null;
let selectedLineIndex = -1;
let currentLines = [];
let highlighterTimeout = null;
let wordHighlightData = [];
let wordControlCounter = 0;
const DEBOUNCE_DELAY = 300; // ms

// --- Stop Words Set ---
const STOP_WORDS = new Set([
  // Articles, conjunctions, prepositions
  'a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'so', 'yet',
  'at', 'by', 'in', 'of', 'on', 'to', 'up', 'with', 'as', 'from', 'into', 'like', 'near', 'off', 'over', 'past', 'since', 'than', 'till', 'upon', 'via', 'about', 'after', 'before', 'behind', 'below', 'beneath', 'beside', 'between', 'beyond', 'during', 'except', 'inside', 'onto', 'outside', 'per', 'through', 'under', 'within', 'without',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'if', 'because', 'although', 'while', 'when', 'where', 'how', 'what', 'which', 'who', 'whom', 'whose', 'that', 'this', 'these', 'those',
  // Pronouns
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs', 'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'yourselves', 'themselves'
]);

// --- Function Declarations (use function declarations for hoisting) ---

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeWord(word) {
  // Lowercase and remove trailing 's or 's (apostrophe or curly apostrophe)
  return word.toLowerCase().replace(/(['']s)$/i, '');
}

function analyzeDuplicates(text) {
  if (!text.trim()) {
    return {
      sameSentenceDuplicates: 0,
      withinTenWordsDuplicates: 0,
      highlightedText: 'Enter text to see duplicate word highlighting...'
    };
  }
  // Get all words and their positions
  const allWords = text.toLowerCase().match(/\b\w+\b/g) || [];
  const wordPositions = {};
  allWords.forEach((word, index) => {
    if (!STOP_WORDS.has(word)) {
      if (!wordPositions[word]) {
        wordPositions[word] = [];
      }
      wordPositions[word].push(index);
    }
  });
  // Treat line breaks as sentence boundaries
  const sentences = text.split(/(?:[.!?]+|\n)/).filter(sentence => sentence.trim().length > 0);
  let sameSentenceCount = 0;
  const sameSentenceSet = new Set();
  sentences.forEach(sentence => {
    const sentenceWords = sentence.trim().toLowerCase().match(/\b\w+\b/g) || [];
    const sentenceWordCounts = {};
    sentenceWords.forEach(word => {
      if (!STOP_WORDS.has(word)) {
        sentenceWordCounts[word] = (sentenceWordCounts[word] || 0) + 1;
      }
    });
    Object.entries(sentenceWordCounts).forEach(([word, count]) => {
      if (count > 1) {
        sameSentenceCount += count - 1;
        sameSentenceSet.add(word);
      }
    });
  });
  // Count within-10-words duplicates (excluding same-sentence duplicates)
  let withinTenWordsCount = 0;
  Object.entries(wordPositions).forEach(([word, positions]) => {
    if (sameSentenceSet.has(word)) return; // skip if already same-sentence duplicate
    if (positions.length > 1) {
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          if (positions[j] - positions[i] <= 10) {
            withinTenWordsCount++;
            break;
          }
        }
      }
    }
  });
  // Highlight duplicates in the text
  const highlightedText = highlightDuplicates(text, sameSentenceSet);
  return {
    sameSentenceDuplicates: sameSentenceCount,
    withinTenWordsDuplicates: withinTenWordsCount,
    highlightedText: highlightedText
  };
}

function highlightDuplicates(text, sameSentenceSet) {
  if (!text.trim()) return text.replace(/\n/g, '<br>');

  // 1. Tokenize text into sentences and words, track positions
  const sentenceRegex = /([^.!?\n]+)([.!?]+|\n|$)/g;
  let match;
  let wordGlobalIdx = 0;
  let wordMeta = []; // { norm, raw, globalIdx, sentenceIdx, wordIdxInSentence }
  let sentenceBoundaries = [];
  let sentenceIdx = 0;
  let pinkPositions = new Set();

  // First pass: collect word metadata and sentence boundaries
  while ((match = sentenceRegex.exec(text)) !== null) {
    let sentence = match[1];
    let delimiter = match[2] || '';
    const words = sentence.match(/\b\w+(?:['']s)?\b/g) || [];
    for (let i = 0; i < words.length; i++) {
      const norm = normalizeWord(words[i]);
      wordMeta.push({
        norm,
        raw: words[i],
        globalIdx: wordGlobalIdx,
        sentenceIdx,
        wordIdxInSentence: i
      });
      wordGlobalIdx++;
    }
    sentenceBoundaries.push({ start: wordGlobalIdx - words.length, end: wordGlobalIdx, delimiter });
    sentenceIdx++;
  }

  // Mark all positions of same-sentence duplicates as pink (using correct global index)
  for (let s = 0; s < sentenceBoundaries.length; s++) {
    const { start, end } = sentenceBoundaries[s];
    const wordCounts = {};
    for (let i = start; i < end; i++) {
      const norm = wordMeta[i].norm;
      if (!norm || STOP_WORDS.has(norm) || norm.length === 0) continue;
      wordCounts[norm] = (wordCounts[norm] || 0) + 1;
    }
    Object.entries(wordCounts).forEach(([norm, count]) => {
      if (!norm || STOP_WORDS.has(norm) || norm.length === 0) return;
      if (count > 1) {
        for (let i = start; i < end; i++) {
          if (wordMeta[i].norm === norm) {
            pinkPositions.add(i);
          }
        }
      }
    });
  }

  // 2. Find within-10-words duplicate positions (only those within 10 of another, and not already pink)
  const bluePositions = new Set();
  const normToPositions = {};
  for (let i = 0; i < wordMeta.length; i++) {
    const norm = wordMeta[i].norm;
    if (!norm || STOP_WORDS.has(norm) || norm.length === 0) continue;
    if (!normToPositions[norm]) normToPositions[norm] = [];
    normToPositions[norm].push(i);
  }
  Object.entries(normToPositions).forEach(([norm, positions]) => {
    for (let i = 0; i < positions.length; i++) {
      if (pinkPositions.has(positions[i])) continue; // pink takes priority
      for (let j = 0; j < positions.length; j++) {
        if (i === j) continue;
        if (Math.abs(positions[i] - positions[j]) <= 10) {
          bluePositions.add(positions[i]);
          break;
        }
      }
    }
  });

  // 3. Render the text, word by word, preserving non-word chars and line breaks
  let highlighted = '';
  let wordRegex = /\b\w+(?:['']s)?\b/g;
  let lastIndex = 0;
  let wordIdx = 0;
  let m;
  while ((m = wordRegex.exec(text)) !== null) {
    // Add text before this word
    highlighted += escapeHtml(text.slice(lastIndex, m.index));
    if (pinkPositions.has(wordIdx)) {
      highlighted += `<span style=\"background-color: #FFB3BA; padding: 1px 2px;\">${escapeHtml(m[0])}</span>`;
    } else if (bluePositions.has(wordIdx)) {
      highlighted += `<span style=\"background-color: #BAE1FF; padding: 1px 2px;\">${escapeHtml(m[0])}</span>`;
    } else {
      highlighted += escapeHtml(m[0]);
    }
    lastIndex = m.index + m[0].length;
    wordIdx++;
  }
  // Add any remaining text
  highlighted += escapeHtml(text.slice(lastIndex));
  // Replace line breaks with <br>
  highlighted = highlighted.replace(/\n/g, '<br>');
  return highlighted;
}

function performDuplicateCheck(text) {
  if (window.duplicateCheckerTimeout) {
    clearTimeout(window.duplicateCheckerTimeout);
  }
  const wordCount = text.trim() ? text.toLowerCase().match(/\b\w+\b/g)?.length || 0 : 0;
  window.duplicateCheckerCount.textContent = `${wordCount.toLocaleString()} words`;
  window.duplicateCheckerTimeout = setTimeout(() => {
    const results = analyzeDuplicates(text);
    updateDuplicateCheckerResults(results);
  }, window.DEBOUNCE_DELAY || 300);
}

function updateDuplicateCheckerResults(results) {
  window.sameSentenceDuplicates.textContent = results.sameSentenceDuplicates.toLocaleString();
  window.withinTenWordsDuplicates.textContent = results.withinTenWordsDuplicates.toLocaleString();
  window.duplicateCheckerDisplay.innerHTML = results.highlightedText;
}

// --- DOMContentLoaded: All DOM queries and event listeners go here ---
document.addEventListener('DOMContentLoaded', function() {
  // Duplicate Checker Elements
  const duplicateCheckerInput = document.getElementById('duplicate-checker-input');
  const duplicateCheckerCount = document.getElementById('duplicate-checker-count');
  const duplicateCheckerDisplay = document.getElementById('duplicate-checker-display');
  const sameSentenceDuplicates = document.getElementById('same-sentence-duplicates');
  const withinTenWordsDuplicates = document.getElementById('within-ten-words-duplicates');

  function safeSetTextContent(el, value) {
    if (el) el.textContent = value;
  }
  function safeSetInnerHTML(el, value) {
    if (el) el.innerHTML = value;
  }

  // Defensive: Only initialize duplicate checker if all elements exist
  if (
    duplicateCheckerInput &&
    duplicateCheckerCount &&
    duplicateCheckerDisplay &&
    sameSentenceDuplicates &&
    withinTenWordsDuplicates
  ) {
    window.DEBOUNCE_DELAY = 300;
    window.duplicateCheckerTimeout = null;

    function safePerformDuplicateCheck(text) {
      if (window.duplicateCheckerTimeout) {
        clearTimeout(window.duplicateCheckerTimeout);
      }
      const wordCount = text.trim() ? text.toLowerCase().match(/\b\w+\b/g)?.length || 0 : 0;
      safeSetTextContent(duplicateCheckerCount, `${wordCount.toLocaleString()} words`);
      window.duplicateCheckerTimeout = setTimeout(() => {
        const results = analyzeDuplicates(text);
        // Ensure line breaks are preserved in the final output
        let highlighted = results.highlightedText;
        if (typeof highlighted === 'string') {
          highlighted = highlighted.replace(/\n/g, '<br>');
        }
        safeSetTextContent(sameSentenceDuplicates, results.sameSentenceDuplicates.toLocaleString());
        safeSetTextContent(withinTenWordsDuplicates, results.withinTenWordsDuplicates.toLocaleString());
        safeSetInnerHTML(duplicateCheckerDisplay, highlighted);
      }, window.DEBOUNCE_DELAY);
    }

    safePerformDuplicateCheck('');
    duplicateCheckerInput.addEventListener('input', function(event) {
      safePerformDuplicateCheck(event.target.value);
    });
    duplicateCheckerInput.addEventListener('paste', function(event) {
      setTimeout(function() {
        safePerformDuplicateCheck(duplicateCheckerInput.value);
      }, 10);
    });
  } else {
    console.warn('Duplicate checker elements missing from DOM. Duplicate checker not initialized.');
  }

  // Word Highlighter Elements
  const wordHighlightControls = document.getElementById('word-highlight-controls');
  const addWordBtn = document.getElementById('add-word-btn');
  const highlighterInput = document.getElementById('highlighter-input');
  const highlightedTextDisplay = document.getElementById('highlighted-text-display');

  // Defensive: Only initialize word highlighter if all elements exist
  if (wordHighlightControls && addWordBtn && highlighterInput && highlightedTextDisplay) {
    if (typeof initializeWordHighlighter === 'function') {
      initializeWordHighlighter();
    }
    // ... (add other word highlighter event listeners here as needed) ...
  } else {
    console.warn('Word highlighter elements missing from DOM. Word highlighter not initialized.');
  }

  // ... (add other feature initializations with similar checks) ...
});

/**
 * Main text analysis function
 * @param {string} text - Text to analyze
 * @returns {Object} Analysis results
 */
const analyzeText = (text) => {
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
 * Updates the analysis results in the UI
 * @param {Object} results - Analysis results
 */
const updateAnalysisResults = (results) => {
  const elements = [
    { el: totalChars, value: results.totalCharacters },
    { el: charsNoSpaces, value: results.charactersNoSpaces },
    { el: wordCount, value: results.wordCount },
    { el: uniqueWords, value: results.uniqueWordCount }
  ];

  elements.forEach(({ el, value }) => {
    el.textContent = value.toLocaleString();
    el.parentElement.classList.add('fade-in');
  });

  mostUsedWord.textContent = results.mostUsedWord || '-';
  mostUsedCount.textContent = results.mostUsedWordCount.toLocaleString();
  updateWordFrequencyList(results.wordFrequency);
};

/**
 * Updates the word frequency list
 * @param {Array} wordFrequency - Array of [word, count] pairs
 */
const updateWordFrequencyList = (wordFrequency) => {
  if (!wordFrequency || wordFrequency.length === 0) {
    wordFrequencyList.innerHTML = '<div class="text-sm text-gray-600 italic font-serif">No words to analyze...</div>';
    return;
  }

  const listHTML = wordFrequency
    .map(([word, count]) => {
      return `
        <div class="flex items-center justify-between py-2 px-3 transition-colors duration-200">
          <span class="font-serif text-sm font-medium text-gray-900 min-w-0 flex-1 truncate">${escapeHtml(word)}</span>
          <span class="text-sm font-semibold text-gray-900 ml-3">${count}</span>
        </div>
      `;
    })
    .join('');

  wordFrequencyList.innerHTML = listHTML;
};

/**
 * Performs text analysis with debouncing
 * @param {string} text - Text to analyze
 */
const performAnalysis = (text) => {
  if (analysisTimeout) {
    clearTimeout(analysisTimeout);
  }

  liveCount.textContent = `${text.length.toLocaleString()} characters`;

  analysisTimeout = setTimeout(() => {
    const results = analyzeText(text);
    updateAnalysisResults(results);
  }, DEBOUNCE_DELAY);
};

/**
 * Clears all text and resets analysis
 */
const clearText = () => {
  const activeTab = document.querySelector('.tab-button.active').dataset.tab;
  
  if (activeTab === 'single-line') {
    textInput.value = '';
    textInput.focus();
    performAnalysis('');
  } else if (activeTab === 'multi-line') {
    multiLineInput.value = '';
    multiLineInput.focus();
    performMultiLineAnalysis('');
  } else if (activeTab === 'duplicate-checker') {
    duplicateCheckerInput.value = '';
    duplicateCheckerInput.focus();
    performDuplicateCheck('');
  } else if (activeTab === 'word-highlighter') {
    highlighterInput.value = '';
    highlighterInput.focus();
    updateHighlightedText();
  }
};

/**
 * Switches between tabs
 * @param {string} tabName - Name of the tab to switch to
 */
const switchTab = (tabName) => {
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

  tabContents.forEach(content => {
    if (content.id === `${tabName}-tab`) {
      content.classList.remove('hidden');
    } else {
      content.classList.add('hidden');
    }
  });

  if (tabName === 'single-line') {
    setTimeout(() => textInput?.focus(), 100);
  } else if (tabName === 'multi-line') {
    setTimeout(() => multiLineInput?.focus(), 100);
  } else if (tabName === 'duplicate-checker') {
    setTimeout(() => duplicateCheckerInput?.focus(), 100);
  } else if (tabName === 'word-highlighter') {
    setTimeout(() => highlighterInput?.focus(), 100);
  }
};

/**
 * Performs multi-line text analysis
 * @param {string} text - Multi-line text to analyze
 */
const performMultiLineAnalysis = (text) => {
  if (multiLineAnalysisTimeout) {
    clearTimeout(multiLineAnalysisTimeout);
  }

  const lines = text.split('\n');
  currentLines = lines;
  
  multiLineCount.textContent = `${lines.length.toLocaleString()} lines`;

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
    lineAnalysisList.innerHTML = '<div class="text-sm text-gray-600 italic font-serif">Enter multi-line text to see per-line analysis...</div>';
    selectedLineDetails.classList.add('hidden');
    selectedLineIndex = -1;
    return;
  }

  const analysisHTML = lines
    .map((line, index) => {
      const analysis = analyzeText(line);
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

  lineAnalysisList.innerHTML = analysisHTML;

  const lineItems = lineAnalysisList.querySelectorAll('.line-item');
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
  const analysis = analyzeText(line);

  const lineItems = lineAnalysisList.querySelectorAll('.line-item');
  lineItems.forEach((item, index) => {
    if (index === lineIndex) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });

  selectedTotalCharsEl.textContent = analysis.totalCharacters.toLocaleString();
  selectedCharsNoSpacesEl.textContent = analysis.charactersNoSpaces.toLocaleString();
  selectedWordCountEl.textContent = analysis.wordCount.toLocaleString();
  selectedUniqueWordsEl.textContent = analysis.uniqueWordCount.toLocaleString();
  selectedLinePreviewEl.textContent = line || '(Empty Line)';

  selectedLineDetailsEl.classList.remove('hidden');
  selectedLineDetailsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

/**
 * Handles keyboard shortcuts
 * @param {KeyboardEvent} event - Keyboard event
 */
const handleKeyboardShortcuts = (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault();
    clearText();
  }

  if ((event.ctrlKey || event.metaKey) && event.key === '1') {
    event.preventDefault();
    switchTab('single-line');
  }

  if ((event.ctrlKey || event.metaKey) && event.key === '2') {
    event.preventDefault();
    switchTab('multi-line');
  }

  if ((event.ctrlKey || event.metaKey) && event.key === '3') {
    event.preventDefault();
    switchTab('word-highlighter');
  }
};

/**
 * Word Highlighter Functions
 */

/**
 * Creates a new word control element
 * @returns {HTMLElement} The word control element
 */
const createWordControl = () => {
  const controlId = ++wordControlCounter;
  const colors = ['#ffeb3b', '#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336', '#00bcd4', '#8bc34a'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  const controlDiv = document.createElement('div');
  controlDiv.className = 'word-control flex items-center space-x-2 mb-2 p-2 bg-white border border-gray-200';
  controlDiv.dataset.controlId = controlId;
  
  controlDiv.innerHTML = `
    <input 
      type="text" 
      placeholder="Enter word..." 
      class="word-input flex-1 px-3 py-1 text-sm border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    >
    <input 
      type="color" 
      value="${randomColor}"
      class="color-input w-8 h-8 border border-gray-300 cursor-pointer"
    >
    <span class="count-display text-sm font-semibold text-gray-600 min-w-12">0</span>
    <button class="remove-word-btn px-2 py-1 text-xs text-red-600 hover:text-red-800 border border-red-300 hover:border-red-500">
      ×
    </button>
  `;
  
  return controlDiv;
};

/**
 * Sets up event listeners for a word control
 * @param {HTMLElement} control - The word control element
 */
const setupWordControlListeners = (control) => {
  const wordInput = control.querySelector('.word-input');
  const colorInput = control.querySelector('.color-input');
  const removeBtn = control.querySelector('.remove-word-btn');
  
  wordInput.addEventListener('input', performHighlighterUpdate);
  colorInput.addEventListener('change', performHighlighterUpdate);
  removeBtn.addEventListener('click', () => {
    if (document.querySelectorAll('.word-control').length > 1) {
      removeWordControl(control);
    }
  });
};

/**
 * Removes a word control
 * @param {HTMLElement} controlElement - The control element to remove
 */
const removeWordControl = (controlElement) => {
  controlElement.remove();
  updateHighlightedText();
};

/**
 * Gets word highlight data from all controls
 * @returns {Array} Array of word highlight objects
 */
const getWordHighlightData = () => {
  const controls = document.querySelectorAll('.word-control');
  return Array.from(controls).map(control => {
    const wordInput = control.querySelector('.word-input');
    const colorInput = control.querySelector('.color-input');
    const word = wordInput.value.trim().toLowerCase();
    return {
      id: control.dataset.controlId,
      word: word,
      color: colorInput.value,
      control: control
    };
  }).filter(item => item.word.length > 0);
};

/**
 * Highlights words in text and updates display
 */
const updateHighlightedText = () => {
  const text = highlighterInput.value;
  if (!text.trim()) {
    highlightedTextDisplay.innerHTML = 'Enter text and add words to highlight to see the results here...';
    // Reset all counts to 0
    document.querySelectorAll('.count-display').forEach(el => el.textContent = '0');
    return;
  }

  const wordData = getWordHighlightData();
  if (wordData.length === 0) {
    highlightedTextDisplay.textContent = text;
    return;
  }

  // Create a map to track word counts
  const wordCounts = {};
  
  let highlightedText = escapeHtml(text);
  
  // Sort words by length (longest first) to avoid partial matches
  const sortedWordData = wordData.sort((a, b) => b.word.length - a.word.length);
  
  sortedWordData.forEach(({ word, color, id }) => {
    if (!word) return;
    
    // Create regex to match whole words (case insensitive)
    const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
    const matches = text.match(regex) || [];
    wordCounts[id] = matches.length;
    
    // Replace matches with highlighted version
    highlightedText = highlightedText.replace(regex, (match) => {
      return `<span style="background-color: ${color}; padding: 1px 2px; border-radius: 2px;">${match}</span>`;
    });
  });
  
  // Update counts in controls
  sortedWordData.forEach(({ id, control }) => {
    const countDisplay = control.querySelector('.count-display');
    countDisplay.textContent = wordCounts[id] || 0;
  });
  
  highlightedTextDisplay.innerHTML = highlightedText;
};

/**
 * Debounced highlighter update
 */
const performHighlighterUpdate = () => {
  if (highlighterTimeout) {
    clearTimeout(highlighterTimeout);
  }
  
  highlighterTimeout = setTimeout(() => {
    updateHighlightedText();
  }, DEBOUNCE_DELAY);
};

/**
 * Updates character count for side-by-side left input
 */
const updateSideBySideLeftCount = (text) => {
  if (sideBySideLeftCount) {
    sideBySideLeftCount.textContent = `${text.length} characters`;
  }
};

/**
 * Updates character count for side-by-side right input
 */
const updateSideBySideRightCount = (text) => {
  if (sideBySideRightCount) {
    sideBySideRightCount.textContent = `${text.length} characters`;
  }
};

/**
 * Initializes word highlighter with first control
 */
const initializeWordHighlighter = () => {
  const firstControl = createWordControl();
  wordHighlightControls.appendChild(firstControl);
  setupWordControlListeners(firstControl);
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  textInput.focus();
  performAnalysis('');
  performMultiLineAnalysis('');
  performDuplicateCheck('');
  initializeWordHighlighter();
  
  // Initialize side-by-side character counts
  if (sideBySideLeftInput) {
    updateSideBySideLeftCount(sideBySideLeftInput.value);
  }
  if (sideBySideRightInput) {
    updateSideBySideRightCount(sideBySideRightInput.value);
  }

  // Duplicate checker text input event listeners
  duplicateCheckerInput.addEventListener('input', (event) => {
    performDuplicateCheck(event.target.value);
  });

  duplicateCheckerInput.addEventListener('paste', (event) => {
    setTimeout(() => {
      performDuplicateCheck(duplicateCheckerInput.value);
    }, 10);
  });
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

// Word highlighter event listeners
highlighterInput.addEventListener('input', performHighlighterUpdate);
highlighterInput.addEventListener('paste', () => {
  setTimeout(performHighlighterUpdate, 10);
});

addWordBtn.addEventListener('click', () => {
  const newControl = createWordControl();
  wordHighlightControls.appendChild(newControl);
  setupWordControlListeners(newControl);
  newControl.querySelector('.word-input').focus();
});

// Side-by-side input event listeners
if (sideBySideLeftInput) {
  sideBySideLeftInput.addEventListener('input', (event) => {
    updateSideBySideLeftCount(event.target.value);
  });

  sideBySideLeftInput.addEventListener('paste', (event) => {
    setTimeout(() => {
      updateSideBySideLeftCount(sideBySideLeftInput.value);
    }, 10);
  });
}

if (sideBySideRightInput) {
  sideBySideRightInput.addEventListener('input', (event) => {
    updateSideBySideRightCount(event.target.value);
  });

  sideBySideRightInput.addEventListener('paste', (event) => {
    setTimeout(() => {
      updateSideBySideRightCount(sideBySideRightInput.value);
    }, 10);
  });
}

// Keyboard shortcuts
document.addEventListener('keydown', handleKeyboardShortcuts);