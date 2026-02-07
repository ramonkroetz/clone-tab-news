import { NextApiRequest, NextApiResponse } from 'next'
import { createRouter } from 'next-connect'
import { errorHandlers } from 'infra/controller'
import { listPendingMigrations, runPendingMigrations } from 'models/migrator'

const router = createRouter<NextApiRequest, NextApiResponse>()

router.get(async (request: NextApiRequest, response: NextApiResponse) => {
  const pedingMigrations = await listPendingMigrations()
  return response.status(200).json(pedingMigrations)
})

router.post(async (request: NextApiRequest, response: NextApiResponse) => {
  const migratedMigrations = await runPendingMigrations()

  if (migratedMigrations.length > 0) {
    return response.status(201).json(migratedMigrations)
  }

  return response.status(200).json(migratedMigrations)
})

export default router.handler(errorHandlers)
