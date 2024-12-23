import { NextApiRequest, NextApiResponse } from 'next'
import migrationRunner, { RunnerOption } from 'node-pg-migrate'
import { resolve } from 'node:path'
import { getNewClient } from 'infra/database'

export default async function migrations(request: NextApiRequest, response: NextApiResponse) {
  const allowedMethods = ['GET', 'POST']

  if (!allowedMethods.includes(request.method || '')) {
    return response.status(405).json({
      error: `Method ${request.method} not allowed`,
    })
  }

  let dbClient

  try {
    dbClient = await getNewClient()

    const options: RunnerOption = {
      dbClient,
      databaseUrl: process.env.DATABASE_URL || '',
      dir: resolve('infra', 'migrations'),
      direction: 'up',
      verbose: true,
      migrationsTable: 'pgmigrations',
    }

    if (request.method === 'GET') {
      const pedingMigrations = await migrationRunner({ ...options, dryRun: true })
      return response.status(200).json(pedingMigrations)
    }

    if (request.method === 'POST') {
      const migratedMigrations = await migrationRunner({ ...options, dryRun: false })

      if (migratedMigrations.length > 0) {
        return response.status(201).json(migratedMigrations)
      }

      return response.status(200).json(migratedMigrations)
    }
  } catch (error) {
    console.error(error)
    throw error
  } finally {
    dbClient?.end()
  }
}
