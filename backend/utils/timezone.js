const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const toUTC = (dateTime, timezone) => {
  return dayjs.tz(dateTime, timezone).utc().toDate();
};

const fromUTC = (utcDate, timezone) => {
  return dayjs.utc(utcDate).tz(timezone);
};

const formatDate = (date, timezone, format = 'MMM D, YYYY') => {
  return fromUTC(date, timezone).format(format);
};

const formatTime = (date, timezone, format = 'h:mm A') => {
  return fromUTC(date, timezone).format(format);
};

const formatDateTime = (date, timezone) => {
  const dt = fromUTC(date, timezone);
  return {
    date: dt.format('MMM D, YYYY'),
    time: dt.format('h:mm A'),
    full: dt.format('MMM D, YYYY [at] h:mm A')
  };
};
const getCurrentTimeInTimezone = (timezone) => {
  return dayjs().tz(timezone);
};

const isValidTimezone = (timezone) => {
  try {
    dayjs().tz(timezone);
    return true;
  } catch (e) {
    return false;
  }
};

module.exports = {
  toUTC,
  fromUTC,
  formatDate,
  formatTime,
  formatDateTime,
  getCurrentTimeInTimezone,
  isValidTimezone
};

