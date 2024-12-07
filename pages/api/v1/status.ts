import { NextApiRequest, NextApiResponse } from 'next'

export default function status(_: NextApiRequest, response: NextApiResponse) {
  response.status(200).json({ chave: 'asd' })
}
