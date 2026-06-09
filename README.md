# ReleaseShield AI

ReleaseShield AI is a Next.js application for release safety, code repair, and data quality insights. It helps teams audit pull requests, detect risky code changes, identify leaked secrets, draft manager updates, and profile CSV or Excel files before release or business review.

## Microsoft AI Stack

ReleaseShield AI is Azure-ready application. When credentials are configured, the app uses Azure OpenAI-compatible chat completions from to analyze release evidence and return structured JSON.

If Azure OpenAI is not configured, the app uses a deterministic local analyzer. This makes the project easy to run locally. The local analyzer is rule-based and is intended for demo and resilience; Azure OpenAI provides the richer AI analysis path.

## Team Details

- Team name: ReleaseShield AI
- Team member: Tejaswini Oruganti - Developer
- Repository: https://github.com/Oruganti-Tejaswini/ReleaseShield-AI
- Web App Link: https://releaseshield-ai.vercel.app/


## Project Summary

ReleaseShield AI helps teams answer three practical questions:

- Is this PR safe to deploy?
- Is this code valid or risky?
- Is this dataset trustworthy enough for reporting?

The goal is to reduce release risk and speed up engineering review with a clean, working, Azure-ready experience.
  
## Features

- Audit PR Analysis: Paste a GitHub PR link, PR summary, or changed code to evaluate release readiness.
- GitHub PR Reading: Reads PR title, body, and changed file patches from public GitHub pull requests.
- Fix Coding Issues: Paste or upload code with optional logs/comments and receive validation details plus suggested fixes.
- CSV Crawler & Insights: Upload CSV/XLSX files, detect data quality issues, calculate a data quality score, and explore charts.
- Manager Update Drafts: Generate reviewable email and chat updates based on analysis results.

## Tech Stack and Credits

Open-source libraries and frameworks used:

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Lucide React
- Recharts
- Papa Parse
- XLSX
- ESLint and eslint-config-next

Cloud/API integrations:

- Azure OpenAI-compatible REST API
- GitHub REST API

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Run the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000 
```

## Environment Variables

```env
GITHUB_TOKEN=
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_DEPLOYMENT_NAME=
AZURE_OPENAI_API_VERSION=2024-10-21
````    

## Main Routes

- `/` - Home experience with three product paths
- `/analyze?mode=audit` - Audit PR Analysis
- `/analyze?mode=fix` - Fix Coding Issues
- `/data-detective` - CSV Crawler & Insights

## Build and Production Run

```bash
npm run build
npm run start
```

