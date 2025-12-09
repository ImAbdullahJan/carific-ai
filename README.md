# Carific.ai

AI-powered career development platform. Land your next role with resume editing, interview coaching, and career path planning.

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/ImAbdullahJan/carific-ai?utm_source=oss&utm_medium=github&utm_campaign=ImAbdullahJan%2Fcarific-ai&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

## Tech Stack

| Category            | Technology                                                            | Version |
| ------------------- | --------------------------------------------------------------------- | ------- |
| **Framework**       | [Next.js](https://nextjs.org) (App Router)                            | 16      |
| **Runtime**         | [React](https://react.dev)                                            | 19      |
| **Database**        | PostgreSQL with [Prisma](https://prisma.io) ORM                       | 7       |
| **Authentication**  | [Better Auth](https://better-auth.com)                                | 1.4     |
| **Forms**           | [TanStack Form](https://tanstack.com/form)                            | 1.27    |
| **AI**              | [Vercel AI SDK](https://sdk.vercel.ai)                                | 5       |
| **Email Templates** | [React Email](https://react.email)                                    | 5       |
| **Email Delivery**  | [Resend](https://resend.com)                                          | 6.5     |
| **Validation**      | [Zod](https://zod.dev)                                                | 4       |
| **UI Components**   | [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://radix-ui.com) | -       |
| **Styling**         | [Tailwind CSS](https://tailwindcss.com)                               | 4       |
| **Language**        | TypeScript                                                            | 5       |

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

RESEND_API_KEY="..."
EMAIL_FROM="..."

AI_GATEWAY_API_KEY="..."
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
