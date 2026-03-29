import * as cookie from 'cookie'
import { EXPIRATION_IN_MILLISECONDS } from 'models/session'
import type { NextApiRequest, NextApiResponse } from 'next'

import { InternalServerError, MethodNotAllowedError, NotFoundError, UnauthorizedError, ValidationError } from './errors'

function onNoMatch(_request: NextApiRequest, response: NextApiResponse) {
  const publicErrorObject = new MethodNotAllowedError()
  response.status(publicErrorObject.statusCode).json(publicErrorObject)
}

function onError(error: unknown, _request: NextApiRequest, response: NextApiResponse) {
  if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof UnauthorizedError) {
    return response.status(error.statusCode).json(error)
  }

  const publicErrorObject = new InternalServerError({
    cause: error,
  })

  response.status(publicErrorObject.statusCode).json(publicErrorObject)
}

export const errorHandlers = {
  onNoMatch,
  onError,
}

export function setSessionCookie(response: NextApiResponse, sessionToken: string) {
  const setCookie = cookie.serialize('session_id', sessionToken, {
    path: '/',
    maxAge: EXPIRATION_IN_MILLISECONDS / 1000,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  })

  response.setHeader('Set-Cookie', setCookie)
}

export function clearSessionCookie(response: NextApiResponse) {
  const setCookie = cookie.serialize('session_id', 'invalid', {
    path: '/',
    maxAge: -1,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  })

  response.setHeader('Set-Cookie', setCookie)
}
