import moment from "moment";

export default function generateDays(startDate: number, endDate: number): number[] {
  let daysList: number[] = []
  if (startDate && endDate) {
    const a = moment(startDate, "YYYYMMDDHHss")
    const b = moment(endDate, "YYYYMMDDHHss")

    // check if startDate more than endDate
    if (startDate > endDate) {
      return []
    }

    const hourDiff = b.diff(a, 'hours')
    const dayDiff = b.diff(a, 'days')
    daysList.push(startDate);
    if (dayDiff > 0) {
      // if time is different
      if (a.format("HHss") !== b.format("HHss")) {
        return []
      }

      let lastDate = startDate
      for (let i = 0; i < dayDiff; i++) {
        const addDay = moment(lastDate, "YYYYMMDDHHss").add(1, "d")
        lastDate = parseInt(addDay.format("YYYYMMDDHHss"))
        daysList.push(lastDate)
      }
    } else if (hourDiff > 0) {
      daysList.push(endDate);
    }
  }
  return daysList;
}