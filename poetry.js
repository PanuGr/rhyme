/**
 * Poetry Assistant - Word finder tool
 * Helps find rhyming and related words using the Datamuse API
 */

// DOM Elements
const wordFinderForm = document.getElementById('wordFinderForm');
const userWordInput = document.getElementById('userWord');
const optionsSelect = document.getElementById('options');
const resultsContainer = document.getElementById('results');
const textareaElement = document.getElementById('textarea');
const loadingSpinner = document.getElementById('loadingSpinner');
const noResultsAlert = document.getElementById('noResultsAlert');
const resultsHeading = document.getElementById('resultsHeading');
//const clearTextBtn = document.getElementById('clearTextBtn');
const copyTextBtn = document.getElementById('copyTextBtn');

// Clear the textarea on page load
textareaElement.value = '';

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
  textareaElement.focus();
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

// Event Listeners
wordFinderForm.addEventListener('submit', handleFormSubmit);
//clearTextBtn.addEventListener('click', clearTextarea);
copyTextBtn.addEventListener('click', copyToClipboard);

// Add keyboard shortcuts 
document.addEventListener('keydown', (event) => {
  // Ctrl/Cmd + Enter to search
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && document.activeElement === userWordInput) {
    wordFinderForm.requestSubmit();
  }
});

// Focus the input field on page load
window.addEventListener('load', () => {
  userWordInput.focus();
});