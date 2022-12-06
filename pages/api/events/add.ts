import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs';
import { v4 as uuidv4 } from "uuid";

type TEvent = {
  id: string,
  name: string,
  color: string,
  days: Array<number>,
};
type TEvents = Array<TEvent>;

type Response = {
  code: number,
  message: string,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  const { name, color, days }: TEvent = req.body;
  
  try {

      // read
      let getData = fs.readFileSync('./eventsList.txt', 'utf8');
      let currentEventList: TEvents = getData ? JSON.parse(getData) : [];
      let eventsList: TEvents = [];

      let newData: TEvent = {
          id: uuidv4(),
          name,
          color,
          days,
      };

      // write
      eventsList = [...currentEventList, newData];
      fs.writeFileSync('./eventsList.txt', JSON.stringify(eventsList))

      res.status(200).json({
        code: 200,
        message: "Events added",
      })
  } catch (e) { 
    console.log(e);
    res.status(200).json({
      code: 200,
      message: "Something error",
    })
  }
}
