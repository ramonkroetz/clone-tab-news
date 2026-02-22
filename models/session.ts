import crypto from 'node:crypto'

import { query } from 'infra/database'

export const EXPIRATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000 // 30 days

export type Session = {
  id: string
  token: string
  user_id: string
  created_at: string
  updated_at: string
  expires_at: string
}

export async function createSession(userId: string): Promise<Session> {
  const token = crypto.randomBytes(48).toString('hex')
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS)

  const result = await query({
    text: `
      INSERT INTO 
        sessions (token, user_id, expires_at)
      VALUES 
        ($1, $2, $3)
      RETURNING
        *
      ;
    `,
    values: [token, userId, expiresAt],
  })

  return result.rows[0] as Session
}
