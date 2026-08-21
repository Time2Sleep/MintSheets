# MintSheets 🍃

MintSheets is a lightweight, privacy-focused, Mobile-First PWA (Progressive Web App) designed for effortless family and personal budget tracking.

Unlike traditional fintech apps, MintSheets operates on a **Serverless / No-Backend architecture**. It securely connects directly to your personal Google Drive via Google OAuth 2.0, utilizing your own Google Sheets as a secure, lifetime cloud database. Your financial data never touches any third-party servers.

> ⚠️ **Note:** This project is under active development. Current status: Architecture and Code Quality environment setup.

---

## ✨ Key Features & Technical Overview

- 📱 **Mobile-First Design** – Engineered specifically for smartphones with full offline capability. Log transactions on the go, even without an internet connection.
- 🔐 **Google OAuth 2.0 Integration** – Implements client-side authentication to securely request access tokens directly from Google Identity Services.
- 🗄️ **Google Sheets API v4** – Automated ledger creation. The application dynamically checks for your budget file and appends transactions smoothly.
- 📡 **Offline-First Resilience** – Uses an internal queue mechanism powered by Pinia. If you are offline, transactions are securely cached in `localStorage` and auto-synchronized when the connection is restored.
- 📦 **PWA Ready** – Installable on iOS and Android devices directly from the browser, featuring full-screen mode, standalone icon, and service workers.

---

## 🛠️ Tech Stack & Code Quality Architecture

This repository is maintained with enterprise-grade standards to ensure code type safety, performance, and formatting consistency:

- **Core:** Vue 3 (Composition API with `<script setup>`) + TypeScript 5+
- **Build Tool:** Vite (Optimized production bundling)
- **State Management:** Pinia (Structured with modular setup stores)
- **Styling:** Tailwind CSS (Custom dark fintech theme)
- **Code Quality Guardrails:**
  - **ESLint v9+ (Flat Config)** – Configured with strict TypeScript checking (`strict: true`, prohibiting implicit types, and enforcing clean code parameters).
  - **Prettier** – Integrated directly with the linter using `eslint-config-prettier` to manage unified code aesthetics upon save.
  - **Git Workflow** – Standardized Feature-Branch flow with enforced automated code reviews.

---

## 🚀 Getting Started Locally

To spin up a local development server for MintSheets, follow these steps:

### 1. Clone the repository

```bash
git clone https://github.com/Time2Sleep/MintSheets
cd mint-sheets
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

MintSheets strictly uses environment variables to secure API credentials. Copy the example configuration and fill in your Google Developer credentials:

```bash
cp .env.example .env.local
```

Open `.env.local` and provide your Google OAuth 2.0 keys:

```env
VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here
VITE_GOOGLE_PROJECT_ID=your_actual_project_id_here
```

### 4. Run the application

```bash
# Start development server
npm run dev

# Run ESLint quality check
npm run lint
```

---

## 📐 Project Architecture (Data Flow)

```text
[User Input]
     │
     ▼
[MintSheets Mobile UI] ───(Offline?)───► [Local Storage Queue]
     │                                            │
  (OAuth Token OK)                         (Network Restored)
     │                                            │
     ▼                                            ▼
[Google Sheets API] ◄─────────────────────────────┘
     │
     ▼
[Your Personal Google Sheet Ledger]
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
