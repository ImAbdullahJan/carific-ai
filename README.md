# Carific.ai

AI-powered career development platform. Land your next role with resume editing, interview coaching, and career path planning.

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/ImAbdullahJan/carific-ai?utm_source=oss&utm_medium=github&utm_campaign=ImAbdullahJan%2Fcarific-ai&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Database**: PostgreSQL with [Prisma](https://prisma.io) ORM
- **Authentication**: [Better Auth](https://better-auth.com)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="..."
```

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
app/                  # Next.js App Router
  api/auth/           # Better Auth API routes
components/
  landing/            # Landing page sections
  ui/                 # shadcn/ui components
config/
  landing.ts          # Centralized landing page content
lib/
  auth.ts             # Better Auth configuration
  auth-client.ts      # Auth client for React
  prisma.ts           # Prisma client instance
prisma/
  schema.prisma       # Database schema
```

## License

MIT
