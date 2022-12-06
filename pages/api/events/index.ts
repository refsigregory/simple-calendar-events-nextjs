import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs';

type TEvents = Array<{
  id: string,
  name: string,
  color: string,
  days: Array<number>,
}>

type Response = {
  code: number,
  data: TEvents,
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {

  let getData = fs.readFileSync('./eventsList.txt', 'utf8');
  const eventsList = getData ? JSON.parse(getData) : [];

  res.status(200).json({
    code: 200,
    data: eventsList,
  })
}
