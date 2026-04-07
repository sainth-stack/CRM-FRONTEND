# AI-PRIORI | Command & Control Portal (Frontend)

<div align="center">
  <h3>DATA • INTELLIGENCE • AUTONOMY</h3>
</div>

## Overview

The AI-PRIORI Frontend establishes a secure, high-fidelity navigational perimeter for initiating, managing, and tracking automated outbound intelligence operations. Built with React and Vite, the platform provides distinct operational sectors based on role (Super Admin, Admin, and User) with complete architectural isolation and zero-latency performance.

## Core Features

- **Role-Based Access Control (RBAC):** Autonomous session routing for Sovereign Control (Super Admin), Admin Decks, and Standard Operators.
- **Mission-Critical Branding:** Universal, responsive UI/UX tailored with high-visibility aesthetic identifiers conforming to AI-PRIORI's operational identity.
- **Seamless Authentication Perimeter:** JWT-based identity resolution, OTP validation routes, and secure password recovery flows.
- **Campaign Management Hub:** Integrated interfaces for defining target parameters, launching multi-agent email workflows, and reviewing outreach logistics.

## Tech Stack

- **Framework:** [React 18](https://react.dev/) + [Vite JS](https://vitejs.dev/)
- **Styling UI:** [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management/Routing:** `react-router-dom`, React Context API
- **Icons & Animation:** `lucide-react`, `framer-motion`

---

## 🚀 Quick Setup & Installation

Follow these instructions to initialize your local development environment.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18.0 or higher recommended)
- `npm` or `yarn` (comes bundled with Node.js)

### 1. Initialize Space
Clone the active repository and navigate into the mission directory:
```bash
git clone https://github.com/sainth-stack/CRM-FRONTEND.git
cd CRM-FRONTEND
```

### 2. Configure Local Environment
Create a `.env` file in the root directory by duplicating the existing setup configurations if necessary. Minimum required configuration to bind the UI to the intelligence backend:
```env
VITE_API_URL=http://localhost:8000
```

### 3. Resolve Dependencies
Execute package resolution to install the required mission dependencies:
```bash
npm install
```

### 4. Ignite the Development Server
Spin up the local portal interface on Vite's optimized dev machinery:
```bash
npm run dev
```

The portal should now be active. Open your browser and navigate to `http://localhost:5173`.

---

## Production Deployment

When operations are ready to scale to production, compile the optimized static payload:
```bash
npm run build
```
The optimized payload will be generated in the `/dist` directory, ready to serve over Nginx, Vercel, Netlify, or any static hosting infrastructure.

---

<div align="center">
  <p><i>Precision Sector Intelligence | Protected Asset</i></p>
</div>
