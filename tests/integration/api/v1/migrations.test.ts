import { api } from 'services/api'
import { RunMigration } from 'node-pg-migrate/dist/migration'
import { query } from 'infra/database'
import { waitForAllServices } from 'tests/orchestrator'

beforeAll(async () => {
  await waitForAllServices()
  await query('drop schema public cascade; create schema public;')
})

describe('GET /api/v1/migrations', () => {
  describe('Anonymous user', () => {
    test('Running pending migrations', async () => {
      const { data, status, error } = await api<RunMigration[]>('http://localhost:3000/api/v1/migrations')

      expect(status).toBe(200)
      expect(error).toBe(null)
      expect(Array.isArray(data)).toBe(true)
      expect(data?.length).toBeGreaterThan(0)
    })
  })
})

describe('POST /api/v1/migrations', () => {
  describe('Anonymous user', () => {
    describe('Running pending migrations', () => {
      test('For the first time', async () => {
        const { data, status, error } = await api<RunMigration[]>('http://localhost:3000/api/v1/migrations', {
          method: 'POST',
        })

        expect(status).toBe(201)
        expect(error).toBe(null)
        expect(Array.isArray(data)).toBe(true)
        expect(data?.length).toBeGreaterThan(0)
      })

      test('For the second time', async () => {
        const { data, status, error } = await api<RunMigration[]>('http://localhost:3000/api/v1/migrations', {
          method: 'POST',
        })

        expect(status).toBe(200)
        expect(error).toBe(null)
        expect(Array.isArray(data)).toBe(true)
        expect(data?.length).toBe(0)
      })
    })
  })
})

describe('PUT /api/v1/migrations', () => {
  describe('Anonymous user', () => {
    test('Running pending migrations', async () => {
      const { status, error } = await api<RunMigration[]>('http://localhost:3000/api/v1/migrations', {
        method: 'PUT',
      })

      expect(status).toBe(405)
      expect(error).toBe('Method PUT not allowed')
    })
  })
})
