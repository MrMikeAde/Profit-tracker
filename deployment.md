# Netlify Deployment Guide for Profit Tracker

This documentation details the steps, configurations, and considerations necessary to deploy the custom Chase Bank inspired Profit Tracker application seamlessly on Netlify.

## 🚀 Easy Deployment Steps

### Method 1: Continuous Integration via GitHub (Recommended)
1. **Push to GitHub**: Push this repository to your GitHub account.
2. **Log into Netlify**: Go to [Netlify](https://www.netlify.com/) and click **Add new site** > **Import an existing project**.
3. **Connect Git Provider**: Select GitHub and authorize Netlify to access your repository.
4. **Configure Build Settings**:
   * **Build Command**: `npm run build`
   * **Publish Directory**: `dist`
5. **Click Deploy**: Netlify will trigger the build immediately and provide a live URL (e.g. `your-site.netlify.app`).

### Method 2: Manual Drag-and-Drop Deploy
1. **Build Locally**: Run the compilation command in your local workspace:
   ```bash
   npm run build
   ```
2. **Publish Directory**: This compiles your single-page app and puts all production files in the `/dist` directory.
3. **Upload to Netlify**: Go to [Netlify Drop](https://app.netlify.com/drop) and drag the compiled `/dist` folder onto the web screen. It will go live instantly.

---

## 🔒 Crucial Security & Privacy Assurances
* **Zero Backend Database Required**: Unlike other applications, this Profit Tracker does all CSV/Excel statement file parsing, math calculations, and visual charts directly in the visitor's browser thread using local memory.
* **100% Secure**: Since no statement data is sent to a server, this app is completely private. This is an incredible selling point for your users compared to standard SaaS tools.
* **No APIs / Env Variables Needed**: Since everything runs client-side and is self-contained with preset demo data, there are no confidential API keys or `.env` configuration keys to set up in the Netlify dashboard.

---

## 🛠️ Optimizations & Troubleshooting

### SPA Routing Fallback
Vite compiles the app into a Single Page Application (SPA). To prevent potential 404 errors if users manually reload nested URLs, create a `_redirects` file in the public folder before building, or configure it on Netlify with this redirect rule:
```text
/*    /index.html   200
```
*(Note: We have packaged all components as a clean, single-page client state controller, so standard routing errors are completely mitigated by default).*

### Large Bundles Tip
The visual chart module (`recharts`) and Excel file extractor (`xlsx`) are powerful third-party dependencies. If you wish to speed up the initial load time, you can split chunk files in your `vite.config.ts` like so:
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', 'recharts', 'xlsx']
      }
    }
  }
}
```
