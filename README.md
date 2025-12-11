# Rhyme

In this project, I've made a web application, which uses fetch-requests to a word database, provided by datamuse.org in order to help you find words that rhyme so you can write easier poems or songs. There's also AI-assistance with a model from [OpenRouter](https://openrouter.ai/)

## Version 2
This version focuses on refactoring the codebase to meet the new standards. The functionality remains the same.
New updates include:

### HTML Improvements:
- Semantic HTML: Added proper structural elements and improved accessibility
- Resource Loading: Optimized script loading with `defer` attribute
- Bootstrap v5
- CSS Variables: Added CSS custom properties for consistent styling and separate file
- Better Visual Hierarchy: Improved layout and whitespace for better usability

### JavaScript Improvements:
- Modern JS Syntax: Replaced older syntax with ES6+ features
- Async/Await: Replaced fetch request with more readable async/await
- Error Handling: Added error handling throughout the application
- Code Organization: Organized code into functions
- Performance Optimization: Reduced DOM operations
- Events: Improved event handling for dynamic elements

### Bug Fixes:
- Added proper error handling for API failures
- Added input validation to prevent empty searches
- Added visual feedback for loading states
- Added proper cursor focus management

### Functional Improvements

- Enhanced Word Selection: Improved word selection with better cursor positioning
- Result Display: Enhanced results with clear visual feedback
- Copy to Clipboard: Added clipboard functionality for the poem text
- Clear Text: Added ability to clear the text area
- Keyboard Shortcuts: Added keyboard shortcuts for common actions
- Visual Feedback: Added loading indicators and success/error messages
- Tooltip Enhancement: Improved tooltip display for word definitions
- Mobile-Friendly UI: Made the interface work well on mobile devices

## Version 3
This version integrates AI into this application. The AI is providing creative assistance:
- Poem Completion: Have AI complete your poem based on what you've written
- Structure Analysis: Get feedback on rhythm, imagery, and coherence
- Two-Panel Interface: Separated word finding from composition for better workflow