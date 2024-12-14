import { NextApiRequest, NextApiResponse } from 'next'
import migrationRunner, { RunnerOption } from 'node-pg-migrate'
import { join } from 'node:path'
import { getNewClient } from 'infra/database'

export default async function migrations(request: NextApiRequest, response: NextApiResponse) {
  const dbClient = await getNewClient()

  const options: RunnerOption = {
    dbClient,
    databaseUrl: process.env.DATABASE_URL || '',
    dir: join('infra', 'migrations'),
    direction: 'up',
    verbose: true,
    migrationsTable: 'pgmigrations',
  }

  if (request.method === 'GET') {
    const pedingMigrations = await migrationRunner({ ...options, dryRun: true })
    await dbClient.end()
    return response.status(200).json(pedingMigrations)
  }

  if (request.method === 'POST') {
    const migratedMigrations = await migrationRunner({ ...options, dryRun: false })
    await dbClient.end()

    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations)
    }

    return response.status(200).json(migratedMigrations)
  }

  return response.status(405).end()
}
