import { NextApiRequest, NextApiResponse } from 'next'

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
