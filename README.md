# 🚀 Memestack - Memecoin Launchpad on Stacks

A modern, full-featured memecoin launchpad built on the Stacks blockchain. Create fair token launches, participate in launches, and claim tokens or refunds.

## ✨ Features

- **🎯 Fair Token Launches**: Create transparent token launches with configurable parameters
- **💰 Buy Tokens**: Participate in active launches with STX
- **🎁 Claim & Refund**: Automatic token distribution or refunds based on launch success
- **📊 Real-time Dashboard**: Track your launches and investments
- **🔐 Wallet Integration**: Seamless Stacks wallet connection with Hiro Wallet support
- **🎨 Beautiful UI**: Modern design with shadcn/ui and Tailwind CSS
- **🌓 Dark Mode**: Full dark mode support
- **📱 Responsive**: Works perfectly on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, React 19
- **UI Library**: shadcn/ui, Tailwind CSS, Framer Motion
- **Blockchain**: Stacks.js, Clarity Smart Contracts
- **State Management**: Zustand with persist middleware
- **Forms**: react-hook-form + Zod validation

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Project Structure

```
memestack/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Landing page
│   ├── launches/            # Browse & launch details
│   ├── create/page.tsx      # Create launch wizard
│   ├── dashboard/page.tsx   # User dashboard
│   └── profile/page.tsx     # Profile & settings
├── components/
│   ├── layout/              # Global components
│   ├── wallet/              # Wallet components
│   ├── launch/              # Launch-specific components
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── stacks/              # Blockchain integration
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript types
│   └── utils/               # Utility functions
└── store/
    └── app-store.ts         # Zustand global state
```

## 🎮 Usage

### For Creators
1. Connect wallet and navigate to "Create"
2. Fill out the 3-step wizard (Token Info → Parameters → Review)
3. Track your launch on the Dashboard
4. Finalize when the launch ends

### For Investors
1. Browse launches and filter by status
2. Buy tokens during active launches
3. Monitor investments on Dashboard
4. Claim tokens or request refunds

## 🔐 Smart Contract

Contract: `ST30VGN68PSGVWGNMD0HH2WQMM5T486EK3WBNTHCY.memecoin-launchpad` (Testnet)

## 🚀 Deployment

```bash
npm run build
npm start
```

For Vercel: Push to GitHub, import project, add environment variables, deploy.

## 📄 License

MIT License

---

Built with ❤️ on Stacks
