import { api } from 'services/api'
import { RunMigration } from 'node-pg-migrate/dist/migration'
import { query } from 'infra/database'

async function cleanDatabase() {
  await query('drop schema public cascade; create schema public;')
}

beforeAll(cleanDatabase)

test('GET to /api/v1/migrations should return 200', async () => {
  const { data, status } = await api<RunMigration[]>('http://localhost:3000/api/v1/migrations')

  expect(status).toBe(200)
  expect(Array.isArray(data)).toBe(true)
  expect(data.length).toBeGreaterThan(0)
})

test('POST to /api/v1/migrations should return 200', async () => {
  const { data, status } = await api<RunMigration[]>('http://localhost:3000/api/v1/migrations', {
    method: 'POST',
  })

  expect(status).toBe(201)
  expect(Array.isArray(data)).toBe(true)
  expect(data.length).toBeGreaterThan(0)

  const { data: data2, status: status2 } = await api<RunMigration[]>('http://localhost:3000/api/v1/migrations', {
    method: 'POST',
  })

  expect(status2).toBe(200)
  expect(Array.isArray(data2)).toBe(true)
  expect(data2.length).toBe(0)
})
