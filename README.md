# Integral

<div align="center">
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
  <strong>Integral is an integral part of your Life</strong>
</p>
</div>

---

## Overview

**Integral** is a cutting-edge, AI-powered productivity suite that unifies task management, note-taking, time tracking, journaling, and budgeting into one intelligent platform. Powered by **RAG (Retrieval-Augmented Generation)** technology and featuring an intelligent **AI Assistant**, Integral helps you organize your life with natural language commands and smart contextual insights.

## Live Demo

Check out the live application:

<a href="https://integral-beta.scntix.com/"><img src="https://img.shields.io/badge/Live_Demo-integral--beta.scntix.com-8E75B2?style=for-the-badge&logo=https://raw.githubusercontent.com/exyness/Integral/f5812272034464c600153a7fd9ac41f1fe06ae64/public/logo.svg&logoColor=white" alt="Live Demo" /></a>

- **Website:** https://integral-beta.scntix.com/

## Demo Account

Use these credentials to explore the platform:

- **Username:** `demo@integral.com`
- **Password:** `integral`

## Themed Modes

Integral supports multiple visual themes to personalize your experience:

- **Light Mode** - Clean, bright interface for daytime productivity
- **Dark Mode** - Vibrant **Neon Purple/Fuchsia** theme for low-light environments
- **Halloween Mode** - Spooky seasonal theme with custom animations

## Key Features

### Integral AI Assistant

Your global command center for managing your entire digital life with natural language and smart mentions.

- **Universal Control**: Create tasks, notes, journals, and transactions without leaving your current view.
- **Smart Mentions**: Instantly route your commands to the right module:
  - `@task` - Create tasks and reminders
  - `@note` - Capture quick ideas
  - `@journal` - Log daily reflections
  - `@transaction` - Record expenses
  - `@budget` - Set spending limits
  - `@category` - Organize finances
  - `@goal` - Track savings goals
  - `@liability` - Manage debts
  - `@transfer` - Move funds between accounts
  - `@finance` - Manage financial accounts
  - `@recurring` - Set up subscriptions
  - `@account` - Secure credentials
- **Context Awareness**: The assistant understands where you are and suggests relevant actions.
- **Natural Language**: Just say "Remind me to buy milk tomorrow" or "Spent $50 on groceries" and let AI handle the rest.

### Dashboard

Central hub with unified overview of all your productivity metrics. See task completion rates, time tracking summaries, recent notes, journal entries, and budget snapshots in one place with visual analytics and quick actions.

### Tasks

Project-based task management with Kanban boards, priorities, due dates, and custom tags. Organize work by projects, visualize workflow with drag-and-drop boards, track completion trends, and view detailed analytics. **RAG-powered search** automatically indexes all tasks, letting you find relevant work using natural language queries. Calendar integration shows deadlines at a glance.

### Notes

Rich text editor powered by Lexical with markdown support, code blocks, tables, and lists. Organize notes into folders, pin important ones, mark favorites, and use instant search. **AI Semantic Search with RAG** lets you chat with your notes—ask questions in natural language and discover connections across your entire knowledge base using vector embeddings.

### Time Tracking

Activity logging with start/stop timers for different tasks. Track time spent on activities, add session notes, and review comprehensive history with visual breakdowns. Persistent floating timer widget stays visible across all pages without interrupting your flow.

### Pomodoro

Customizable focus timer with work/break intervals. Set custom durations for focus sessions and breaks, track completed sessions, add notes about what you accomplished, and view your focus history. Helps maintain concentration and prevent burnout.

### Journal

Daily reflection with calendar navigation and project tagging. Write entries, tag them with projects or activities, and browse past reflections using the calendar view. **RAG Vector Search** lets you query your journal history with natural language—ask "when did I last feel this way?" or "what helped me overcome similar challenges?" and get relevant entries using semantic similarity.

### Finance Management

Multi-currency financial tracking with visual category icons. Track income and expenses, set budgets for categories, manage recurring transactions, and monitor assets & liabilities. View spending trends with interactive charts, track net worth, and analyze financial health across multiple accounts. **RAG-powered insights** automatically index all transactions, goals, and liabilities—ask questions like "how much did I spend on dining last month?" in natural language.

### Accounts

Secure credential vault for passwords and sensitive information. Store account details with encryption, organize into folders, track usage history, and monitor when credentials were last accessed. Usage analytics show access patterns and help maintain security hygiene.

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
