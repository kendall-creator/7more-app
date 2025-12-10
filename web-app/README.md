# 7more Web App

A web version of the 7more mobile app built with Vite + React + Tailwind CSS.

## Features

- **Login**: Same credentials as the mobile app
- **Dashboard**: Mirrors the mobile HomepageScreen with:
  - Welcome message with user name
  - Quick actions (for mentorship leaders and bridge team)
  - Action required alerts (mentees needing assignment)
  - Recently assigned mentees
  - Mentees needing follow-up
  - Tasks assigned to you
  - Your upcoming schedule
  - Pam Lychner schedule (for bridge team)

## Tech Stack

- **Vite** - Build tool
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Firebase** - Backend (same database as mobile app)
- **React Router** - Routing
- **Lucide React** - Icons

## Local Development

```bash
cd web-app
bun install
bun run dev
```

The app will be available at http://localhost:3000

## Build for Production

```bash
bun run build
```

Output will be in the `dist/` folder.

## Deploy to Vercel

1. Push the web-app folder to your GitHub repository
2. Connect the repository to Vercel
3. Set the root directory to `web-app`
4. Deploy!

## Project Structure

```
web-app/
├── src/
│   ├── config/
│   │   └── firebase.ts      # Firebase configuration
│   ├── store/
│   │   ├── authStore.ts     # Authentication state
│   │   └── dataStore.ts     # Participants, tasks, shifts
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   ├── pages/
│   │   ├── LoginPage.tsx    # Login screen
│   │   └── MainDashboard.tsx # Main dashboard (mirrors mobile)
│   ├── App.tsx              # Root component with routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── vite.config.ts
```

## Routes

- `/` - Redirects to `/dashboard` (or `/login` if not authenticated)
- `/login` - Login page
- `/dashboard` - Main dashboard

## Future Pages to Add

- `/participants` - Participants list
- `/my-mentees` - My mentees (for mentors)
- `/scheduler` - Shift scheduler
- `/tasks` - Task management
- `/resources` - Resources
