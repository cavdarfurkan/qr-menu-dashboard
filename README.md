# QR Menu Dashboard

A modern, full-stack dashboard application for managing QR code-based digital menus. Built with React Router 7, TypeScript, and TailwindCSS.

## ✨ Features

### Core Functionality

- 🍽️ **Menu Management** - Create, edit, and manage digital menus
- 🎨 **Theme System** - Upload and apply custom themes to menus
- 📝 **Dynamic Content** - Schema-based content management with JSON Schema forms
- 🔐 **Authentication** - Secure login and registration system
- 🌍 **Internationalization** - Multi-language support (English, Turkish, Polish)
- 🌓 **Dark Mode** - System, light, and dark theme support

### Technical Features

- 🚀 **Server-Side Rendering** - Fast initial page loads with React Router SSR
- 🔒 **Type Safety** - Full TypeScript coverage
- 🎯 **Form Validation** - Type-safe forms with React Hook Form and Zod
- 🔄 **State Management** - Zustand for global state

## 🛠️ Tech Stack

### Frontend

- **Framework**: [React Router 7](https://reactrouter.com/) (SSR)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **UI Components**: Radix UI + shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **JSON Schema Forms**: RJSF (React JSON Schema Form)
- **State Management**: Zustand
- **i18n**: i18next + react-i18next

### Development

- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library + MSW
- **Code Quality**: Prettier + Husky + lint-staged
- **Package Manager**: npm (or Bun)

## 📋 Prerequisites

- **Node.js**: >= 22.0.0
- **npm**: >= 10.0.0 (or Bun >= 1.0.0)

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd qr-menu-dashboard

# Install dependencies
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run dev-host         # Start dev server with network access

# Building
npm run build            # Create production build
npm run start            # Start production server

# Testing
npm run test             # Run tests in watch mode
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage report

# Code Quality
npm run typecheck        # Run TypeScript type checking
npm run prettier:check   # Check code formatting
npm run prettier:format  # Format code with Prettier

# Internationalization
npm run i18n:lint        # Lint translation files
npm run i18n:sync        # Sync translation keys across locales
npm run i18n:types       # Generate TypeScript types for translations
```

## 📁 Project Structure

```
qr-menu-dashboard/
├── app/
│   ├── @types/              # TypeScript type definitions
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   └── rjsf/           # JSON Schema form components
│   ├── constants/           # App constants
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and API client
│   ├── locales/            # i18n translation files
│   │   ├── en/            # English translations
│   │   ├── tr/            # Turkish translations
│   │   └── pl/            # Polish translations
│   ├── routes/             # React Router routes
│   │   ├── auth/          # Authentication routes
│   │   └── app_layout/    # Protected app routes
│   ├── stores/             # Zustand state stores
│   ├── test/               # Test utilities and mocks
│   ├── auth_context.tsx    # Authentication context
│   ├── i18n.ts             # i18n configuration
│   └── root.tsx            # Root component
├── public/                  # Static assets
├── .github/
│   └── workflows/          # CI/CD workflows
├── coverage/               # Test coverage reports
├── Dockerfile              # Docker configuration
└── package.json
```

## 🌍 Internationalization

This project uses i18next for internationalization with a well-organized namespace structure:

- `common` - Shared UI components and actions
- `auth` - Authentication pages
- `menu` - Menu management
- `content` - Content management
- `theme` - Theme management
- `settings` - Settings page
- `error` - Error messages
- `validation` - Form validation messages
- `sidebar` - Navigation
- `ui_components` - UI component labels

### Adding/Updating Translations

```bash
# 1. Edit translation files in app/locales/
# 2. Sync translations across all locales
npm run i18n:sync

# 3. Generate TypeScript types
npm run i18n:types

# 4. Format the generated files (done automatically by Husky on commit)
npm run prettier:format
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## 🔒 Authentication

The app uses a custom authentication context with protected routes:

- **Public routes**: `/login`, `/register`
- **Protected routes**: `/dashboard`, `/menu`, `/themes`, `/settings`

Authentication state is managed via `AuthContext` and persisted across sessions.

## 🎨 Theming

The app supports:

- **System theme detection**
- **Light/Dark mode toggle**
- **Custom menu themes** (uploadable ZIP files)

Theme preferences are stored in local storage and sync across tabs.

## 📦 Building for Production

Create a production build:

```bash
npm run build
```

This generates:

```
build/
├── client/    # Static assets (served by CDN or web server)
└── server/    # Server-side code (Node.js)
```

Start the production server:

```bash
npm run start
```

## 🐳 Docker Deployment

Build and run with Docker:

```bash
# Build the image
docker build -t qr-menu-dashboard .

# Run the container
docker run -p 3000:3000 qr-menu-dashboard
```

The containerized application can be deployed to:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

## 🔄 CI/CD

The project includes GitHub Actions workflows:

### Workflows

- **Tests** (`.github/workflows/test.yaml`)
  - Runs type checking
  - Executes test suite with coverage
  - Archives coverage reports

- **i18n Checks** (`.github/workflows/i18n-check.yaml`)
  - Validates code formatting with Prettier
  - Lints translation files
  - Ensures i18n consistency

Both workflows run on push and pull requests to `main` and `dev` branches.

## 🤝 Contributing

### Code Quality

This project uses:

- **Prettier** for code formatting
- **Husky** for git hooks
- **lint-staged** for pre-commit checks

All code is automatically formatted before commit.

### Commit Guidelines

The project follows conventional commits for clear git history.

## 👥 Authors

Furkan Çavdar
