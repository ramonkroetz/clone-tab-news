import { errorHandlers, setSessionCookie } from 'infra/controller'
import { findValidSessionByToken, renewSession } from 'models/session'
import { findOneUserById } from 'models/user'
import type { NextApiRequest, NextApiResponse } from 'next'
import { createRouter } from 'next-connect'

const router = createRouter<NextApiRequest, NextApiResponse>()

router.get(async (request: NextApiRequest, response: NextApiResponse) => {
  const sessionId = request.cookies.session_id

  const session = await findValidSessionByToken(sessionId)
  const renewedSession = await renewSession(session.id)
  setSessionCookie(response, renewedSession.token)
  const userFound = await findOneUserById(session.user_id)

  response.setHeader('Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate')
  response.status(200).json(userFound)
})

export default router.handler(errorHandlers)
