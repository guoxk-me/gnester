# AGENTS.md

This file contains guidelines and commands for agentic coding agents working in this NestJS repository.

## Build Commands

### Development

- `pnpm run start` - Start the application in development mode
- `pnpm run start:dev` - Start with watch mode (auto-restart on changes)
- `pnpm run start:debug` - Start with debugging enabled

### Production

- `pnpm run build` - Build the application for production
- `pnpm run start:prod` - Start the production build

### Code Quality

- `pnpm run lint` - Run ESLint with auto-fix
- `pnpm run format` - Format code with Prettier

### Testing

- `pnpm run test` - Run all unit tests
- `pnpm run test:watch` - Run tests in watch mode
- `pnpm run test:cov` - Run tests with coverage report
- `pnpm run test:e2e` - Run end-to-end tests
- `pnpm run test -- <test-file>` - Run a single test file (e.g., `pnpm run test -- app.controller.spec.ts`)

## Code Style Guidelines

### TypeScript Configuration

- Target: ES2023
- Module system: NodeNext with ES modules
- Strict mode enabled with some relaxed rules
- Decorators enabled for NestJS

### Import Style

- Use ES module imports (`import { } from 'module'`)
- NestJS imports first, then third-party, then local imports
- Example import order:
  ```typescript
  import { Controller, Get } from '@nestjs/common';
  import { ExternalService } from 'external-package';
  import { LocalService } from './local.service';
  ```

### Formatting (Prettier)

- Single quotes for strings
- Trailing commas for all objects/arrays
- 2-space indentation
- Auto line ending detection

### ESLint Rules

- `@typescript-eslint/no-explicit-any`: disabled (any allowed)
- `@typescript-eslint/no-floating-promises`: warning (async/await handling)
- `@typescript-eslint/no-unsafe-argument`: warning (type safety)
- Prettier integration enforced

### Naming Conventions

- Classes: PascalCase (e.g., `AppController`, `AppService`)
- Methods/variables: camelCase (e.g., `getHello`, `configService`)
- Files: kebab-case for features (e.g., `user-profile.service.ts`)
- Test files: `.spec.ts` suffix for unit tests, `.e2e-spec.ts` for e2e tests

### NestJS Patterns

- Use dependency injection via constructor
- Decorators for controllers, methods, and properties
- Modules for organizing related components
- DTOs with class-validator for request/response validation

### Error Handling

- Use NestJS built-in exception filters
- Create custom exceptions when needed
- Validate environment variables with class-validator
- Use try-catch for external service calls

### Configuration

- Environment variables loaded via @nestjs/config
- YAML configuration files in `config/` directory
- Validation using class-validator decorators
- Separate configuration for different environments

### Testing Patterns

- Unit tests: `.spec.ts` files alongside source files
- E2E tests: in `test/` directory with `.e2e-spec.ts` suffix
- Use NestJS TestingModule for unit tests
- Use supertest for HTTP testing in e2e tests
- Mock external dependencies in tests

### File Structure

```
src/
├── app.module.ts          # Root module
├── main.ts                # Application entry point
├── common/                # Shared utilities
├── features/              # Feature modules
├── config/                # Configuration files
└── *.spec.ts             # Unit tests

test/
└── *.e2e-spec.ts         # End-to-end tests
```

### Package Management

- Uses pnpm as package manager
- Install dependencies: `pnpm install`
- Lock file: `pnpm-lock.yaml`

### Git Hooks

- Pre-commit hooks run linting automatically
- Always run `pnpm run lint` before committing if hooks are bypassed

## Development Workflow

1. Make changes to source code
2. Run `pnpm run lint` to check code quality
3. Run `pnpm run test` to verify tests pass
4. Run `pnpm run format` to ensure consistent formatting
5. Test the application with `pnpm run start:dev`
6. Build with `pnpm run build` before deployment

## Important Notes

- This is a NestJS TypeScript application
- Uses ES modules (import/export syntax)
- Configuration via YAML files and environment variables
- Jest for testing with both unit and e2e test suites
- ESLint + Prettier for code quality and formatting
- No existing Cursor or Copilot rules to follow
