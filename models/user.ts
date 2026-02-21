import { query } from 'infra/database'
import { NotFoundError, ValidationError } from 'infra/errors'

import { hashPassword } from './password'

export type User = {
  id: string
  username: string
  email: string
  password: string
  created_at: string
  updated_at: string
}

export async function createUser(userInputValues: Partial<User>): Promise<User> {
  await validateUniqueUsername(userInputValues.username)
  await validateUniqueEmail(userInputValues.email)
  await hashPasswordInObject(userInputValues)

  const results = await query<User>({
    text: `
      INSERT INTO users
        (username, email, password)
      VALUES 
        ($1, $2, $3)
      RETURNING
        *
      ;`,
    values: [userInputValues.username, userInputValues.email, userInputValues.password],
  })

  return results.rows[0]
}

export async function findOneByUsername(username?: string): Promise<User | null> {
  const results = await query<User>({
    text: `
      SELECT
        *
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
      LIMIT
        1
      ;`,
    values: [username],
  })

  if (results.rowCount === 0) {
    throw new NotFoundError({
      message: 'User not found.',
      action: 'Check the username and try again.',
    })
  }

  return results.rows[0]
}

export async function updateUser(username: string | undefined, userInputValues: Partial<User>): Promise<User> {
  const currentUser = await findOneByUsername(username)

  if ('username' in userInputValues) {
    await validateUniqueUsername(userInputValues.username)
  }

  if ('email' in userInputValues) {
    await validateUniqueEmail(userInputValues.email)
  }

  if ('password' in userInputValues) {
    await hashPasswordInObject(userInputValues)
  }

  const userWithNewValues: Partial<User> = {
    ...currentUser,
    ...userInputValues,
  }

  return await runUpdateQuery(userWithNewValues)
}

async function runUpdateQuery(userWithNewValues: Partial<User>): Promise<User> {
  const results = await query<User>({
    text: `
      UPDATE
        users
      SET
        username = $2,
        email = $3,
        password = $4,
        updated_at = timezone('utc', now())
      WHERE
        id = $1
      RETURNING
        *
      ;
    `,
    values: [userWithNewValues.id, userWithNewValues.username, userWithNewValues.email, userWithNewValues.password],
  })

  return results.rows[0]
}

async function validateUniqueEmail(email?: string) {
  const results = await query<{ email: string }>({
    text: `
      SELECT
        email
      FROM
        users
      WHERE
        LOWER(email) = LOWER($1)
      ;`,
    values: [email],
  })

  if ((results.rowCount ?? 1) > 0) {
    throw new ValidationError({
      message: 'Email already exists.',
      action: 'Use another email.',
    })
  }
}

async function validateUniqueUsername(username?: string) {
  const results = await query<{ username: string }>({
    text: `
      SELECT
        username
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
      ;`,
    values: [username],
  })

  if ((results.rowCount ?? 1) > 0) {
    throw new ValidationError({
      message: 'Username already exists.',
      action: 'Use another username.',
    })
  }
}

async function hashPasswordInObject(userInputValues: Partial<User>) {
  const hash = await hashPassword(userInputValues.password ?? '')
  userInputValues.password = hash
}
