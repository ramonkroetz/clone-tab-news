import { api } from 'helpers/api'
import { RunMigration } from 'node-pg-migrate/dist/migration'
import { waitForAllServices, clearDatabase } from 'tests/orchestrator'

beforeAll(async () => {
  await waitForAllServices()
  await clearDatabase()
})

describe('GET /api/v1/migrations', () => {
  describe('Anonymous user', () => {
    test('Retrieving pending migrations', async () => {
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
    describe('Retrieving pending migrations', () => {
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

describe('Method not allowed /api/v1/migrations', () => {
  describe('Anonymous user', () => {
    test('Retrieving pending migrations', async () => {
      const notAllowedMethods = ['PUT', 'DELETE', 'OPTIONS', 'PATCH']

      notAllowedMethods.forEach(async (method) => {
        const { status, error } = await api<RunMigration[]>('http://localhost:3000/api/v1/migrations', {
          method,
        })

        expect(status).toBe(405)
        expect(error instanceof Error).toBe(true)
        if (error instanceof Error) {
          expect(error.message).toBe(`Method ${method} not allowed`)
        }
      })
    })
  })
})
