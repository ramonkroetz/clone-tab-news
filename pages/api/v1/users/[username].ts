import { errorHandlers } from 'infra/controller'
import { findOneByUsername } from 'models/user'
import { NextApiRequest, NextApiResponse } from 'next'
import { createRouter } from 'next-connect'

const router = createRouter<NextApiRequest, NextApiResponse>()

router.get(async (request: NextApiRequest, response: NextApiResponse) => {
  const username = request.query.username
  const normalizedUsername = Array.isArray(username) ? username[0] : username
  const userFound = await findOneByUsername(normalizedUsername)
  return response.status(200).json(userFound)
})

export default router.handler(errorHandlers)
