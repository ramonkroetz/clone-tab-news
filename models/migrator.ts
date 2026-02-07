import { resolve } from 'node:path'
import migrationRunner, { RunnerOption } from 'node-pg-migrate'
import { getNewClient } from 'infra/database'

const options: RunnerOption = {
  databaseUrl: process.env.DATABASE_URL || '',
  dir: resolve('infra', 'migrations'),
  direction: 'up',
  verbose: true,
  migrationsTable: 'pgmigrations',
}

export async function listPendingMigrations() {
  let dbClient
  
  try {
    dbClient = await getNewClient()

    const pedingMigrations = await migrationRunner({ ...options, dryRun: true, dbClient })

    return pedingMigrations
  } finally {
    await dbClient?.end()
  }
}

export async function runPendingMigrations() {
  let dbClient
  
  try {
    dbClient = await getNewClient()

    const migratedMigrations = await migrationRunner({ ...options, dryRun: false, dbClient })

    return migratedMigrations
  } finally {
    await dbClient?.end()
  }
}