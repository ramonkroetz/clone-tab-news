import { resolve } from 'node:path'

import { getNewClient } from 'infra/database'
import { type RunnerOption, runner } from 'node-pg-migrate'
import { Client } from 'pg'

const options: RunnerOption = {
  databaseUrl: process.env.DATABASE_URL || '',
  dir: resolve('infra', 'migrations'),
  direction: 'up',
  verbose: true,
  migrationsTable: 'pgmigrations',
}

export async function listPendingMigrations() {
  let dbClient: Client | null = null

  try {
    dbClient = await getNewClient()

    const pedingMigrations = await runner({ ...options, dryRun: true, dbClient })

    return pedingMigrations
  } finally {
    await dbClient?.end()
  }
}

export async function runPendingMigrations() {
  let dbClient: Client | null = null

  try {
    dbClient = await getNewClient()

    const migratedMigrations = await runner({ ...options, dryRun: false, dbClient })

    return migratedMigrations
  } finally {
    await dbClient?.end()
  }
}
