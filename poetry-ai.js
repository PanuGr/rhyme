/**
 * Poetry Assistant with AI - Enhanced word finder tool
 * Helps find rhyming and related words using Datamuse API with AI-powered suggestions
 */
import { savePoem, loadPoem } from './modules/saveLoadPoem';
import { sharePoem } from './modules/sharePoem';
// DOM Elements
const wordFinderForm = document.getElementById('wordFinderForm');
const userWordInput = document.getElementById('userWord');
const optionsSelect = document.getElementById('options');
const resultsContainer = document.getElementById('results');
const textareaElement = document.getElementById('textarea');
const loadingSpinner = document.getElementById('loadingSpinner');
const noResultsAlert = document.getElementById('noResultsAlert');
const resultsHeading = document.getElementById('resultsHeading');
const saveTextBtn = document.getElementById('saveTextBtn');
const clearTextBtn = document.getElementById('clearTextBtn');
const copyTextBtn = document.getElementById('copyTextBtn');
const shareTextBtn = document.getElementById('shareTextBtn');
const aiCompletionBtn = document.getElementById('aiCompletionBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const aiLoadingIndicator = document.getElementById('aiLoadingIndicator');

/* 
// AI-API configuration
const API_KEY = process.env.RhymeAI;
const AI_MODEL = "mistralai/mistral-7b-instruct:free";
// Default prompt context for AI
const AI_CONTEXT = `You are a helpful poetry writing assistant. Your task is to help users write better poems by offering suggestions based on the words they've selected and the theme of their writing.`;
 */

// Word history to track what the user has selected
let selectedWords = [];


/**
 * Fetches words from the Datamuse API based on user input
 * @param {string} searchParam - The search parameter type
 * @param {string} searchWord - The word to search for
 * @returns {Promise<Array>} - Promise resolving to array of word objects
 */
async function fetchWords(searchParam, searchWord) {
  try {
    const response = await fetch(
      `https://api.datamuse.com/words?${searchParam}=${encodeURIComponent(searchWord)}&md=pd`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching words:', error);
    return [];
  }
}

/**
 * Filters results to only include words with definitions
 * @param {Array} data - Array of word objects from API
 * @returns {Array} - Filtered array of word objects
 */
function filterResultsWithDefinitions(data) {
  return data.filter(item => item.defs !== undefined);
}

/**
 * Creates a word element and adds click event listener
 * @param {Object} wordData - Word data object from API
 * @returns {HTMLElement} - The created list item element
 */
function createResultElement(wordData) {
  const li = document.createElement('li');
  li.textContent = wordData.word;
  li.className = 'result-item';

  // Add tooltip with definition if available
  if (wordData.defs && wordData.defs.length > 0) {
    const definition = wordData.defs[0].replace(/\t/g, ': ');
    li.setAttribute('data-bs-toggle', 'tooltip');
    li.setAttribute('data-bs-placement', 'top');
    li.setAttribute('title', definition);
    li.setAttribute('aria-label', `${wordData.word}: ${definition}`);
  }

  // Add click event to add word to textarea
  li.addEventListener('click', () => {
    // Insert at cursor position if possible
    const cursorPosition = textareaElement.selectionStart;
    const currentText = textareaElement.value;
    const textBefore = currentText.substring(0, cursorPosition);
    const textAfter = currentText.substring(cursorPosition);

    // Add a space before the word if not at beginning or if previous char isn't a space
    const spaceBefore = (cursorPosition === 0 || textBefore.endsWith(' ')) ? '' : ' ';

    textareaElement.value = textBefore + spaceBefore + wordData.word + textAfter;

    // Set cursor position after inserted word
    const newPosition = cursorPosition + spaceBefore.length + wordData.word.length;
    textareaElement.setSelectionRange(newPosition, newPosition);
    textareaElement.focus();

    // Keep track of selected words for AI context
    selectedWords.push(wordData.word);

    // Limit the history to last 10 words
    if (selectedWords.length > 10) {
      selectedWords.shift();
    }
  });

  return li;
}

/**
 * Displays word results in the results container
 * @param {Array} words - Array of word objects
 */
function displayResults(words) {
  // Clear previous results
  resultsContainer.innerHTML = '';
  noResultsAlert.classList.add('d-none');

  if (words.length === 0) {
    noResultsAlert.classList.remove('d-none');
    resultsHeading.classList.add('d-none');
    return;
  }

  // Show results heading
  resultsHeading.classList.remove('d-none');

  // Create document fragment for better performance
  const fragment = document.createDocumentFragment();

  words.forEach(wordData => {
    const element = createResultElement(wordData);
    fragment.appendChild(element);
  });

  resultsContainer.appendChild(fragment);

  // Initialize Bootstrap tooltips
  const tooltips = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltips.forEach(el => {
    new bootstrap.Tooltip(el);
  });
}

/**
 * Handles the form submission event
 * @param {Event} event - The form submission event
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  const searchParam = optionsSelect.value;
  const searchWord = userWordInput.value.trim();

  if (!searchWord) {
    userWordInput.focus();
    return;
  }

  // Show loading indicator
  loadingSpinner.style.display = 'inline-block';
  resultsContainer.innerHTML = '';
  resultsHeading.classList.add('d-none');
  noResultsAlert.classList.add('d-none');

  try {
    const data = await fetchWords(searchParam, searchWord);
    const filteredData = filterResultsWithDefinitions(data);
    displayResults(filteredData);
  } catch (error) {
    console.error('Error:', error);
    noResultsAlert.classList.remove('d-none');
  } finally {
    // Hide loading indicator
    loadingSpinner.style.display = 'none';
  }
}

/**
 * Clear the textarea content
 */
function clearTextarea() {
  textareaElement.value = '';
  resultsContainer.innerHTML = "";
  userWordInput.value = null;
  selectedWords = [];
}

/**
 * Copy textarea content to clipboard
 */
async function copyToClipboard() {
  const text = textareaElement.value;

  if (!text.trim()) return;

  try {
    await navigator.clipboard.writeText(text);

    // Visual feedback for successful copy
    const originalText = copyTextBtn.textContent;
    copyTextBtn.textContent = 'Copied!';
    copyTextBtn.classList.replace('btn-outline-primary', 'btn-success');

    setTimeout(() => {
      copyTextBtn.textContent = originalText;
      copyTextBtn.classList.replace('btn-success', 'btn-outline-primary');
    }, 2000);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
}

/**
 * Creates an alert message
 * @param {string} message - The message to display
 * @param {string} type - The Bootstrap alert type (success, danger, etc.)
 */
function createAlert(message, type = 'info') {
  const alertContainer = document.getElementById('alertContainer');

  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.setAttribute('role', 'alert');
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  alertContainer.appendChild(alert);

  // Auto-remove after 10 seconds
  setTimeout(() => {
    const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
    bsAlert.close();
  }, 10000);
}

/**
 * Get AI-powered poem completion
 */
async function getAICompletion() {
  const currentText = textareaElement.value.trim();

  if (!currentText) {
    createAlert('Please write some text first for AI to complete', 'warning');
    return;
  }

  toggleAILoading(true);

  try {
    const completionData = await fetchFromAI({
      prompt: `Complete this poem in a natural way, maintaining its style, tone, and theme:\n\n"${currentText}"\n\nContinue from where it left off with 3 more lines.`, tokens: 100
    });

    // Append the completion to the existing text
    textareaElement.value = `${currentText}\n${completionData.trim()}`;

    // Create a success message
    createAlert('AI completion added!', 'success');
  } catch (error) {
    console.error('AI completion error:', error);
    createAlert('Unable to get AI completion at this time', 'danger');
  } finally {
    toggleAILoading(false);
  }
}


/**
 * Analyze the poem structure and provide feedback
 */
async function analyzePoem() {
  const currentText = textareaElement.value.trim();

  if (!currentText) {
    createAlert('Please write a poem first for analysis', 'warning');
    return;
  }

  toggleAILoading(true);

  try {
    const analysisData = await fetchFromAI({
      prompt: `Analyze this poem draft: "${currentText}"\n\nProvide brief, short feedback on: 1) Rhythm/meter, 2) Imagery, 3) Theme coherence, and 4) One specific suggestion for improvement.`
    });

    // Show analysis in modal
    const modalBody = document.getElementById('poemAnalysisBody');
    modalBody.innerHTML = `<div class="poem-analysis">${analysisData}</div>`;

    // Show the modal
    const poemAnalysisModal = new bootstrap.Modal(document.getElementById('poemAnalysisModal'));
    poemAnalysisModal.show();
  } catch (error) {
    console.error('AI analysis error:', error);
    createAlert('Unable to analyze poem at this time', 'danger');
  } finally {
    toggleAILoading(false);
  }
}

/**
 * Toggle the AI loading indicator
 * @param {boolean} isLoading - Whether the AI is loading
 */
function toggleAILoading(isLoading) {
  if (isLoading) {
    aiLoadingIndicator.style.display = 'flex';
    aiCompletionBtn.disabled = true;
  } else {
    aiLoadingIndicator.style.display = 'none';
    aiCompletionBtn.disabled = false;
  }
}

/**
 * Fetch from OpenAI API
 * @param {Object} options - Options for the API request
 * @returns {Promise<string>} - The AI response text
 */
// Client-side κώδικας (παραμένει ο ίδιος με την αρχική πρόταση για standard functions)
async function fetchFromAIviaNetlify(options) {
  try {
    const response = await fetch("/.netlify/functions/fetchFromAI", { // ή το custom path αν χρησιμοποιείτε redirects
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: options.prompt,
        tokens: options.tokens
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Netlify function request failed');
    }

    return data.message;
  } catch (error) {
    console.error('Error calling Netlify function:', error);
    throw error;
  }
}

// Event Listeners
wordFinderForm.addEventListener('submit', handleFormSubmit);
clearTextBtn.addEventListener('click', clearTextarea);
copyTextBtn.addEventListener('click', copyToClipboard);
aiCompletionBtn.addEventListener('click', getAICompletion);
analyzeBtn.addEventListener('click', analyzePoem);
saveTextBtn.addEventListener('click', () => savePoem(textareaElement.value));
shareTextBtn.addEventListener('click', () => sharePoem(textareaElement.value));

// Focus the input field on page load
window.addEventListener('load', () => {
  loadPoem();
  userWordInput.focus();
});