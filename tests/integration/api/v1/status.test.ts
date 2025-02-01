import { StatusResponse } from 'pages/api/v1/status'
import { api } from 'infra/api'
import { waitForAllServices } from 'tests/orchestrator'

beforeAll(async () => {
  await waitForAllServices()
})

describe('GET - /api/v1/status', () => {
  describe('Anonymous user', () => {
    test('Retrieving current system status', async () => {
      const { data, status, error } = await api<StatusResponse>('http://localhost:3000/api/v1/status')
      const parsedUpdateAt = new Date(data?.update_at || '').toISOString()

      expect(status).toEqual(200)
      expect(error).toEqual(null)
      expect(data?.update_at).toEqual(parsedUpdateAt)
      expect(data?.dependencies.database.max_connections).toEqual(100)
      expect(data?.dependencies.database.opened_connections).toEqual(1)
      expect(data?.dependencies.database.version).toEqual('16.0')
    })
  })
})

describe('POST - /api/v1/status', () => {
  describe('Anonymous user', () => {
    test('Method not allowed.', async () => {
      const { status, error } = await api<StatusResponse>('http://localhost:3000/api/v1/status', {
        method: 'POST',
      })

      expect(status).toEqual(405)
      expect(error).toEqual({
        name: 'MethodNotAllowedError',
        message: 'Method not allowed.',
        action: 'Check HTTP method.',
        status_code: 405,
      })
    })
  })
})
