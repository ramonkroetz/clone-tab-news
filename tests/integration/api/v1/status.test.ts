import { StatusResponse } from 'pages/api/v1/status'
import { api } from 'services/api'
import { waitForAllServices } from 'tests/orchestrator'

beforeAll(async () => {
  await waitForAllServices()
})

describe('GET - /api/v1/status', () => {
  describe('Anonymous user', () => {
    test('Retrieving current system status', async () => {
      const { data, status, error } = await api<StatusResponse>('http://localhost:3000/api/v1/status')
      const parsedUpdateAt = new Date(data?.update_at || '').toISOString()

      expect(status).toBe(200)
      expect(error).toBe(null)
      expect(data?.update_at).toEqual(parsedUpdateAt)
      expect(data?.dependencies.database.max_connections).toBe(100)
      expect(data?.dependencies.database.opened_connections).toBe(1)
      expect(data?.dependencies.database.version).toBe('16.0')
    })
  })
})
