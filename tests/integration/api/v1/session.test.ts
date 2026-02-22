import { api } from 'infra/api'
import { EXPIRATION_IN_MILLISECONDS } from 'models/session'
import setCookieParser from 'set-cookie-parser'
import { clearDatabase, createUserTest, runPendingMigrations, waitForAllServices } from 'tests/orchestrator'
import { version as uuidVersion } from 'uuid'
import { beforeEach, describe, expect, test } from 'vitest'

beforeEach(async () => {
  await waitForAllServices()
  await clearDatabase()
  await runPendingMigrations()
})

describe('POST /api/v1/session', () => {
  describe('Anonymous user', () => {
    test('With incorrect email but correct password', async () => {
      await createUserTest({
        password: 'correct_password',
      })

      const { data, status, error } = await api('http://localhost:3000/api/v1/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'incorrect_email@example.com',
          password: 'correct_password',
        }),
      })

      expect(status).toEqual(401)
      expect(data).toBe(null)
      expect(error).toEqual({
        name: 'UnauthorizedError',
        message: 'Invalid session.',
        action: 'Check your credentials and try again.',
        status_code: 401,
      })
    })

    test('With correct email but incorrect password', async () => {
      await createUserTest({
        email: 'correct_email@example.com',
      })

      const { data, status, error } = await api('http://localhost:3000/api/v1/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'correct_email@example.com',
          password: 'incorrect_password',
        }),
      })

      expect(status).toEqual(401)
      expect(data).toBe(null)
      expect(error).toEqual({
        name: 'UnauthorizedError',
        message: 'Invalid session.',
        action: 'Check your credentials and try again.',
        status_code: 401,
      })
    })

    test('With incorrect email and incorrect password', async () => {
      await createUserTest()

      const { data, status, error } = await api('http://localhost:3000/api/v1/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'incorrect_email@example.com',
          password: 'incorrect_password',
        }),
      })

      expect(status).toEqual(401)
      expect(data).toBe(null)
      expect(error).toEqual({
        name: 'UnauthorizedError',
        message: 'Invalid session.',
        action: 'Check your credentials and try again.',
        status_code: 401,
      })
    })

    test('With correct email and correct password', async () => {
      const { id } = await createUserTest({
        email: 'correct_email@example.com',
        password: 'correct_password',
      })

      const response = await fetch('http://localhost:3000/api/v1/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'correct_email@example.com',
          password: 'correct_password',
        }),
      })

      expect(response.status).toEqual(201)
      const data = await response.json()
      expect(data).not.toBe(null)
      if (data) {
        expect(data).toEqual({
          id: data.id,
          token: data.token,
          user_id: id,
          created_at: data.created_at,
          updated_at: data.updated_at,
          expires_at: data.expires_at,
        })
        expect(uuidVersion(data.id)).toBe(4)
        expect(Date.parse(data.created_at)).not.toBeNaN()
        expect(Date.parse(data.updated_at)).not.toBeNaN()
        expect(Date.parse(data.expires_at)).not.toBeNaN()

        const expiresAt = new Date(data.expires_at)
        const createdAt = new Date(data.created_at)
        expiresAt.setMilliseconds(0)
        createdAt.setMilliseconds(0)

        expect(expiresAt.getTime() - createdAt.getTime()).toBe(EXPIRATION_IN_MILLISECONDS)

        const setCookieHeader = response.headers.get('set-cookie')
        const parsedSetCookie = setCookieParser(setCookieHeader ? [setCookieHeader] : [], {
          map: true,
        })

        expect(parsedSetCookie.session_id).toEqual({
          name: 'session_id',
          value: data?.token,
          maxAge: EXPIRATION_IN_MILLISECONDS / 1000,
          path: '/',
          httpOnly: true,
        })
      }
    })
  })
})
