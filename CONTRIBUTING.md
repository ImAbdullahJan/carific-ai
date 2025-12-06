# Contributing to Carific.ai

Thank you for your interest in contributing to Carific.ai! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/carific-ai.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Set up environment variables (see README.md)
6. Run the development server: `npm run dev`

## Development Workflow

### Code Style

- We use TypeScript for type safety
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Add comments for complex logic

### Commit Messages

Use clear, descriptive commit messages:

- `feat: add new feature`
- `fix: resolve bug in component`
- `docs: update README`
- `refactor: improve code structure`
- `style: format code`
- `test: add tests`

### Pull Requests

1. Ensure your code builds without errors: `npm run build`
2. Run linting: `npm run lint`
3. Update documentation if needed
4. Create a pull request with a clear description
5. Link any related issues

## Project Structure

```
app/                  # Next.js App Router pages
components/
  landing/            # Landing page sections
  ui/                 # shadcn/ui components
config/               # Configuration files
lib/                  # Utility functions and services
prisma/               # Database schema
```

## Reporting Issues

When reporting issues, please include:

- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (OS, browser, Node version)

## Feature Requests

We welcome feature requests! Please:

- Check existing issues first
- Describe the feature and its use case
- Explain why it would benefit the project

## Good First Issues

Look for issues labeled `good first issue` - these are great for newcomers!

## Code of Conduct

Be respectful and inclusive. We're building something together.

## Questions?

Open a discussion on GitHub or reach out to the maintainers.

---

Thank you for contributing! 🚀
