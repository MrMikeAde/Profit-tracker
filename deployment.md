# WhatIEarn Deployment Guide: Netlify

This document contains instructions to ensure a highly optimized, fully functional, and secure production deployment of the **WhatIEarn Profit Tracker** on Netlify.

---

## 🚀 Step-by-Step Deployment Instructions

### Method A: Continuous Integration (CI/CD) via GitHub
Using Netlify's automatic build pipelines is the recommended way to keep your site updated:
1. **Repository Push**: Push this codebase to your target branch in your GitHub account.
2. **Import Project**: Log into [Netlify Console](https://app.netlify.com/), click **Add New Site** > **Import an existing project**.
3. **Configure Build Settings**:
   * **Build Command**: `npm run build`
   * **Publish Directory**: `dist`
4. **Deploy**: Click **Deploy Site**. Netlify will provision an SSL certificate and assign a live URL.

### Method B: Manual Command Line/Drop Deploy
To publish without linking Git repositories:
1. **Compile Output Locally**:
   ```bash
   npm run build
   ```
2. **Upload Folder**: Drag and drop the newly created `/dist` folder onto [Netlify Drop](https://app.netlify.com/drop).

---

## 🛠️ Mandatory Production Configurations

### 1. SPA Routing Redirects (Crucial)
Vite generates a Single Page Application (SPA). To prevent HTTP 404 errors when visitors refresh custom URLs or trigger navigation reloads:
* A `_redirects` file is packaged directly inside the `/public` directory of this codebase. It contains:
  ```text
  /*    /index.html   200
  ```
* This config instructs Netlify's edge servers to route all incoming requests to the client-side router (`index.html`), preventing broken path resolutions.

### 2. High-Performance Bundle Splitting
Since WhatIEarn uses robust utility packages (`xlsx` for statement parsing, and `recharts` for rich visual canvas graphics), code-splitting is pre-configured in `vite.config.ts` under the build configuration. This splits library dependencies into small parallel chunks, reducing initial site loading delays.

### 3. Client-Side Security Assurance
* **No Database Required**: All data extraction, math engines, category mapping, and rendering occur inside the visitor's local browser memory. No external API secrets or `.env` configuration keys are required inside the Netlify Dashboard.
