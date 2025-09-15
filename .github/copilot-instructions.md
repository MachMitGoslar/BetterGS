# GitHub Copilot Instructions for betterGS

## Project Context
This project appears to be an enhancement or improvement to Google Apps Script (GS) development.

## Code Style & Standards
- Use TypeScript/JavaScript ES6+ syntax
- Follow consistent naming conventions (camelCase for variables/functions, PascalCase for classes)
- Add JSDoc comments for functions and classes
- Use meaningful variable and function names
- Keep functions small and focused on single responsibilities
- Prioritize Observables and RXJS over async/await where applicable

## Google Apps Script Specific Guidelines
- Handle GAS execution time limits (6 minutes for simple triggers, 30 minutes for installable triggers)
- Implement proper error handling with try-catch blocks
- Use PropertiesService for storing configuration data
- Consider using LockService for concurrent execution protection

## Best Practices
- Always validate inputs and handle edge cases
- Use const/let instead of var
- Implement proper logging using console.log or Logger.log
- Add comments explaining complex business logic
- Structure code with clear separation of concerns
- Use async/await patterns where applicable

## Testing & Documentation
- Include example usage in comments
- Document API endpoints and expected parameters
- Add inline comments for complex algorithms
- Consider adding unit tests where possible

## Styling Preferences
- Use 2 spaces for indentation
- Limit lines to 80 characters
- Use single quotes for strings
- Include semicolons at the end of statements
- Use trailing commas in multi-line objects and arrays
- Maintain consistent spacing around operators and after commas
- Use blank lines to separate logical sections of code
- Group related functions and variables together
- Avoid deeply nested code; refactor into smaller functions if necessary

## Frontend Styling (if applicable)
- Maintain a consistent color scheme and typography
- Utilize Ionic UI Elements first before custom CSS
- Ensure mobile Design is prioritized
- Follow accessibility best practices (ARIA roles, keyboard navigation, etc.)
- Use CSS variables for theming and maintainability, if not already declared by themes.scss or variables.scss
- Keep in mind that UI and UX should be evenly prioritized between light and dark modes
- Prioritize reusable components and styles throughout the project
- Prioritize animations and transitions for better user experience

