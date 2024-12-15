import retry from 'async-retry'
import { StatusResponse } from 'pages/api/v1/status'
import { api } from 'services/api'

export async function waitForAllServices() {
  async function waitForWebServer() {
    async function fetchStatusPage() {
      await api<StatusResponse>('http://localhost:3000/api/v1/status')
    }

    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    })
  }

  await waitForWebServer()
}
