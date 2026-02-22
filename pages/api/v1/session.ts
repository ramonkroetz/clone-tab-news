import * as cookie from 'cookie'
import { errorHandlers } from 'infra/controller'
import { getAuthenticateUser } from 'models/authentication'
import { createSession, EXPIRATION_IN_MILLISECONDS } from 'models/session'
import { NextApiRequest, NextApiResponse } from 'next'
import { createRouter } from 'next-connect'

const router = createRouter<NextApiRequest, NextApiResponse>()

router.post(async (request: NextApiRequest, response: NextApiResponse) => {
  const userInputValues = request.body as {
    email: string
    password: string
  }

  const authenticateUser = await getAuthenticateUser(userInputValues.email, userInputValues.password)

  const newSession = await createSession(authenticateUser.id)

  const setCookie = cookie.serialize('session_id', newSession.token, {
    path: '/',
    maxAge: EXPIRATION_IN_MILLISECONDS / 1000,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  })
  response.setHeader('Set-Cookie', setCookie)

  return response.status(201).json(newSession)
})

export default router.handler(errorHandlers)
