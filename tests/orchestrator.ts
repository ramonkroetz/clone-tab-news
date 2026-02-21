import { faker } from '@faker-js/faker'
import retry from 'async-retry'
import { api } from 'infra/api'
import { query } from 'infra/database'
import { runPendingMigrations as runPendingMigrationsModel } from 'models/migrator'
import { createUser, User } from 'models/user'
import { StatusResponse } from 'pages/api/v1/status'

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

export async function createUserTest(user: Partial<User>) {
  return await createUser({
    password: user.password || 'validpassword',
    username: user.username || faker.internet.username().replace(/[_.-]/g, ''),
    email: user.email || faker.internet.email(),
  })
}
