import { api } from 'infra/api'
import { User } from 'models/user'
import { clearDatabase, runPendingMigrations, waitForAllServices } from 'tests/orchestrator'
import { version as uuidVersion } from 'uuid'
import { beforeAll, describe, expect, test } from 'vitest'

beforeAll(async () => {
  await waitForAllServices()
  await clearDatabase()
  await runPendingMigrations()
})

describe('POST /api/v1/user', () => {
  describe('Anonymous user', () => {
    test('With unique and valid data', async () => {
      const { status, data } = await api<User>('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'ramonkroetz',
          email: 'asd@asd.com',
          password: 'password123',
        }),
      })

      expect(status).toEqual(201)
      expect(data).not.toBeNull()
      if (data) {
        expect(data).toEqual({
          id: data.id,
          username: 'ramonkroetz',
          email: 'asd@asd.com',
          password: 'password123',
          created_at: data.created_at,
          updated_at: data.updated_at,
        })
        expect(uuidVersion(data.id)).toBe(4)
        expect(Date.parse(data.created_at)).not.toBeNaN()
        expect(Date.parse(data.updated_at)).not.toBeNaN()
      }
    })

    test('With duplicate email', async () => {
      const { status } = await api<User>('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'duplicateuseremail',
          email: 'duplicate@asd.com',
          password: 'password123',
        }),
      })

      expect(status).toEqual(201)

      const {
        status: status2,
        data: data2,
        error: error2,
      } = await api<User>('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'duplicateuseremail2',
          email: 'Duplicate@asd.com',
          password: 'password123',
        }),
      })

      expect(status2).toEqual(400)
      expect(data2).toBeNull()
      expect(error2).toEqual({
        name: 'ValidationError',
        message: 'Email already exists.',
        action: 'Use another email.',
        status_code: 400,
      })
    })

    test('With duplicate username', async () => {
      const { status } = await api<User>('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'duplicateusername',
          email: 'duplicateusername@asd.com',
          password: 'password123',
        }),
      })

      expect(status).toEqual(201)

      const {
        status: status2,
        data: data2,
        error: error2,
      } = await api<User>('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'DuplicateUsername',
          email: 'duplicateusername2@asd.com',
          password: 'password123',
        }),
      })

      expect(status2).toEqual(400)
      expect(data2).toBeNull()
      expect(error2).toEqual({
        name: 'ValidationError',
        message: 'Username already exists.',
        action: 'Use another username.',
        status_code: 400,
      })
    })
  })
})
