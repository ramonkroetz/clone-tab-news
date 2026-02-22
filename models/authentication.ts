import { NotFoundError, UnauthorizedError } from 'infra/errors'

import { comparePassword } from './password'
import { findOneUserByEmail, type User } from './user'

export async function getAuthenticateUser(email?: string, password?: string): Promise<User> {
  try {
    let storedUser: User

    try {
      storedUser = await findOneUserByEmail(email)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: 'Invalid email.',
          action: 'Check your credentials and try again.',
        })
      }

      throw error
    }

    const isPasswordValid = await comparePassword(password, storedUser.password)

    if (!isPasswordValid) {
      throw new UnauthorizedError({
        message: 'Invalid password.',
        action: 'Check your credentials and try again.',
      })
    }

    return storedUser
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: 'Invalid session.',
        action: 'Check your credentials and try again.',
      })
    }

    throw error
  }
}
