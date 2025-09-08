# Trip Spin - Devvit Three.js Travel Roulette

Trip Spin is a Reddit Devvit application that creates an interactive Three.js globe-spinning game where users can discover random travel destinations. The app consists of a Three.js frontend client, Express.js backend server, and integrates with Reddit's Devvit platform.

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Prerequisites and Setup

- **CRITICAL**: Requires Node.js 22. Download and install with:
  ```bash
  curl -fsSL https://nodejs.org/dist/v22.13.1/node-v22.13.1-linux-x64.tar.xz -o node-v22.13.1-linux-x64.tar.xz
  tar -xf node-v22.13.1-linux-x64.tar.xz
  sudo mv node-v22.13.1-linux-x64 /opt/node22
  sudo ln -sf /opt/node22/bin/node /usr/local/bin/node
  sudo ln -sf /opt/node22/bin/npm /usr/local/bin/npm
  ```
- Verify installation: `node --version` should show `v22.13.1`

### Build and Development Workflow

- **Install dependencies and build**: `npm install` -- takes 40 seconds. NEVER CANCEL. Set timeout to 180+ seconds.
  - **IMPORTANT**: npm install automatically runs `npm run build` via postinstall hook
- **Build manually**: `npm run build` -- takes 8 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
  - Builds both client (Vite) and server (Vite SSR) to `dist/` directory
  - Client build: ~2-3 seconds to `dist/client/`
  - Server build: ~6-7 seconds to `dist/server/index.cjs`
- **Development server**: `npm run dev` -- NEVER CANCEL. Requires Reddit authentication.
  - Starts 3 concurrent processes: CLIENT (Vite watch), SERVER (Vite watch), DEVVIT (playtest)
  - **AUTHENTICATION REQUIRED**: Provides Reddit OAuth URL for login
  - Client and server builds complete in ~3-7 seconds each, then watch for changes
- **Type check, lint, and format**: `npm run check` -- takes 8 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
  - Runs: TypeScript compilation, ESLint with auto-fix, Prettier formatting
  - **IMPORTANT**: Always run this before committing changes
- **Linting only**: `npm run lint` -- takes 4 seconds
- **Formatting only**: `npm run prettier` -- takes 1-2 seconds

### Deployment Commands (Require Authentication)

- **Login to Reddit/Devvit**: `npm run login` or `npx devvit login`
- **Deploy**: `npm run deploy` -- builds then uploads to Devvit platform
- **Publish**: `npm run launch` -- builds, deploys, and publishes for review

## Validation and Testing

### Manual Validation Requirements

- **ALWAYS run through complete user scenarios after making changes**:
  1. Build the application: `npm run build`
  2. Serve the client locally: `python3 -m http.server 8000 --directory dist/client`
  3. Open http://localhost:8000 and verify:
     - Globe renders properly with Three.js
     - "Spin the Globe" title displays
     - Spin button is visible and interactive
     - Application loads without console errors
- **Test specific functionality**:
  - Globe spinning animation (via gameStore state changes)
  - Three.js scene rendering (camera, globe, lighting)
  - UI controller interactions
  - API endpoint responses (when server is running)

### CI/CD Validation

- **ALWAYS run before committing**: `npm run check`
- **No automated tests exist** - manual validation is critical
- **Build validation**: Ensure `npm run build` completes without errors
- **TypeScript compilation**: Verify all TypeScript files compile successfully

## Architecture and Navigation

### Project Structure

```
src/
├── client/          # Three.js frontend (Vite build)
│   ├── globe/       # Three.js globe components (Scene, Globe, Camera)
│   ├── store/       # Zustand game state management
│   ├── ui/          # UI controller for DOM interactions
│   └── main.ts      # Application entry point
├── server/          # Express.js backend (Vite SSR build)
│   ├── core/        # API services and post creation
│   └── index.ts     # Express server with API routes
└── shared/          # Shared TypeScript types
```

### Key Files and Components

- **Client Entry**: `src/client/main.ts` - Main application class, game loop
- **Globe Rendering**: `src/client/globe/Globe.ts` - Three.js globe with spin logic
- **Game State**: `src/client/store/gameStore.ts` - Zustand store for game states
- **Server API**: `src/server/index.ts` - Express routes for Reddit integration
- **API Types**: `src/shared/types/api.ts` - Shared TypeScript interfaces

### Configuration Files

- **Devvit Config**: `devvit.json` - Reddit platform configuration
- **Build Configs**: `src/*/vite.config.ts` - Separate Vite configs for client/server
- **TypeScript**: `tsconfig.json` - Project references to client/shared/server
- **Linting**: `eslint.config.js` - ESLint configuration for all TypeScript files

## Common Development Tasks

### Making Changes to Game Logic

- **Globe behavior**: Edit `src/client/globe/Globe.ts` for spinning, animations
- **Game states**: Modify `src/client/store/gameStore.ts` for state transitions
- **API endpoints**: Update `src/server/index.ts` for backend functionality
- **ALWAYS test**: Build and manually validate globe spinning after changes

### Adding New Features

- **Frontend**: Add to `src/client/`, import in `main.ts`
- **Backend**: Add routes in `src/server/index.ts`, update API types in `src/shared/`
- **Shared types**: Define in `src/shared/types/` for client-server communication
- **ALWAYS run**: `npm run check` to validate TypeScript and linting

### Debugging Build Issues

- **TypeScript errors**: Check `tsconfig.json` project references match existing directories
- **Build failures**: Run `npm run build:client` and `npm run build:server` separately
- **Missing dependencies**: Run `npm install` with appropriate timeout
- **Vite config issues**: Verify `src/*/vite.config.ts` output directories

## Important Notes

### Timing Expectations

- **npm install**: 40 seconds (includes automatic build)
- **npm run build**: 8 seconds total (client: 3s, server: 6s)
- **npm run check**: 8 seconds (TypeScript + lint + format)
- **npm run dev**: Immediate start, requires authentication for full functionality

### Platform Dependencies

- **Devvit Authentication**: Required for `npm run dev`, deploy commands
- **Reddit Integration**: App runs as embedded widget in Reddit posts
- **External API**: Uses `sathishsundar.in/wp-json/random-country-api/v1/random` for countries
- **Three.js Assets**: Globe textures in `src/client/public/` (earth maps, normals, specular)

### Known Issues and Workarounds

- **No test infrastructure exists** - rely on manual validation scenarios
- **Authentication required** for development server - use build + local serve for testing
- **Build warnings about outDir** - normal behavior, does not affect functionality
- **Security warnings in protobuf** - expected in Devvit builds, does not affect app

## Quick Reference Commands

```bash
# Essential workflow
npm install                    # 40s - install deps + build
npm run check                  # 8s - type check + lint + format
npm run build                  # 8s - build client + server
npm run dev                    # Start development (needs auth)

# Individual commands
npm run build:client           # 3s - build client only
npm run build:server           # 6s - build server only
npm run lint                   # 4s - lint only
npm run prettier               # 2s - format only

# Devvit platform
npm run login                  # Authenticate with Reddit
npm run deploy                 # Build + upload to Devvit
npx devvit whoami             # Check authentication status
```

**CRITICAL REMINDERS:**

- **NEVER CANCEL** builds or long-running commands
- **ALWAYS validate manually** by testing the globe functionality
- **ALWAYS run `npm run check`** before committing changes
- Set timeouts to 180+ seconds for npm install, 60+ seconds for builds
