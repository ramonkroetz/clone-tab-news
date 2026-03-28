import { errorHandlers, setSessionCookie } from 'infra/controller'
import { getAuthenticateUser } from 'models/authentication'
import { createSession } from 'models/session'
import type { NextApiRequest, NextApiResponse } from 'next'
import { createRouter } from 'next-connect'

const router = createRouter<NextApiRequest, NextApiResponse>()

router.post(async (request: NextApiRequest, response: NextApiResponse) => {
  const userInputValues = request.body as {
    email: string
    password: string
  }

  const authenticateUser = await getAuthenticateUser(userInputValues.email, userInputValues.password)
  const newSession = await createSession(authenticateUser.id)
  setSessionCookie(response, newSession.token)

  return response.status(201).json(newSession)
})

export default router.handler(errorHandlers)
