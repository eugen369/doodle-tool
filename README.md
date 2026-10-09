# 📅 Doodle Tool

A simple scheduling poll tool to find the best time for your next meeting. Built with **Angular 18 + NestJS + SQLite**.

## Features

- ✅ Create polls with multiple time slots
- ✅ Vote anonymously (✓ yes, ~ maybe, ✗ no)
- ✅ Real-time vote aggregation
- ✅ Timezone support (auto-detected)
- ✅ Export polls to PDF
- ✅ Share via link (no login required)

## Project Structure

```
doodle-tool/
├── backend/          # NestJS API
├── frontend/         # Angular UI
└── README.md
```

## Local Development

### Prerequisites

- Node.js 22+
- npm or pnpm

### Setup

```bash
# Install dependencies (monorepo)
npm install

# Set up backend environment
cp backend/.env.example backend/.env

# Create database and run migrations
cd backend
npx prisma migrate dev
cd ..

# Set up frontend environment
cp frontend/.env.example frontend/.env
```

### Run

```bash
# Start both backend and frontend in parallel
npm run dev

# Or start individually:
npm run start --workspace=backend    # http://localhost:3000
npm run start --workspace=frontend   # http://localhost:4200
```

### Build

```bash
npm run build
```

## API Endpoints

### Polls

- `POST /api/polls` - Create a new poll
- `GET /api/polls/:id` - Get poll with vote results
- `POST /api/polls/:id/sessions` - Create anonymous user session
- `GET /api/polls/:id/export/pdf` - Export poll as PDF

### Votes

- `POST /api/votes?pollId=X&sessionId=Y` - Cast/update a vote
- `GET /api/votes/user/:sessionId` - Get user's votes
- `GET /api/votes/slot/:slotId` - Get votes for a slot

## Database

SQLite file-based database. Managed with Prisma.

```bash
cd backend

# View/edit schema
npx prisma studio

# Create new migration after schema changes
npx prisma migrate dev --name "your_change_name"
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Angular 18, Bootstrap 5, ng-bootstrap |
| Backend | NestJS, Express |
| Database | SQLite + Prisma ORM |
| Timezone | date-fns-tz |
| PDF | pdfkit |

## License

MIT
