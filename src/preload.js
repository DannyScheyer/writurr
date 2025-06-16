const { contextBridge } = require('electron');

/**
 * Text analysis utilities exposed to the renderer process
 */
const textAnalyzer = {
  /**
   * Analyzes text and returns comprehensive statistics
   * @param {string} text - The text to analyze
   * @returns {Object} Analysis results
   */
  analyzeText: (text) => {
    if (typeof text !== 'string') {
      throw new Error('Input must be a string');
    }

    // Character count including spaces
    const totalCharacters = text.length;

    // Character count excluding spaces
    const charactersNoSpaces = text.replace(/\s/g, '').length;

    // Word extraction and counting
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .split(/\s+/)
      .filter(word => word.length > 0);

    const wordCount = words.length;
    const uniqueWords = [...new Set(words)];
    const uniqueWordCount = uniqueWords.length;

    // Find most frequent word
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
        .slice(0, 10) // Top 10 most frequent words
    };
  }
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  textAnalyzer
}); 