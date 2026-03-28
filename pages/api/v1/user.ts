import { errorHandlers } from 'infra/controller'
import type { NextApiRequest, NextApiResponse } from 'next'
import { createRouter } from 'next-connect'

const router = createRouter<NextApiRequest, NextApiResponse>()

router.get(async (_: NextApiRequest, response: NextApiResponse) => {
  response.status(200).json({ name: 'John Doe' })
})

export default router.handler(errorHandlers)
