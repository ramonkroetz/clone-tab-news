import { api } from 'infra/api'
import { passwordCompare } from 'models/password'
import { findOneByUsername, User } from 'models/user'
import { clearDatabase, createUserTest, runPendingMigrations, waitForAllServices } from 'tests/orchestrator'
import { version as uuidVersion } from 'uuid'
import { beforeEach, describe, expect, test } from 'vitest'

beforeEach(async () => {
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
          password: data.password,
          created_at: data.created_at,
          updated_at: data.updated_at,
        })
        expect(uuidVersion(data.id)).toBe(4)
        expect(Date.parse(data.created_at)).not.toBeNaN()
        expect(Date.parse(data.updated_at)).not.toBeNaN()
      }

      const userInDatabase = await findOneByUsername('ramonkroetz')

      const passwordMatch = await passwordCompare('password123', userInDatabase?.password || '')
      expect(passwordMatch).toBe(true)

      const incorrectPasswordMatch = await passwordCompare('wrongpassword', userInDatabase?.password || '')
      expect(incorrectPasswordMatch).toBe(false)
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

describe('GET /api/v1/users/[username]', () => {
  describe('Anonymous user', () => {
    test('With exact case match', async () => {
      await createUserTest({
        username: 'ramonkroetz',
        email: 'asd@asd.com',
        password: 'password123',
      })

      const { status, data } = await api<User>('http://localhost:3000/api/v1/users/ramonkroetz')

      expect(status).toEqual(200)
      expect(data).not.toBeNull()
      if (data) {
        expect(data).toEqual({
          id: data.id,
          username: 'ramonkroetz',
          email: 'asd@asd.com',
          password: data.password,
          created_at: data.created_at,
          updated_at: data.updated_at,
        })
        expect(uuidVersion(data.id)).toBe(4)
        expect(Date.parse(data.created_at)).not.toBeNaN()
        expect(Date.parse(data.updated_at)).not.toBeNaN()
      }
    })

    test('With case mismatch', async () => {
      await createUserTest({
        username: 'ramonkroetz',
        email: 'asd@asd.com',
        password: 'password123',
      })

      const { status: statusGet, data } = await api<User>('http://localhost:3000/api/v1/users/RAMONKroetz')

      expect(statusGet).toEqual(200)
      expect(data).not.toBeNull()
      if (data) {
        expect(data).toEqual({
          id: data.id,
          username: 'ramonkroetz',
          email: 'asd@asd.com',
          password: data.password,
          created_at: data.created_at,
          updated_at: data.updated_at,
        })
        expect(uuidVersion(data.id)).toBe(4)
        expect(Date.parse(data.created_at)).not.toBeNaN()
        expect(Date.parse(data.updated_at)).not.toBeNaN()
      }
    })

    test('With nonexistent username', async () => {
      const { status, data, error } = await api<User>('http://localhost:3000/api/v1/users/userdoesnotexist')

      expect(status).toEqual(404)
      expect(data).toBeNull()
      expect(error).toEqual({
        name: 'NotFoundError',
        message: 'User not found.',
        action: 'Check the username and try again.',
        status_code: 404,
      })
    })
  })
})

describe('PATCH /api/v1/users/[username]', () => {
  describe('Anonymous user', () => {
    test('With nonexistent username', async () => {
      const { status, data, error } = await api<User>('http://localhost:3000/api/v1/users/nonexistentuser', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'newemail@asd.com',
        }),
      })

      expect(status).toEqual(404)
      expect(data).toBeNull()
      expect(error).toEqual({
        name: 'NotFoundError',
        message: 'User not found.',
        action: 'Check the username and try again.',
        status_code: 404,
      })
    })

    test('With duplicate username', async () => {
      await createUserTest({ username: 'user1' })
      await createUserTest({ username: 'user2' })

      const { status, data, error } = await api<User>('http://localhost:3000/api/v1/users/user2', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'user1',
        }),
      })

      expect(status).toEqual(400)
      expect(data).toBeNull()
      expect(error).toEqual({
        name: 'ValidationError',
        message: 'Username already exists.',
        action: 'Use another username.',
        status_code: 400,
      })
    })

    test('With duplicate email', async () => {
      await createUserTest({ email: 'user1@asd.com' })
      const { username } = await createUserTest({ email: 'user2@asd.com' })

      const { status, data, error } = await api<User>(`http://localhost:3000/api/v1/users/${username}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user1@asd.com',
        }),
      })

      expect(status).toEqual(400)
      expect(data).toBeNull()
      expect(error).toEqual({
        name: 'ValidationError',
        message: 'Email already exists.',
        action: 'Use another email.',
        status_code: 400,
      })
    })

    test('With unique username', async () => {
      const { username, email } = await createUserTest({
        username: 'user1',
      })

      const { status, data } = await api<User>(`http://localhost:3000/api/v1/users/${username}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'user2',
        }),
      })

      expect(status).toEqual(200)
      expect(data).not.toBeNull()
      if (data) {
        expect(data).toEqual({
          id: data.id,
          username: 'user2',
          email,
          password: data.password,
          created_at: data.created_at,
          updated_at: data.updated_at,
        })
        expect(uuidVersion(data.id)).toBe(4)
        expect(Date.parse(data.created_at)).not.toBeNaN()
        expect(Date.parse(data.updated_at)).not.toBeNaN()
        expect(data.updated_at > data.created_at).toBe(true)
      }
    })

    test('With unique email', async () => {
      const { username } = await createUserTest({
        email: 'user1@asd.com',
      })

      const { status, data } = await api<User>(`http://localhost:3000/api/v1/users/${username}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user2@asd.com',
        }),
      })

      expect(status).toEqual(200)
      expect(data).not.toBeNull()
      if (data) {
        expect(data).toEqual({
          id: data.id,
          username,
          email: 'user2@asd.com',
          password: data.password,
          created_at: data.created_at,
          updated_at: data.updated_at,
        })
        expect(uuidVersion(data.id)).toBe(4)
        expect(Date.parse(data.created_at)).not.toBeNaN()
        expect(Date.parse(data.updated_at)).not.toBeNaN()
        expect(data.updated_at > data.created_at).toBe(true)
      }
    })

    test('With new password', async () => {
      const { username, email } = await createUserTest({
        password: 'password123',
      })

      const { status, data } = await api<User>(`http://localhost:3000/api/v1/users/${username}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: 'newpassword123',
        }),
      })

      expect(status).toEqual(200)
      expect(data).not.toBeNull()
      if (data) {
        expect(data).toEqual({
          id: data.id,
          username,
          email,
          password: data.password,
          created_at: data.created_at,
          updated_at: data.updated_at,
        })
        expect(uuidVersion(data.id)).toBe(4)
        expect(Date.parse(data.created_at)).not.toBeNaN()
        expect(Date.parse(data.updated_at)).not.toBeNaN()
        expect(data.updated_at > data.created_at).toBe(true)
      }

      const userInDatabase = await findOneByUsername(username)

      const passwordMatch = await passwordCompare('newpassword123', userInDatabase?.password || '')
      expect(passwordMatch).toBe(true)

      const incorrectPasswordMatch = await passwordCompare('password123', userInDatabase?.password || '')
      expect(incorrectPasswordMatch).toBe(false)
    })
  })
})
