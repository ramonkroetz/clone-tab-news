import { NextApiRequest, NextApiResponse } from 'next'

import { InternalServerError, MethodNotAllowedError, NotFoundError, ValidationError } from './errors'

function onNoMatch(_request: NextApiRequest, response: NextApiResponse) {
  const publicErrorObject = new MethodNotAllowedError()
  response.status(publicErrorObject.statusCode).json(publicErrorObject)
}

function onError(error: unknown, _request: NextApiRequest, response: NextApiResponse) {
  if (error instanceof ValidationError || error instanceof NotFoundError) {
    return response.status(error.statusCode).json(error)
  }

  const publicErrorObject = new InternalServerError({
    statusCode: (typeof error === 'object' && error && 'statusCode' in error && Number(error.statusCode)) || 500,
    cause: error,
  })

  response.status(publicErrorObject.statusCode).json(publicErrorObject)
}

export const errorHandlers = {
  onNoMatch,
  onError,
}
