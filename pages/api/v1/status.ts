import { NextApiRequest, NextApiResponse } from 'next'
import database from 'infra/database'

export default async function status(_: NextApiRequest, response: NextApiResponse) {
  const result = await database.query('SELECT 1 + 1 as sum;')
  console.log(result.rows)
  response.status(200).json({ chave: 'asd' })
}
