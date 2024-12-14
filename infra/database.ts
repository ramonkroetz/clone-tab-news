import { Client, QueryConfig } from 'pg'

type QueryResult<T> = {
  rows: T[]
}

export async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' || false,
  })

  await client.connect()
  return client
}

export async function query<T>(queryObject: string | QueryConfig) {
  let client

  try {
    client = await getNewClient()
    const result = await client.query(queryObject)
    return (await result) as QueryResult<T>
  } catch (error) {
    console.error(error)
    throw error
  } finally {
    await client?.end()
  }
}
