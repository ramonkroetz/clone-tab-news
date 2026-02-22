import { errorHandlers } from 'infra/controller'
import { createUser } from 'models/user'
import { NextApiRequest, NextApiResponse } from 'next'
import { createRouter } from 'next-connect'

const router = createRouter<NextApiRequest, NextApiResponse>()

router.post(async (request: NextApiRequest, response: NextApiResponse) => {
  const userInputValues = request.body as { email: string; password: string; username: string }
  const newUser = await createUser(userInputValues)
  return response.status(201).json(newUser)
})

export default router.handler(errorHandlers)
