import { errorHandlers } from 'infra/controller'
import { create } from 'models/user'
import { NextApiRequest, NextApiResponse } from 'next'
import { createRouter } from 'next-connect'

const router = createRouter<NextApiRequest, NextApiResponse>()

router.post(async (request: NextApiRequest, response: NextApiResponse) => {
  const userInputValues = request.body
  const newUser = await create(userInputValues)
  return response.status(201).json(newUser)
})

export default router.handler(errorHandlers)
