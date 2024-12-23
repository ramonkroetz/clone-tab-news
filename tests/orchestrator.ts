import retry from 'async-retry'
import { query } from 'infra/database'
import { StatusResponse } from 'pages/api/v1/status'
import { api } from 'services/api'

export async function waitForAllServices() {
  async function waitForWebServer() {
    async function fetchStatusPage() {
      const { status, error } = await api<StatusResponse>('http://localhost:3000/api/v1/status')

      if (status !== 200) {
        throw error
      }
    }

    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
      onRetry: (error: Error, attempt) => {
        console.log(`Attempt ${attempt} - Failed to fetch status page: ${error.message}`)
      },
    })
  }

  await waitForWebServer()
}

export async function clearDatabase() {
  await query('drop schema public cascade; create schema public;')
}
