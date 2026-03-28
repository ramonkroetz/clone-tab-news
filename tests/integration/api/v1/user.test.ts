import { api } from 'infra/api'
import { EXPIRATION_IN_MILLISECONDS, findValidSessionByToken } from 'models/session'
import type { User } from 'models/user'
import setCookieParser from 'set-cookie-parser'
import {
  clearDatabase,
  createSessionTest,
  createUserTest,
  runPendingMigrations,
  waitForAllServices,
} from 'tests/orchestrator'
import { version as uuidVersion } from 'uuid'
import { beforeEach, describe, expect, test, vitest } from 'vitest'

type UserClient = Omit<User, 'created_at' | 'updated_at'> & {
  created_at: string
  updated_at: string
}

beforeEach(async () => {
  await waitForAllServices()
  await clearDatabase()
  await runPendingMigrations()
})

describe('GET /api/v1/user', () => {
  describe('Default user', () => {
    test('With valid session', async () => {
      const createUser = await createUserTest({
        username: 'UserWithValidSession',
      })

      const session = await createSessionTest(createUser.id)

      const { data, status, response } = await api<UserClient>('http://localhost:3000/api/v1/user', {
        headers: {
          Cookie: `session_id=${session.token}`,
        },
      })

      expect(status).toBe(200)
      expect(data).not.toBe(null)
      if (data) {
        expect(data).toEqual({
          id: createUser.id,
          username: 'UserWithValidSession',
          email: createUser.email,
          password: createUser.password,
          created_at: createUser.created_at.toISOString(),
          updated_at: createUser.updated_at.toISOString(),
        })

        expect(uuidVersion(createUser.id)).toBe(4)
        expect(Date.parse(data.created_at)).not.toBeNull()
        expect(Date.parse(data.updated_at)).not.toBeNull()

        const renewedSession = await findValidSessionByToken(session.token)

        expect(renewedSession).not.toBeNull()
        if (renewedSession) {
          expect(renewedSession.expires_at > session.expires_at).toEqual(true)
          expect(renewedSession.updated_at > session.updated_at).toEqual(true)

          const setCookieHeader = response?.headers.get('set-cookie')
          const parsedSetCookie = setCookieParser(setCookieHeader ? [setCookieHeader] : [], {
            map: true,
          })

          expect(parsedSetCookie.session_id).toEqual({
            name: 'session_id',
            value: renewedSession.token,
            maxAge: EXPIRATION_IN_MILLISECONDS / 1000,
            path: '/',
            httpOnly: true,
          })
        }
      }
    })

    test('With nonexistent session', async () => {
      const nonExistentToken =
        'fca60a1e6cd39f46d5719c91a2ece97406bae8d0bea2f5a5aa108671533a0733ada8b2a1fb2f965afc653747752ba0d1'

      const { status, error } = await api('http://localhost:3000/api/v1/user', {
        headers: {
          Cookie: `session_id=${nonExistentToken}`,
        },
      })

      expect(status).toBe(401)
      expect(error).toEqual({
        name: 'UnauthorizedError',
        message: 'Session not found.',
        action: 'Check if user is logged in and try again.',
        status_code: 401,
      })
    })

    test('With expired session', async () => {
      vitest.useFakeTimers({
        now: new Date(Date.now() - EXPIRATION_IN_MILLISECONDS),
      })

      const createUser = await createUserTest()
      const session = await createSessionTest(createUser.id)

      vitest.useRealTimers()

      const { status, error } = await api<UserClient>('http://localhost:3000/api/v1/user', {
        headers: {
          Cookie: `session_id=${session.token}`,
        },
      })

      expect(status).toBe(401)
      expect(error).toEqual({
        name: 'UnauthorizedError',
        message: 'Session not found.',
        action: 'Check if user is logged in and try again.',
        status_code: 401,
      })
    })
  })
})
