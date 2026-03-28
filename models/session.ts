import crypto from 'node:crypto'

import { query } from 'infra/database'
import { UnauthorizedError } from 'infra/errors'

export const EXPIRATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000 // 30 days

export type Session = {
  id: string
  token: string
  user_id: string
  created_at: Date
  updated_at: Date
  expires_at: Date
}

export async function createSession(userId: string): Promise<Session> {
  const token = crypto.randomBytes(48).toString('hex')
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS)

  const result = await query<Session>({
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

  return result.rows[0]
}

export async function findValidSessionByToken(token?: string): Promise<Session> {
  const result = await query<Session>({
    text: `
      SELECT 
        *
      FROM 
        sessions
      WHERE 
        token = $1
        AND expires_at > NOW()
      LIMIT
        1
      ;
    `,
    values: [token],
  })

  if (result.rows.length === 0) {
    throw new UnauthorizedError({
      message: 'Session not found.',
      action: 'Check if user is logged in and try again.',
    })
  }

  return result.rows[0]
}

export async function renewSession(sessionId?: string): Promise<Session> {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS)
  const result = await query<Session>({
    text: `
      UPDATE 
        sessions
      SET
        expires_at = $2,
        updated_at = NOW()
      WHERE 
        id = $1
      RETURNING
        *
      ;
    `,
    values: [sessionId, expiresAt],
  })

  if (result.rows.length === 0) {
    throw new UnauthorizedError({
      message: 'Session not found.',
      action: 'Check if user is logged in and try again.',
    })
  }

  return result.rows[0]
}
