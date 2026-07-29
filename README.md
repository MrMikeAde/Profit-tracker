# WhatIEarn: Premium Privacy-First Profit Tracker

[![Live Demo](https://img.shields.io/badge/Live%20Demo-whatiearn.netlify.app-004b87?style=for-the-badge&logo=netlify)](https://whatiearn.netlify.app)
[![Built With](https://img.shields.io/badge/Tech%20Stack-React%20%7C%20Vite%20%7C%20TypeScript%20%7C%20Tailwind-blue?style=for-the-badge)](https://whatiearn.netlify.app)
[![Privacy Certified](https://img.shields.io/badge/Privacy-100%25%20Client--side-emerald?style=for-the-badge&logo=shield)](https://whatiearn.netlify.app)

**WhatIEarn** is an enterprise-grade, high-fidelity financial analytics dashboard and statement parser that works entirely in the client's browser. It converts raw, unstructured CSV or Excel bank statements into highly visual, responsive, and printable profit-and-loss insights.

Designed to match the ultra-premium 2026 web design standards, WhatIEarn is clean, private, and lightning-fast. It requires **no user registration**, **no backend database**, and **no server-side uploads**—ensuring absolute bank-grade secrecy for sensitive financial statements.

---

## 📖 One-Page System Design Document

This design document outlines the system architecture, client-side data models, pipeline flows, and UI design standards powering the WhatIEarn application.

### 1. Architectural Blueprint
WhatIEarn is architected as an **SPA (Single Page Application)** client-side sandbox. By offloading computational complexity (parsing, category mapping, visual modeling, and rendering) to the user's browser, the application achieves a zero-latency, infinitely scalable, and zero-risk infrastructure.

```
+---------------------------------------------------------------------------------+
|                                 USER BROWSER                                    |
|                                                                                 |
|  +-------------------------+             +-----------------------------------+  |
|  |     User Interface      | <---------> |        State Controller           |  |
|  | (React + Tailwind v4)   |             |            (App.tsx)              |  |
|  +-------------------------+             +-----------------------------------+  |
|               ^                                       |            ^            |
|               | (Renders View)                        |            |            |
|               v                                       v            | (Parsed    |
|  +-------------------------+             +----------------------+  |  Data)     |
|  |   Recharts Analytics    |             |  Client-Side Parser  | -+            |
|  |  & Heatmap Visualizer   |             |   (xlsx Engine)      |               |
|  +-------------------------+             +----------------------+               |
|                                                       ^                         |
|                                                       | (Drag & Drop)           |
|                                                       |                         |
|                                            [Bank Statement File]                |
+---------------------------------------------------------------------------------+
```

### 2. Zero-Database Model & Data Structures
To satisfy absolute privacy guarantees, WhatIEarn maintains a **Zero-Database (No-DB)** model. Financial information is parsed, computed, and structured in-memory. Once the browser session is closed, the data is entirely wiped from client memory.

#### Core Type Definition (`ReportData`):
```typescript
interface Transaction {
  date: string;         // ISO Format: YYYY-MM-DD
  description: string;  // Raw counterparty/payee text
  category: string;     // Automated or User-mapped Label
  amount: number;       // Positive for Credits (Inflow), Negative for Debits (Outflow)
}

interface ReportData {
  title: string;          // Auto-generated name or filename
  startDate: string;      // Earliest transaction timestamp
  endDate: string;        // Latest transaction timestamp
  currencySymbol: string; // Dynamic currency selector (₦, $, €, etc.)
  transactions: Transaction[];
}
```

### 3. Smart Parsing Pipeline & Adaptive Flow
Standard financial parsers break when statement column headers differ. WhatIEarn implements an **adaptive column mapping mechanism**:

1. **Extraction Layer**: Leverages the `xlsx` parsing engine to extract structured sheets to standard JavaScript objects.
2. **Heuristic Engine**: Automatically scans rows to detect target column associations (e.g. mapping column titles like `TX Date`, `Value Date`, or `Posting Date` to `date`).
3. **Adaptive UI Mapper Fallback**: If headers are non-standard or auto-detection is inconclusive, the interface transitions to an interactive **Column Mapping Form** allowing the user to explicitly select target attributes.
4. **Dashboard Generation**: Converts clean, standardized data arrays into chronological running balance trends, recurring payments matrices, and transaction frequency heatmap models.

---

## 💎 2026 UI Design & Aesthetic Standards

WhatIEarn incorporates premium UI paradigms matching modern design requirements:

* **Fit-to-Screen Canvas**: Fluid layouts and responsive dashboard cells scale effortlessly from mobile phone touchscreens up to ultra-wide 4K workstations.
* **Premium Financial Theme**: Designed around corporate Prussian Blue (`#0a2540`), Deep Indigo accents (`#117aca`), gold highlights (`#ffb81c`), and dynamic transaction indicators (emerald for incoming, crimson for outgoing).
* **The Spending Rhythm Heatmap**: A customized GitHub-style visual heatmap showing daily financial transaction frequency throughout selected years.
* **Pixel-Perfect Print Style Sheet**: Features dedicated CSS rules enabling professional, clean PDF formatting when printing physical report documents.

---

## 🚀 Deployment Guide (Netlify)

This single-page application is structured for instant high-performance deployment on Netlify.

### Method 1: Continuous Deployment via Git (Recommended)
1. **Push Code**: Push this codebase to your personal repository (GitHub/GitLab).
2. **Import Site**: Link your repository to **Netlify**.
3. **Configure Build Settings**:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. **Launch**: Click **Deploy Site**. Every subsequent push to your main branch will trigger a production deployment.

### Method 2: Instant Manual Deployment
1. **Compile the Bundle**:
   ```bash
   npm run build
   ```
2. **Drag & Drop**: Head to [Netlify Drop](https://app.netlify.com/drop) and drag the output `/dist` folder into the browser window to publish instantly.

### Technical Optimizations Enabled:
* **SPA Routing & Redirects**: Netlify SPA reload configurations are resolved via a `_redirects` file mapped directly to `public/` to prevent manual refresh routing bugs (returning 404s).
* **Rollup Asset Chunking**: Configured in `vite.config.ts` to optimize loading times for heavy libraries (`recharts` and `xlsx`) by generating split parallel chunks.

---

## 🛠️ Development & Local Installation

To run this project locally, ensure you have Node.js (version 18+) installed.

1. **Clone & Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start Local Development Server**:
   ```bash
   npm run dev
   ```
3. **Build Code for Production**:
   ```bash
   npm run build
   ```
