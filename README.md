# Trego

Many students and recreational players want to stay active through sports but struggle to find reliable teammates, learn about team tryouts, or connect with coaches. Current solutions—such as Instagram posts or group chats are fragmented and unreliable. This leads to empty courts, missed tryout opportunities, and difficulty in maintaining consistent team rosters.

Our solution is Trego, a web-based platform designed to connect players, teams, clubs, and coaches in one place. Players can create profiles showcasing their sports, skill levels, and availability, while clubs and teams can post openings, schedule tryouts, and manage substitutions. Coaches can advertise lessons and allow players to book sessions directly. A reliability and reputation system ensures accountability, while matchmaking algorithms help users find compatible teammates or teams. By focusing on intent and trust (not generic social feeds) Trego provides a dedicated hub for building lasting sports connections.

**Target Users:** university students, recreational players, sports clubs, and coaches seeking to grow their networks or find new opportunities to play.

---

## Prerequisites

Before setting up Trego locally, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **Bun** (recommended for faster package management)
- **Docker & Docker Compose** (for local database)
- **Homebrew** (macOS only, for installing Bun)

### Installing Bun (macOS)

```bash
brew install oven-sh/bun/bun
```

For other operating systems, visit [bun.sh](https://bun.sh) for installation instructions.

---

## Getting Started

Follow these steps to set up Trego on your local machine:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd trego-2
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Set Up Local Database

Start a PostgreSQL database using Docker Compose:

```bash
docker compose up -d
```

This will start a PostgreSQL instance running on `localhost:5434`.

### 4. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE=postgresql://postgres:postgres@localhost:5434/postgres

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

SESSION_SECRET=any-random-string
```

### 5. Run Database Migrations

```bash
bunx drizzle-kit migrate
```

### 6. (Optional) Seed the Database

If you want to populate the database with sample data:

```bash
bun run seed
```

### 7. Start the Development Server

```bash
bun run dev
```

The application should now be running at `http://localhost:5173` (or the port specified in your console).

---

## Additional Commands

### Database Management

**Open Drizzle Studio** (visual database browser):

```bash
bunx drizzle-kit studio
```

This will open a web interface to browse and manage your local database.
