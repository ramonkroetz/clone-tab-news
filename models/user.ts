import { query } from 'infra/database'
import { ValidationError } from 'infra/errors'

export type User = {
  id: string
  username: string
  email: string
  password: string
  created_at: string
  updated_at: string
}

export async function create(userInputValues: Partial<User>): Promise<User> {
  await validateUniqueEmail(userInputValues.email)
  await validateUniqueUsername(userInputValues.username)

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

  console.dir(results)

  if ((results.rowCount ?? 1) > 0) {
    throw new ValidationError({
      message: 'Email already exists.',
      action: 'Use another email.',
    })
  }
}

export async function validateUniqueUsername(username?: string) {
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
