<!-- 
Node.js Tutorial HTTP Server - Pull Request Template
This template ensures comprehensive review and maintains educational objectives
-->

## Title Guidelines
Please use semantic convention format: `[type]: brief description of changes`

**Examples:**
- `feat: add request logging middleware`
- `fix: resolve port binding error handling`
- `docs: update README with Node.js 24.x compatibility`
- `test: improve coverage for error handling`
- `refactor: simplify HTTP response generation`

---

## Description

### What changes are being made?
<!-- Provide a clear and comprehensive description of your changes -->

### Why are these changes necessary?
<!-- Explain the rationale and motivation for the changes -->

### How do these changes impact educational objectives?
<!-- Describe how changes align with or enhance the tutorial's learning goals -->

### Breaking changes notification
<!-- If applicable, describe any breaking changes and migration steps -->

---

## Type of Change
<!-- Check all that apply -->

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality) 
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Educational enhancement
- [ ] Performance improvement
- [ ] Code refactoring
- [ ] Testing improvement

---

## Testing Requirements

### Unit Testing
- [ ] Unit tests pass locally (`npm test`)
- [ ] New tests added for new functionality
- [ ] Test coverage meets minimum thresholds:
  - [ ] Line coverage ≥ 90%
  - [ ] Function coverage ≥ 95%
- [ ] All test files follow naming convention (`*.test.js` in `__tests__/` directory)

### Integration Testing
- [ ] Integration tests pass locally
- [ ] HTTP server functionality tested with SuperTest
- [ ] Manual testing of `/hello` endpoint completed
- [ ] Error handling scenarios validated

### Node.js Version Compatibility
- [ ] Tested with Node.js 18 (Maintenance LTS)
- [ ] Tested with Node.js 20 (Maintenance LTS) 
- [ ] Tested with Node.js 22 (Active LTS - Jod)
- [ ] Tested with Node.js 24 (Current)

### Performance Validation
- [ ] Response time < 100ms for `/hello` endpoint
- [ ] Server startup time < 1 second
- [ ] Memory usage remains < 50MB during testing
- [ ] Performance impact assessed and documented

### Educational Test Scenarios
- [ ] Test cases demonstrate Node.js concepts clearly
- [ ] Test examples suitable for tutorial learning objectives
- [ ] Test scenarios validate educational value of changes

---

## Code Quality Assurance

### ESLint Compliance
- [ ] ESLint passes with zero errors (`npm run lint`)
- [ ] ESLint passes with zero warnings
- [ ] Code follows project ESLint configuration (`.eslintrc.js`)
- [ ] No ESLint disable comments added without justification

### Formatting Standards
- [ ] Code follows 4-space indentation
- [ ] Uses single quotes for string literals
- [ ] Consistent semicolon usage
- [ ] Proper line endings and whitespace handling

### Naming Conventions
- [ ] Variable names are descriptive and educational
- [ ] Function names clearly indicate purpose
- [ ] File names follow project conventions
- [ ] Constants use UPPER_SNAKE_CASE where appropriate

### Code Quality Standards
- [ ] No console.log statements in production code (except intentional logging)
- [ ] Educational comments added for complex Node.js concepts
- [ ] Code complexity remains beginner-friendly
- [ ] Proper error handling implemented
- [ ] Code follows Node.js best practices

---

## Documentation Updates

### README and Core Documentation
- [ ] README.md updated if functionality changed
- [ ] Installation instructions remain accurate
- [ ] Usage examples reflect changes
- [ ] Troubleshooting section updated if applicable

### API Documentation
- [ ] API.md updated for endpoint changes
- [ ] HTTP response format documented
- [ ] Error response codes documented
- [ ] Examples include realistic use cases

### Inline Documentation
- [ ] JSDoc comments added for new functions
- [ ] Educational explanations provided for Node.js concepts
- [ ] Complex logic includes helpful comments
- [ ] Comments explain "why" not just "what"

### Educational Documentation
- [ ] Learning objectives clearly documented
- [ ] New concepts introduced with explanations
- [ ] Code examples demonstrate educational value
- [ ] Documentation maintains beginner-friendly language

---

## Educational Impact Assessment

### Learning Value Analysis
<!-- Describe how these changes enhance or preserve educational value -->

### Complexity Level Assessment  
<!-- Confirm changes maintain beginner-friendly complexity appropriate for tutorial audience -->

### Concept Demonstration
<!-- Explain how new code demonstrates Node.js concepts clearly -->

### Educational Alignment
<!-- Validate that changes align with tutorial educational objectives -->

---

## CI/CD Integration Verification

### Automated Checks
- [ ] GitHub Actions "Node.js Tutorial CI" workflow passes
- [ ] GitHub Actions "Node.js Tutorial Test Suite" passes  
- [ ] All Node.js versions (18, 20, 22, 24) compatible
- [ ] npm audit security scan passes
- [ ] No high or critical security vulnerabilities

### Build Validation
- [ ] `npm install` completes successfully
- [ ] `npm start` launches server without errors
- [ ] `npm test` executes complete test suite
- [ ] `npm run coverage` meets threshold requirements

---

## Reviewer Guidelines

### Educational Review Points
<!-- For reviewers: Please validate educational value and learning outcomes -->
- Educational content accuracy and clarity
- Alignment with Node.js tutorial objectives  
- Beginner-friendly code complexity
- Learning progression appropriateness

### Technical Review Points
<!-- For reviewers: Please verify technical implementation -->
- Code quality standards adherence
- ESLint rule compliance
- Test coverage completeness
- Performance impact assessment

### Documentation Review Points
<!-- For reviewers: Please confirm documentation quality -->
- Documentation accuracy and completeness
- Educational explanation clarity
- Example relevance and correctness
- Troubleshooting information accuracy

---

## Additional Information

### Related Issues
<!-- Link any related GitHub issues -->
Closes #[issue_number]
Related to #[issue_number]

### Dependencies
<!-- List any new dependencies added -->
- [ ] No new npm dependencies added (maintains educational simplicity)
- [ ] If dependencies added, provide educational justification

### Screenshots/Outputs
<!-- Include relevant screenshots, terminal outputs, or test results -->

### Migration Notes
<!-- If applicable, include notes for users updating from previous versions -->

---

## Final Checklist

### Mandatory Completion Items
- [ ] All testing requirements completed
- [ ] Code quality standards met
- [ ] Documentation updated appropriately  
- [ ] Educational impact assessed
- [ ] CI/CD checks pass
- [ ] No breaking changes without justification
- [ ] Changes maintain tutorial educational objectives

### Pre-Submission Verification
- [ ] Pull request title follows semantic convention
- [ ] Description provides comprehensive context
- [ ] All applicable checklist items completed
- [ ] Educational value preserved or enhanced
- [ ] Ready for educational community review

---

<!-- 
Thank you for contributing to the Node.js Tutorial HTTP Server project!
Your contribution helps developers learn fundamental Node.js concepts.

This template ensures high-quality contributions that maintain the educational
value while demonstrating professional development practices.
-->