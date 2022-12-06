import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs';
import _ from 'lodash';


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
  const { id }: TEvent = req.body;
  
  try {

      // read
      let getData = fs.readFileSync('./eventsList.txt', 'utf8');

      if (!id) {
        return res.status(400).json({
          code: 400,
          message: "Please enter the valid ID",
        })
      }

      if (!getData) {
        return res.status(400).json({
          code: 400,
          message: "No events data",
        })
      }

      let currentEventList: TEvents = getData ? JSON.parse(getData) : [];

      let selectedData = currentEventList.find((obj) => {
        return obj.id === id
      });

      if (!selectedData) {
        return res.status(400).json({
          code: 400,
          message: "Please enter the valid ID",
        })
      }
      _.remove(currentEventList, (obj) => {
        return obj.id === id
      });

      let eventsList: TEvents = [];

      // write
      eventsList = [...currentEventList]
      
      fs.writeFileSync('./eventsList.txt', JSON.stringify(eventsList))

      res.status(200).json({
        code: 200,
        message: "Events deleted",
      })
  } catch (e) { 
    console.log(e);
    res.status(200).json({
      code: 200,
      message: "Something error",
    })
  }
}
