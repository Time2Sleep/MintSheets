# MintSheets 🍃

MintSheets is a Mobile-First PWA for personal and family budget tracking that uses the user's own Google Spreadsheet as its primary data store.

Unlike traditional fintech apps, MintSheets operates on a **Serverless / No-Backend architecture**. It securely connects directly to your personal Google Drive via Google OAuth 2.0, utilizing your own Google Sheets as a secure, lifetime cloud database. Your financial data never touches any third-party servers.

> ⚠️ **Note:** This project is under active development.

### Implemented

- Google authentication
- Spreadsheet discovery/creation
- Spreadsheet initialization
- Settings
- Transaction creation
- Transaction synchronization
- Offline transaction capture
- PWA setup

---

## ✨ Key Features & Technical Overview

- 📱 **Mobile-First Design** – Engineered specifically for smartphones with Offline transaction capture. Log transactions on the go, even without an internet connection.
- 🔐 **Google OAuth 2.0 Integration** – Implements client-side authentication to securely request access tokens directly from Google Identity Services.
- 📊 **Google Sheets as a data store** — MintSheets automatically finds or creates the application's spreadsheet and manages its structure.
- ⚙️ **Automatic spreadsheet setup** — required sheets, headers, initial settings, and transaction tables are created automatically.
- 💸 **Transaction management** — record income and spending transactions with categories, dates, amounts, and optional comments.
- 📡 **Offline transaction capture** – Transactions can be recorded when Google API is temporarily unavailable and synchronized later.
- 🔄 **ID-based synchronization** — transactions use persistent IDs to detect already synchronized records and safely retry pending transactions.
- 📈 **Basic financial analytics** — provides an overview of income, spending, and balance data.
- 🔒 **No custom backend** — financial data is stored in the user's own Google account

---

## 🛠️ Tech Stack & Code Quality Architecture

### Core

- **Vue 3** — Composition API with `<script setup>`
- **TypeScript** — strict type checking
- **Vite** — development server and production build
- **Pinia** — application state management
- **Vue Router** — client-side routing
- **Tailwind CSS** — UI styling
- **PWA** — installable application and service worker support

### Google Integration

- **Google Identity Services** — OAuth authentication
- **Google Sheets API v4** — spreadsheet persistence
- **Google Drive API** — spreadsheet discovery

### Code Quality

- **ESLint** — static analysis and TypeScript rules
- **Prettier** — consistent formatting
- **TypeScript strict mode** — stronger compile-time guarantees

---

## 📐 Project Architecture

MintSheets follows a layered architecture that separates UI, application logic, state management, and external API communication.

```text
┌──────────────────────┐
│       Vue UI         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    Pinia Stores      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│      Services        │
│ Application Logic    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│       API Layer      │
│ Google Sheets / GIS  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    Google APIs       │
└──────────────────────┘
```

### Architectural principles

- **API layer is independent from Pinia** — API modules only handle communication with external services.
- **Services contain use cases** — spreadsheet initialization, synchronization, and other application operations live outside the API layer.
- **Stores manage reactive state** — Pinia stores expose application state and coordinate operations required by the UI.
- **Spreadsheet context is explicit** — operations working with Google Sheets receive the spreadsheet and sheet IDs through a `SpreadsheetContext`.
- **Spreadsheet structure is declarative** — the expected Google Spreadsheet structure is defined by a typed schema instead of being scattered across service code.
- **Infrastructure details stay at the boundaries** — Google Sheets request objects are built close to the API layer rather than being exposed throughout the application.

---

### Application flow:

```text
[Vue UI]
    │
    ▼
[Pinia Stores]
    │
    ▼
[Application / Services]
    │
    ▼
[Google Sheets API]
    │
    ▼
[Google Spreadsheet]
```

### Offline transaction flow:

```text
[Create Transaction]
        │
        ▼
   [Local Store]
        │
        ├── Google API available ──► [Google Sheets]
        │                                │
        │                                ▼
        │                         [Confirmed by ID]
        │
        └── API unavailable
                    │
                    ▼
             [Pending Transaction]
                    │
                    ▼
             [Later Synchronization]
```

### Spreadsheet lifecycle:

```text
Find existing spreadsheet
        ↓
Check spreadsheet status
        │
        ├── DRAFT ──► Settings
        │
        └── ACTIVE ─► Load settings
                         ↓
                    Sync transactions
                         ↓
                       Main
```

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

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
