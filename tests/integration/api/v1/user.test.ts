import { api } from 'infra/api'
import type { User } from 'models/user'
import { clearDatabase, createUserTest, runPendingMigrations, waitForAllServices } from 'tests/orchestrator'
import { version as uuidVersion } from 'uuid'
import { beforeEach, describe, expect, test } from 'vitest'

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

      const { data, status } = await api<User>('http://localhost:3000/api/v1/user')

      expect(status).toBe(200)
      expect(data).not.toBe(null)
      if (data) {
        expect(data).toEqual({
          id: createUser.id,
          username: 'UserWithValidSession',
          email: createUser.email,
          created_at: createUser.created_at,
          updated_at: createUser.updated_at,
        })

        expect(uuidVersion(createUser.id)).toBe(4)
        expect(Date.parse(data.created_at)).not.toBeNull()
        expect(Date.parse(data.updated_at)).not.toBeNull()
      }
    })
  })
})
