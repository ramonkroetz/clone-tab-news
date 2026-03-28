import { faker } from '@faker-js/faker'
import retry from 'async-retry'
import { api } from 'infra/api'
import { query } from 'infra/database'
import { runPendingMigrations as runPendingMigrationsModel } from 'models/migrator'
import { createSession } from 'models/session'
import { createUser } from 'models/user'
import type { StatusResponse } from 'pages/api/v1/status'

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

export async function runPendingMigrations() {
  await runPendingMigrationsModel()
}

export async function createUserTest({
  password,
  username,
  email,
}: {
  password?: string
  username?: string
  email?: string
} = {}) {
  return await createUser({
    password: password || 'validpassword',
    username: username || faker.internet.username().replace(/[_.-]/g, ''),
    email: email || faker.internet.email(),
  })
}

export async function createSessionTest(userId: string) {
  return await createSession(userId)
}
