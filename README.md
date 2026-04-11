# Project Zero — Event landing (P0 Third Edition)

Standalone Vite + React + TypeScript + Tailwind CSS v4 site for the hackathon landing page and registration form. Visual language matches the main `FRONTEND` app (Shuriken font, glass panels, Hunter × Hacker palette).

## Setup

```bash
cd event-site
npm install
npm run dev
```

Open the URL shown in the terminal (default `http://localhost:5173` if free).

## Environment

Copy `.env.example` to `.env` and set:

- `VITE_ELEC_CLUB_URL` — link for “ELEC Club / previous editions” buttons (defaults to a Facebook placeholder if unset).

## Assets

- `public/Logo.svg` — P0 mark  
- `public/PROJECTxZERO.png` — Project Zero wordmark  
- `src/assets/fonts/The-Last-Shuriken.otf` — display font (copied from main frontend)

## Routes

- `/` — Landing (event story, CTAs)  
- `/register` — Registration form (submit currently logs to console; connect your API in `RegisterPage.tsx`)

## Build

```bash
npm run build
npm run preview
```
