# College Results Recovery Portal
production link : https://dbms-project1-one.vercel.app/

A small educational project that demonstrates database recovery techniques (checkpoints, savepoints, log-based recovery, buffer management, and remote backups) using a React + TypeScript front-end and Supabase for backend storage.

This app is intended as a learning/demo tool to show how different recovery strategies behave in practice and to provide interactive examples for students learning DBMS concepts.

## Tech Stack

# Frontend:
- React (with functional components + hooks),
- TypeScript,
- Vite (dev server + build),
-TailwindCSS,
-State management via local component state 

# Backend / Storage:
-Supabase (PostgreSQL + Auth + Storage),
-Supabase JavaScript Client,
-SQL migrations for deterministic schema setup

# Infrastructure:
-Vercel (frontend hosting),
-Supabase cloud backend,
-Environment variables via Vite (VITE_*)

# Development Tools:
-Node.js 18+,
-npm,
-Git + GitHub for version control,
-TypeScript compiler,
-ESLint + Prettier (if configured — keep only if present),

## Contents

- `src/pages/CheckpointPage.tsx` — Checkpoint operations (create checkpoint, simulate crash, recover from checkpoint)
- `src/pages/SavepointPage.tsx` — Savepoint demo within transactions (begin, add marks, set savepoint, simulate error, rollback, commit)
- `src/pages/BufferPage.tsx` — Buffer management demo (fetch from DB/disk vs fetch from memory buffer)
- `src/pages/LogsPage.tsx` — Log-based recovery demo (record updates to logs and replay them to recover)
- `src/pages/BackupPage.tsx` — Remote backup demo (create remote backup, simulate full crash, restore)
- `src/lib/supabaseClient.ts` — Supabase client setup
- `supabase/migrations/` — SQL migrations for schema used by the demos


## Quick start (development)

Requirements:

- Node.js 18+ (or as required by your environment)
- A Supabase project (for demo data).

1. Install dependencies

```powershell
npm install
```

2. Create a `.env` file (or set environment variables) with your Supabase values. Example `.env` entries used by Vite:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key
```

3. Run the dev server

```powershell
npm run dev
```

4. Open http://localhost:5173 (or the port Vite shows)

## Database schema

The `supabase/migrations` folder contains SQL to create the demo schema. It includes tables:

- `student_results` — main student results table
- `checkpoint_table` — checkpoint copies
- `logs` — transaction logs
- `remote_backup` — remote backup storage

Run the SQL in your Supabase SQL editor or via supabase CLI to prepare the demo data.

## Pages & Usage (practical examples)

Each page includes a short theory section, interactive controls, and a real-world example to make the concept clearer.

- Checkpoints (CheckpointPage)
	- What it demonstrates: Taking a snapshot of current database state so recovery can restore to that snapshot.
	- Example: Like a game's auto-save — you restore to the last checkpoint instead of losing everything.
	- Buttons: Create Checkpoint, Simulate Crash, Recover From Checkpoint.

- Savepoints (SavepointPage)
	- What it demonstrates: Creating markers inside a transaction to roll back part of the work without aborting the entire transaction.
	- Example: Filling a long online form (save progress each section). If you make a mistake in one section you revert to last saved section rather than starting over.
	- Buttons: Begin Transaction, Add Subject Marks, Set Savepoint, Simulate Error, Rollback to Savepoint, Commit.

- Buffer Management (BufferPage)
	- What it demonstrates: Cached memory buffer vs disk/database access and the performance tradeoffs.
	- Example: A mall kiosk keeping frequently-requested store info in memory so answers are instant.
	- Buttons: Fetch From Database (slow), Fetch From Buffer (fast), Clear Buffer.

- Log-Based Recovery (LogsPage)
	- What it demonstrates: Storing a transaction log for redo/undo; replaying logs to recover committed updates.
	- Example: A bank's transaction ledger — if an ATM fails, the bank can replay logs to reconcile accounts.
	- Buttons: View Logs, Simulate Crash, Recover From Logs, Update Marks (adds log entries)

- Remote Backup (BackupPage)
	- What it demonstrates: Keeping a geographically separate backup to recover from catastrophic failure.
	- Example: Google Photos backing up your phone's pictures so you can restore them if the phone is lost.
	- Buttons: Create Remote Backup, Simulate Full Crash, Restore From Backup

## Notes on safety

- This project purposely uses destructive demo operations (e.g., deleting records to simulate crashes). Use a throwaway/test Supabase project — do not run these actions against production data.

## Contributing

Feel free to open issues or PRs. Suggested small improvements:

- Add tests for page behavior
- Improve UX and accessibility
- Add more explanatory diagrams or short screencasts

