import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' }
];

export const formatDate = (date, timezone, format = 'MMMM D, YYYY') => {
  return dayjs(date).tz(timezone).format(format);
};

export const formatTime = (date, timezone, format = 'h:mm A') => {
  return dayjs(date).tz(timezone).format(format);
};

export const formatDateTime = (date, timezone) => {
  const dt = dayjs(date).tz(timezone);
  return {
    date: dt.format('MMM D, YYYY'),
    time: dt.format('h:mm A'),
    full: dt.format('MMM D, YYYY [at] h:mm A')
  };
};

export const toUTC = (dateTime, timezone) => {
  return dayjs.tz(dateTime, timezone).utc().toISOString();
};

export const getTimezoneLabel = (value) => {
  const tz = timezones.find(t => t.value === value);
  return tz ? tz.label : value;
};

