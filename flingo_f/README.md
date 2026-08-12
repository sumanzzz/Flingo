# FLINGO Frontend

React TypeScript frontend for the FLINGO file and text sharing application.

## Features

- Share text or files with a simple 6-character code
- Receive shared content by entering a code
- QR code generation for easy sharing
- Modern, responsive UI with dark theme
- Drag and drop file upload

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Configuration

The API base URL can be configured in `src/config.ts`. By default, it uses an empty string which works with the Vite proxy configuration in `vite.config.ts` that proxies requests to `http://localhost:8080`.

## Tech Stack

- React 18
- TypeScript
- Vite
- qrcode.react for QR code generation
- Font Awesome for icons


