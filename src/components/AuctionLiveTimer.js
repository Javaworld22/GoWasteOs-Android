const AuctionLiveTimer = expiredDate => {
  let dateString = expiredDate,
    dateTimeParts = dateString.split(" "),
    timeParts = dateTimeParts[1].split(":"),
    dateParts = dateTimeParts[0].split("-"),
    date;

  date = new Date(
    dateParts[0],
    parseInt(dateParts[1], 10) - 1,
    dateParts[2],
    timeParts[0],
    timeParts[1],
    timeParts[2]
  );

  let countDownDate = date.getTime();
  let now = new Date().getTime();
  let distance = countDownDate - now;
  // Time calculations for days, hours, minutes and seconds
  let days = Math.floor(distance / (1000 * 60 * 60 * 24));
  let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((distance % (1000 * 60)) / 1000);

  let timeString = "";
  if (days != 0) {
    timeString = timeString + days + "d ";
  }
  if (hours != 0) {
    timeString = timeString + hours + "h ";
  }
  if (minutes != 0) {
    timeString = timeString + minutes + "m ";
  }
  if (seconds != 0) {
    timeString = timeString + seconds + "s ";
  }

  if (distance < 0) {
    timeString = "EXPIRED";
  }

  return timeString;
};

export default AuctionLiveTimer;
