# Orix-AI Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ (LTS recommended)
  - Download from: https://nodejs.org/
  - Verify: `node --version`

- **pnpm** (recommended) or npm
  - Install pnpm: `npm install -g pnpm`
  - Verify: `pnpm --version`

- **Git**
  - Download from: https://git-scm.com/
  - Verify: `git --version`

## 🚀 Installation Steps

### Step 1: Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

This will install all required dependencies including:
- Electron
- React & React DOM
- TypeScript
- Vite
- TailwindCSS
- Monaco Editor
- xterm.js
- And more...

### Step 2: Verify Installation

After installation completes, verify that node_modules directory exists and contains all packages.

```bash
# Check if dependencies are installed
ls node_modules
```

## 🏃 Running the Application

### Development Mode

To run Orix-AI in development mode with hot reload:

```bash
# Using pnpm
pnpm electron:dev

# Or using npm
npm run electron:dev
```

This command will:
1. Start the Vite development server (React app)
2. Wait for the server to be ready
3. Launch Electron with the app
4. Enable hot module replacement (HMR)
5. Open DevTools automatically

### Alternative: Run Components Separately

If you want to run the React app and Electron separately:

```bash
# Terminal 1: Start Vite dev server
pnpm dev

# Terminal 2: Start Electron (after Vite is running)
pnpm electron:dev
```

## 🔧 Development Commands

```bash
# Start development mode
pnpm electron:dev

# Run only the React app (without Electron)
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm type-check

# Lint code
pnpm lint

# Format code
pnpm format

# Run tests
pnpm test

# Run tests with UI
pnpm test:ui
```

## 📦 Building for Production

### Build the Application

```bash
# Build both React app and Electron
pnpm build
```

This creates:
- `dist/` - React app build
- `dist-electron/` - Electron main process build

### Package for Distribution

```bash
# Package for your current platform
pnpm electron:build
```

This creates installers in the `release/` directory:
- **Windows**: `.exe` installer and portable version
- **macOS**: `.dmg` and `.zip`
- **Linux**: `.AppImage`, `.deb`, and `.rpm`

## 🐛 Troubleshooting

### Issue: Dependencies not installing

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue: TypeScript errors

**Solution:**
TypeScript errors about missing modules are normal before installing dependencies. Run `pnpm install` first.

### Issue: Electron window not opening

**Solution:**
1. Check if Vite dev server is running (http://localhost:5173)
2. Check console for errors
3. Try restarting: `Ctrl+C` and run `pnpm electron:dev` again

### Issue: Hot reload not working

**Solution:**
1. Ensure you're using `pnpm electron:dev` (not separate commands)
2. Check if port 5173 is available
3. Restart the development server

### Issue: Build fails

**Solution:**
```bash
# Clean build artifacts
rm -rf dist dist-electron release

# Rebuild
pnpm build
```

## 📁 Project Structure

```
orix-ai/
├── electron/           # Electron main process
│   ├── main.ts        # Main process entry
│   └── preload.ts     # Preload script
├── src/               # React application
│   ├── main.tsx       # React entry point
│   ├── App.tsx        # Main component
│   └── index.css      # Global styles
├── dist/              # React build output
├── dist-electron/     # Electron build output
├── release/           # Distribution packages
└── [config files]     # Various configuration files
```

## 🔐 Environment Variables

Create a `.env` file in the root directory for environment-specific configuration:

```env
# Example .env file
VITE_APP_NAME=Orix-AI
VITE_APP_VERSION=0.1.0

# AI Provider API Keys (add when implementing AI features)
# VITE_OPENAI_API_KEY=your_key_here
# VITE_ANTHROPIC_API_KEY=your_key_here
```

**Note:** Never commit `.env` files with real API keys to version control!

## 🎯 Next Steps

After successful setup:

1. ✅ Run the app: `pnpm electron:dev`
2. ✅ Verify the welcome screen appears
3. ✅ Check system information is displayed
4. ✅ Open DevTools (automatically opens in dev mode)
5. ✅ Make a small change to `src/App.tsx` and see hot reload

## 📚 Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## 🤝 Getting Help

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review the [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
3. Check the [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) for development plan
4. Open an issue on GitHub (when available)

---

**Ready to build the future of AI-native development! 🚀**