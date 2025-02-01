import { NextApiRequest, NextApiResponse } from 'next'
import migrationRunner, { RunnerOption } from 'node-pg-migrate'
import { resolve } from 'node:path'
import { getNewClient } from 'infra/database'
import { createRouter } from 'next-connect'
import { errorHandlers } from 'infra/controller'

const router = createRouter<NextApiRequest, NextApiResponse>()

const options: RunnerOption = {
  databaseUrl: process.env.DATABASE_URL || '',
  dir: resolve('infra', 'migrations'),
  direction: 'up',
  verbose: true,
  migrationsTable: 'pgmigrations',
}

router.get(async (request: NextApiRequest, response: NextApiResponse) => {
  let dbClient

  try {
    dbClient = await getNewClient()

    const pedingMigrations = await migrationRunner({ ...options, dryRun: true, dbClient })

    return response.status(200).json(pedingMigrations)
  } finally {
    dbClient?.end()
  }
})

router.post(async (request: NextApiRequest, response: NextApiResponse) => {
  let dbClient

  try {
    dbClient = await getNewClient()

    const migratedMigrations = await migrationRunner({ ...options, dryRun: false, dbClient })

    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations)
    }

    return response.status(200).json(migratedMigrations)
  } finally {
    dbClient?.end()
  }
})

export default router.handler(errorHandlers)
