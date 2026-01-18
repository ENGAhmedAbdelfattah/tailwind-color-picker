Contributing to Tailwind Color Picker
======================================================

First off, thank you for considering contributing to Tailwind Color Picker! It's people like you that make the open-source community such an amazing place to learn, inspire, and create.

We welcome contributions of all kinds, from fixing typos and reporting bugs to submitting feature enhancements and new code.

Table of Contents
------------

- [Contributing to Tailwind Color Picker](#contributing-to-tailwind-color-picker)
  - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
    - [Reporting Bugs](#reporting-bugs)
    - [Suggesting Enhancements](#suggesting-enhancements)
    - [Your First Pull Request](#your-first-pull-request)
  - [Development Process](#development-process)
    - [Testing](#testing)
    - [Debugging in VS Code](#debugging-in-vs-code)
  - [Style Guide](#style-guide)
    - [TypeScript](#typescript)
    - [Formatting](#formatting)
    - [Commit Messages](#commit-messages)
  - [Submission Checklist](#submission-checklist)

Code of Conduct
----------------

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

TL;DR: Be respectful, be kind, and be patient.

-------------------

### Reporting Bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

Before Submitting a Bug Report:

1. Check the debugging console in VS Code (Help -> Toggle Developer Tools) for error messages.
2. Search the existing Issues to see if the problem has already been reported.

How to Submit a Good Bug Report:

1. Open a new Issue using the Bug Report template.
2. Use a clear and descriptive title.
3. Describe the exact steps to reproduce the problem.
4. Include screenshots or animated GIFs if possible (visuals help immensely!).
5. State which OS, VS Code version, and Extension version you are using.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion, including completely new features and minor improvements to existing functionality.

How to Submit an Enhancement Suggestion:

1. Open a new Issue using the Feature Request template.
2. Use a clear and descriptive title.
3. Provide a step-by-step description of the suggested enhancement in as much detail as possible.
4. Explain why this enhancement would be useful to most users.

### Your First Pull Request

Ready to contribute code? Here is the workflow:

1. Fork the repository on GitHub.
2. Clone your fork locally:

    git clone https://github.com/your-username/tailwind-color-picker.git
    cd tailwind-color-picker
3. Create a branch for your edit:

    git checkout -b feature/amazing-feature
    # or
    git checkout -b fix/annoying-bug
4. Install dependencies:

    npm install
5. Make your changes.
6. Test your changes (see [Testing](#testing) for details).
7. Commit your changes with a clear commit message.
8. Push your branch to GitHub.
9. Open a Pull Request on GitHub.

Development Process
--------------------

### Testing

We use Jest for testing. Before submitting your Pull Request, please ensure that all tests pass.

* Run all tests: `npm test`
* Run tests in watch mode (useful during development): `npm test -- --watch`

### Debugging in VS Code

Open the project in VS Code.

Press F5 to launch the Extension Development Host.

This opens a new VS Code window with your extension loaded. You can test your changes there.

Style Guide
------------

### TypeScript

We follow standard TypeScript best practices.

### Formatting

Please ensure your code is formatted. If the project has a `.prettierrc` or `.eslintrc`, ensure no linting errors remain.

### Commit Messages

Please write clear and concise commit messages.

Bad: fix bug

Good: Fix color parsing issue in nested @apply directives

Submission Checklist
------------------------

Before submitting your Pull Request, please check the following:

* [ ] I have read the Contributing Guidelines.
* [ ] My code follows the code style of this project.
* [ ] I have added tests to cover my changes (if applicable).
* [ ] All new and existing tests passed.

Thank you for your contribution!
