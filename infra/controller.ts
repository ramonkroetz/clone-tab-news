import { NextApiRequest, NextApiResponse } from 'next'
import { InternalServerError, MethodNotAllowedError } from './errors'

function onNoMatch(request: NextApiRequest, response: NextApiResponse) {
  const publicErrorObject = new MethodNotAllowedError()
  response.status(publicErrorObject.statusCode).json(publicErrorObject)
}

function onError(error: unknown, request: NextApiRequest, response: NextApiResponse) {
  const statusCode =
    (typeof error === 'object' && error && 'statusCode' in error && Number(error.statusCode)) || undefined
  const publicErrorObject = new InternalServerError({
    statusCode,
    cause: error,
  })
  response.status(publicErrorObject.statusCode).json(publicErrorObject)
}

export const errorHandlers = {
  onNoMatch,
  onError,
}
