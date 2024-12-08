import { NextApiRequest, NextApiResponse } from 'next'
import { query } from '@infra/database'

export type StatusResponse = {
  update_at: string
  dependencies: {
    database: {
      version: string
      max_connections: number
      opened_connections: number
    }
  }
}

export default async function status(_: NextApiRequest, response: NextApiResponse) {
  const udpateAt = new Date().toISOString()
  const databaseVersionResult = await query<{ server_version: string }>('SHOW server_version;')
  const databaseMaxConnectionResult = await query<{ max_connections: string }>('SHOW max_connections;')
  const databaseOpenedConnectionsResult = await query<{ opened_connections: number }>({
    text: `
      SELECT COUNT(*)::int AS opened_connections
      FROM pg_stat_activity
      WHERE datname = $1;
    `,
    values: [process.env.POSTGRES_DB],
  })

  const statusData: StatusResponse = {
    update_at: udpateAt,
    dependencies: {
      database: {
        opened_connections: databaseOpenedConnectionsResult.rows[0].opened_connections,
        max_connections: Number(databaseMaxConnectionResult.rows[0].max_connections),
        version: databaseVersionResult.rows[0].server_version,
      },
    },
  }

  response.status(200).json(statusData)
}
