const DateFormatter = date => {
  // console.log(
  //   date,
  //   "date ", parseInt(date.split(" ")[0].split("-")[2]),
  //   "month ", parseInt(date.split(" ")[0].split("-")[1])
  // );
  let monthArray = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec"
  ];
  let day = parseInt(date.split(" ")[0].split("-")[2]);
  let month = parseInt(date.split(" ")[0].split("-")[1]);
  let year = parseInt(date.split(" ")[0].split("-")[0]);
  let hour = parseInt(date.split(" ")[1].split(":")[0]);
  let minute = date.split(" ")[1].split(":")[1];
  month = monthArray[month - 1];
  return {
    day,
    month,
    year,
    hour: hour < 12 ? hour : hour - 12,
    minute,
    amOrPm: hour < 12 ? " AM" : " PM"
  };
};

export default DateFormatter;
