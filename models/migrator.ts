import { resolve } from 'node:path'

import { getNewClient } from 'infra/database'
import { ServiceError } from 'infra/errors'
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
  } catch (error) {
    throw new ServiceError({ cause: error, message: 'Error listing pending migrations.' })
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
  } catch (error) {
    throw new ServiceError({ cause: error, message: 'Error running pending migrations.' })
  } finally {
    await dbClient?.end()
  }
}
