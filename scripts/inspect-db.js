// One-off, READ-ONLY production schema inspection.
// Runs two SELECT queries against POSTGRES_DATABASE_URL_UNPOOLED and prints them.
// No writes, no migrations, no schema changes. Safe to run against production.
//
// Usage: see the notes at the bottom of this file / the chat instructions.

import pg from 'pg'

const connectionString =
  process.env.POSTGRES_DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URL_UNPOOLED ||
  ''

if (!connectionString) {
  console.error(
    'ERROR: POSTGRES_DATABASE_URL_UNPOOLED is not set (or is empty) in this environment.\n' +
      'This script must run where the real production value is available - not via a masked `vercel env pull`.',
  )
  process.exit(1)
}

// Mask everything but the host so we can confirm WHICH database we are inspecting
// without leaking credentials into logs.
try {
  const u = new URL(connectionString)
  console.log(`Connecting to host: ${u.host}${u.pathname}`)
} catch {
  console.log('Connecting (could not parse connection string for host display).')
}

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Neon requires SSL
})

async function main() {
  // Query 1: mollie columns on the users table
  const q1 = await pool.query(
    `SELECT column_name
       FROM information_schema.columns
      WHERE table_name = 'users'
        AND column_name LIKE '%mollie%'
      ORDER BY column_name;`,
  )
  console.log('\n=== users columns matching "mollie" ===')
  if (q1.rows.length === 0) {
    console.log('(none found)')
  } else {
    q1.rows.forEach((r) => console.log(`  - ${r.column_name}`))
  }

  // Query 2: migration history
  const q2 = await pool.query(
    `SELECT id, name, batch
       FROM payload_migrations
      ORDER BY batch;`,
  )
  console.log('\n=== payload_migrations (ordered by batch) ===')
  if (q2.rows.length === 0) {
    console.log('(table empty)')
  } else {
    console.table(q2.rows)
  }
}

main()
  .then(() => pool.end())
  .catch((err) => {
    console.error('\nQuery failed:', err.message)
    return pool.end().finally(() => process.exit(1))
  })
