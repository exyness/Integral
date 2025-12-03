<div align="center">

# Integral

<img src="public/showcase/banner.gif" alt="Integral Banner" width="100%" />

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19.2" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

<p align="center">
  Built with React, TypeScript, Supabase, and Google Gemini AI
</p>

<p align="center">
  <strong>The AI-Powered Productivity Platform for Modern Professionals</strong>
</p>
</div>

---

## Overview

**Integral** is a cutting-edge, AI-powered productivity suite that unifies task management, note-taking, time tracking, journaling, and budgeting into one intelligent platform. Featuring a stunning **Liquid Ether** WebGL interface and powered by **RAG (Retrieval-Augmented Generation)** technology, Integral helps you organize your life with the power of AI.

## Live Demo

Check out the live application:

<a href="https://integral-productivity.vercel.app/"><img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel Demo" /></a>

- **Vercel:** https://integral-productivity.vercel.app/

## Demo Account

Use these credentials to explore the platform:

- **Username:** `demo@integral.com`
- **Password:** `integral`

## Key Features

| Module            | AI-Powered Capabilities                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------- |
| **Dashboard**     | Unified hub with **Liquid Ether** visual effects and AI-driven insights                   |
| **Tasks**         | **Smart Prioritization** and **Zombie Task Resurrection** to manage your workflow         |
| **Notes**         | **AI Semantic Search** to chat with your second brain and find connections instantly      |
| **Time Tracking** | **AI Focus Insights** and smart timers that adapt to your deep work patterns              |
| **Pomodoro**      | **Smart Pomodoro** sessions with flow state analytics and productivity tracking           |
| **Journal**       | **RAG Vector Search** to connect daily reflections with past entries and insights         |
| **Budget**        | **Smart Budget Management** with visual icons, category tracking, recurring transactions, and RAG-powered expense insights |
| **Accounts**      | **Secure AI Vault** with intelligent activity monitoring and usage analytics              |

**Built on Modern Tech** - React 19, TypeScript, Supabase, Google Gemini AI, and WebGL.

**Seamless Experience** - Glass morphism UI, vibrant Dark Mode, Halloween themes, and real-time sync.

**Secure & Private** - Row-level security, encrypted data, and privacy-first architecture.

## Technology Stack

| Category               | Technologies                         | Features                                                    |
| ---------------------- | ------------------------------------ | ----------------------------------------------------------- |
| **Frontend**           | React 19.2, TypeScript 5.9, Vite 7.2 | Latest React features, strict typing, lightning-fast builds |
| **AI & ML**            | Google Gemini Flash & Embedding 001  | RAG, Vector Search, Semantic Analysis, Content Generation   |
| **Visuals**            | Three.js, WebGL, Framer Motion       | **Liquid Ether** fluid simulations, smooth animations       |
| **Styling**            | Tailwind CSS 4.1, Glass Morphism     | Modern utility-first CSS, premium visual aesthetics         |
| **Backend**            | Supabase (Auth, DB, Vector Store)    | Real-time sync, pgvector for embeddings, RLS security       |
| **Rich Text**          | Lexical Editor 0.38                  | Advanced text editing, extensible plugins                   |
| **State Management**   | TanStack Query v5, React Context     | Server state sync, optimistic updates                       |

## Quick Start

### Prerequisites

- Node.js v18+ or Bun (recommended)
- Supabase account and project
- Google Gemini API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/exyness/Integral.git
cd Integral

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Configure Supabase and Gemini credentials in .env

# Start development server
bun dev
```

### Supabase Setup

```bash
# Push database migrations (includes pgvector setup)
bunx supabase db push

# Generate TypeScript types
bunx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

**Application will be available at:** `http://localhost:8080`

## Themed Modes

Integral supports multiple visual themes to personalize your experience:

- **Light Mode** - Clean, bright interface for daytime productivity
- **Dark Mode** - Vibrant **Neon Purple/Fuchsia** theme for low-light environments
- **Halloween Mode** - Spooky seasonal theme with **Liquid Ether** effects and custom animations

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by exyness for productivity enthusiasts**

_Organize Your Life with AI - Experience the Future of Productivity_

<p>
  <a href="#overview">Overview</a> •
  <a href="#key-features">Features</a> •
  <a href="#technology-stack">Tech Stack</a> •
  <a href="#quick-start">Quick Start</a>
</p>

</div>
