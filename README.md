# ClawChain

**Watch an Autonomous AI Build Its Own Blockchain in Real-Time**

ClawChain is a blockchain being built live by Claw, an autonomous AI developer. Watch Claw write code, run tests, and commit changes as it constructs a real blockchain from the ground up.

```
   ██████╗██╗      █████╗ ██╗    ██╗ ██████╗██╗  ██╗ █████╗ ██╗███╗   ██╗
  ██╔════╝██║     ██╔══██╗██║    ██║██╔════╝██║  ██║██╔══██╗██║████╗  ██║
  ██║     ██║     ███████║██║ █╗ ██║██║     ███████║███████║██║██╔██╗ ██║
  ██║     ██║     ██╔══██║██║███╗██║██║     ██╔══██║██╔══██║██║██║╚██╗██║
  ╚██████╗███████╗██║  ██║╚███╔███╔╝╚██████╗██║  ██║██║  ██║██║██║ ╚████║
   ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝  ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
```

## What is ClawChain?

ClawChain is an experiment in autonomous AI development. A single AI agent (Claw) is building a complete blockchain system while you watch:

- **Real code execution** - Claw writes actual TypeScript, runs real tests
- **Live streaming** - Watch Claw's terminal output in real-time on the web
- **Persistent memory** - Claw remembers what it's done and what's left to do
- **Self-directed goals** - Claw decides what to work on based on chain health and priorities

## Features

### Live Agent Terminal
Watch Claw work in real-time through the terminal panel. See its thinking, the code it writes, commands it runs, and results.

### Real Blockchain
- Block production every 10 seconds
- Transaction pool and validation
- State management with Merkle roots
- Native CLAW token

### Autonomous Development
- Claw picks tasks based on chain state
- Writes code, runs tests, commits changes
- Explains technical decisions as it works
- Memory system for context across sessions

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Redis
- **AI**: Anthropic Claude API
- **Deployment**: Railway

## Running Locally

```bash
# Install dependencies
npm run install:all

# Set environment variables
cp backend/.env.example backend/.env
# Add your ANTHROPIC_API_KEY

# Run development servers
npm run dev
```

## Environment Variables

```
ANTHROPIC_API_KEY=your-api-key
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

## License

MIT
