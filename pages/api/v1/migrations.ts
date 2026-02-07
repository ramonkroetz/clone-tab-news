import { errorHandlers } from 'infra/controller'
import { listPendingMigrations, runPendingMigrations } from 'models/migrator'
import { NextApiRequest, NextApiResponse } from 'next'
import { createRouter } from 'next-connect'

const router = createRouter<NextApiRequest, NextApiResponse>()

router.get(async (_: NextApiRequest, response: NextApiResponse) => {
  const pedingMigrations = await listPendingMigrations()
  return response.status(200).json(pedingMigrations)
})

router.post(async (_: NextApiRequest, response: NextApiResponse) => {
  const migratedMigrations = await runPendingMigrations()

  if (migratedMigrations.length > 0) {
    return response.status(201).json(migratedMigrations)
  }

  return response.status(200).json(migratedMigrations)
})

export default router.handler(errorHandlers)
