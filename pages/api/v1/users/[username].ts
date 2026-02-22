import { errorHandlers } from 'infra/controller'
import { findOneUserByUsername, updateUser } from 'models/user'
import { NextApiRequest, NextApiResponse } from 'next'
import { createRouter } from 'next-connect'

const router = createRouter<NextApiRequest, NextApiResponse>()

router.get(async (request: NextApiRequest, response: NextApiResponse) => {
  const username = request.query.username
  const normalizedUsername = Array.isArray(username) ? username[0] : username
  const userFound = await findOneUserByUsername(normalizedUsername)
  return response.status(200).json(userFound)
})

router.patch(async (request: NextApiRequest, response: NextApiResponse) => {
  const username = request.query.username
  const normalizedUsername = Array.isArray(username) ? username[0] : username
  const userInputValues = request.body

  const updatedUser = await updateUser(normalizedUsername, userInputValues)
  return response.status(200).json(updatedUser)
})

export default router.handler(errorHandlers)
