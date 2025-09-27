# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome/Firefox extension boilerplate based on React, TypeScript, Vite, and Turborepo. It provides a modern development environment for building browser extensions with hot module reload and modular architecture.

## Development Commands

### Core Development
- `pnpm dev` - Start Chrome extension development mode with hot reload
- `pnpm dev:firefox` - Start Firefox extension development mode
- `pnpm build` - Build Chrome extension for production
- `pnpm build:firefox` - Build Firefox extension for production
- `pnpm zip` - Build and package extension into a zip file
- `pnpm zip:firefox` - Build and package Firefox extension

### Code Quality
- `pnpm lint` - Run ESLint across all packages
- `pnpm lint:fix` - Fix linting issues automatically
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript type checking

### Testing
- `pnpm e2e` - Run end-to-end tests with WebdriverIO
- `pnpm e2e:firefox` - Run end-to-end tests for Firefox

### Module Management
- `pnpm module-manager` - Interactive tool to enable/disable extension modules (pages)
- `pnpm module-manager -d <module>` - Delete specific module directly

### Utility Commands
- `pnpm clean:install` - Clean reinstall all dependencies
- `pnpm update-version <version>` - Update extension version

## Architecture

### Monorepo Structure with Turborepo

The project uses a monorepo structure managed by Turborepo with the following key directories:

1. **chrome-extension/** - Core extension configuration
   - `manifest.ts` - Manifest v3 configuration (exports to manifest.json)
   - `src/background/` - Background service worker
   - `public/` - Static assets (icons, content CSS)

2. **pages/** - Extension UI pages
   - `popup/` - Extension toolbar popup
   - `options/` - Options/settings page
   - `new-tab/` - New tab override page
   - `side-panel/` - Side panel UI (Chrome 114+)
   - `devtools/` - DevTools extension
   - `devtools-panel/` - DevTools panel content
   - `content/` - Content scripts injected into pages
   - `content-ui/` - React components injected into pages
   - `content-runtime/` - Runtime-injected content scripts

3. **packages/** - Shared packages across the extension
   - `storage/` - Chrome storage API wrapper with TypeScript support
   - `i18n/` - Internationalization with type safety
   - `hmr/` - Custom hot module reload for extension development
   - `vite-config/` - Shared Vite configuration
   - `tailwind-config/` - Shared Tailwind CSS configuration
   - `shared/` - Common utilities, hooks, and types
   - `ui/` - Reusable UI components
   - `env/` - Environment variable management

### Extension Module System

Each page module follows a consistent structure:
- Independent Vite build configuration
- Tailwind CSS with module-specific config
- TypeScript configuration extending base tsconfig
- Can be disabled/enabled via module-manager

### Content Script Architecture

Content scripts are organized by match patterns:
- `matches/all/` - Scripts injected into all pages
- `matches/example/` - Scripts for specific domains
- Each match can have both vanilla JS (`content/`) and React components (`content-ui/`)

### Storage System

The storage package provides a typed wrapper around Chrome storage API:
- Base storage class for creating storage instances
- Example implementation in `example-theme-storage.ts`
- Supports local and session storage areas
- Full TypeScript support with generics

### Environment Variables

Environment variables must follow naming conventions:
- `.env` variables must start with `CEB_` prefix
- CLI variables must start with `CLI_CEB_` prefix
- Dynamic environment values can be added in `packages/env/lib/index.ts`
- Access via `process.env.CEB_*` or import constants from `@extension/env`

### Build System

The build process uses:
- Vite for fast development builds
- Rollup for production optimization
- Turborepo for parallel builds and caching
- Custom HMR plugin for extension-specific hot reload

### Manifest Handling

The manifest is dynamically generated from `chrome-extension/manifest.ts`:
- Supports both Chrome and Firefox
- Firefox-specific settings in `browser_specific_settings`
- Automatic removal of Chrome-only features for Firefox builds
- Version synced with package.json

## Development Workflow

1. **Initial Setup**: Run `pnpm install` after cloning
2. **Environment**: Ensure Node.js version matches `.nvmrc`
3. **Development**: Use `pnpm dev` for hot reload development
4. **Testing**: Load unpacked extension from `dist/` directory
5. **Production**: Build with `pnpm build` and package with `pnpm zip`

## Code Style Guidelines

- **TypeScript**: Strict mode enabled, use proper typing
- **React**: Functional components with hooks
- **Styling**: Tailwind CSS with component-specific configs
- **Formatting**: Prettier with 120 character line width, single quotes
- **Linting**: ESLint with React and TypeScript rules
- **Git hooks**: Husky with lint-staged for pre-commit checks