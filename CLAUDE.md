# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LangInsight is a browser extension that provides instant word and sentence explanations when users select text on webpages. It's built as a monorepo using WXT (Web Extension Tools) framework with React, featuring AI-powered text analysis and translation capabilities.

## Key Commands

### Development
```bash
# Start development server (Chrome extension)
pnpm dev

# Type check
pnpm compile

# Run linter
pnpm lint
pnpm lint:fix
```

### Building
```bash
# Build extension
pnpm build

# Build for Firefox
pnpm build:firefox
```

### Testing
```bash
# Run all tests
pnpm test

# Run specific test (from apps/extension directory)
pnpm vitest run <test-file>
```

### Pre-compilation (Important!)
```bash
# Compile Handlebars templates to TypeScript (runs automatically before dev/build)
pnpm precompile_template
```

**Note**: Template pre-compilation is a required step that runs automatically before `dev` and `build` commands. If you modify `.hbs` files in `src/prompts/`, you may need to manually run this command.

## Architecture

### Monorepo Structure
- **Root**: Contains Turbo configuration for coordinating builds across the monorepo
- **apps/extension**: The main browser extension code

### Entry Points (WXT Framework)
- `entrypoints/background/`: Background service worker handling message routing and translation requests
- `entrypoints/content/`: Content script injected into web pages, renders React app in Shadow DOM
- `entrypoints/popup/`: Extension popup UI for configuration (model, language, API keys)

### Core Services

**LLM Service** (`src/services/llm-service.ts`)
- Manages AI model interactions using the AI SDK
- Provides streaming text generation and translation capabilities
- Handles model selection via `llmModelService`

**Text Selection Service** (`src/services/text-selection-service.ts`)
- Extracts selected text with configurable surrounding context
- Uses `sbd` library for intelligent sentence boundary detection
- Wraps selected text with markers for LLM prompts

**NLP Service** (`src/services/nlp-service.ts`)
- Natural language processing using wink-nlp
- Provides tokenization and text analysis

### State Management
- Uses **Jotai** for reactive state management
- Atoms defined in `src/config/atoms.ts`:
  - `modelAtom`: Stores model provider, model name, API key, and base URL
  - `languageAtom`: Stores target language for translations/responses
- Storage persistence via custom `WXTFieldStorageAdapter` (bridges Jotai with chrome.storage)

### Configuration System
- Schema-based validation using **Zod** (`src/config/type.ts`)
- Pre-compiled Handlebars templates for LLM prompts in `src/prompts/`
- Templates support multiple target languages
- Markers: `<selected_text>` and `</selected_text>` wrap user-selected text in prompts

### UI Components
- **Shadcn/ui** components (Radix UI primitives) in `src/components/ui/`
- Custom components:
  - `Chat.tsx`: AI chat interface with streaming responses
  - `TranslationCard.tsx`: Display translation results
  - `MeaningPopup.tsx`: Popup showing word/sentence meanings
  - `TranslationButton.tsx`: Floating button for triggering translations

### Extension Architecture Flow
1. User selects text on webpage
2. Content script captures selection with context via `TextSelectionService`
3. Message sent to background script via `@webext-core/messaging`
4. Background script routes to appropriate handler (AI translation or MyMemory API)
5. AI requests handled by `LLMService` using configured model
6. Response sent back to content script and displayed via React UI

### Shadow DOM Isolation
- Content script uses Shadow DOM to prevent CSS conflicts
- Tailwind styles injected into shadow root
- UI components have `NOTRANSLATE_CLASS` to avoid interfering with page translations

## Development Guidelines

### From Cursor Rules
- **Package Manager**: Use `pnpm`
- **Language**: TypeScript + React
- **Framework**: WXT for extension development
- **UI Library**: Shadcn/ui components
- **Styling**: Tailwind CSS
- **State Management**: Jotai atoms
- **Icons**: Prefer `lucide-react`
- **Testing**: Vitest
- **Imports**: Use `@/` alias for `src` directory

### WXT Framework Standards
- File structure follows WXT conventions (entrypoints/background, entrypoints/content, entrypoints/popup)
- Configuration in `wxt.config.ts`, not manual manifest.json editing
- Use `createShadowRootUi` for content script UI mounting
- Use `@webext-core/messaging` for type-safe extension messaging

### Key Patterns

**Prompt Template Management**
- Templates are in `src/prompts/*.hbs` (e.g., `word_meaning_Chinese.hbs`)
- Pre-compiled to `src/prompts/templates.precompiled.ts` before build
- Load using `Handlebars.templates['template_name_language']`

**Translation Type Selection**
- Background script uses a strategy pattern (`translationActionMap`)
- Supports both AI-based and MyMemory API translation
- Type-safe via `TranslateType` enum

**Storage Validation**
- All config values validated via Zod schemas before storage
- Invalid data falls back to defaults without crashing UI
- Watch pattern updates UI when storage changes

### Important Files
- `wxt.config.ts:20-25`: Content script matching patterns
- `src/config/atoms.ts:18-32`: State atoms and storage adapters
- `src/services/llm-service.ts:13-27`: Streaming text generation
- `src/services/text-selection-service.ts:33-91`: Text selection with context extraction
- `src/entrypoints/background/index.ts:53-71`: Message routing and translation handlers

### Debugging
```bash
# Get Chrome debugging port
pnpm get-chrome-debugging-port
```

### Testing Notes
- Tests are in `src/services/text-selection-service.test.ts`
- Use `WxtVitest` plugin for testing in extension context
- `vitest.setup.ts` provides test globals and setup
