import moment from 'moment';

export function getFormattedTime(startTime: number): string {
  return startTime ? `${moment(startTime).format('D/MM/YYYY, HH:mm:ss')}` : '-';
}

export function getBriefDuration(startTime: number, endTime: number): string {
  if ((isNaN(startTime) && isNaN(endTime)) || !startTime || !endTime) {
    return '--';
  }
  if (startTime && isNaN(endTime)) {
    return 'Running';
  }
  const convertStartTime = new Date(startTime);
  const convertEndTime = new Date(endTime);
  const dateDuration = moment.duration(convertEndTime.getTime() - convertStartTime.getTime());
  return `${dateDuration.days() !== 0 ? `${dateDuration.days()}d ` : ''}${
    dateDuration.hours() !== 0 ? `${dateDuration.hours()}h ` : ''
  }${dateDuration.minutes() !== 0 ? `${dateDuration.minutes()}m ` : ''}${
    dateDuration.seconds() !== 0 ? `${dateDuration.seconds()}s` : ''
  }`;
}

export function getDetailedTime(time: number): string {
  return moment(time).format('D MMM YYYY, HH:mm');
}

export function getTimeDiff(startTime: number, endTime?: number): string {
  if (isNaN(startTime) || !endTime) {
    return '-';
  }

  return `${getDetailedTime(startTime)} - ${getDetailedTime(endTime)}`;
}

function timeDifference(current: number, previous: number): string {
  const milliSecondsPerMinute = 60 * 1000;
  const milliSecondsPerHour = milliSecondsPerMinute * 60;
  const milliSecondsPerDay = milliSecondsPerHour * 24;
  const milliSecondsPerMonth = milliSecondsPerDay * 30;
  const milliSecondsPerYear = milliSecondsPerDay * 365;

  if (!current || !previous) {
    return '-';
  }

  const elapsed = current - previous;
  if (elapsed < milliSecondsPerMinute / 3) {
    return 'Just now';
  }

  if (elapsed < milliSecondsPerMinute) {
    return 'less than 1 min ago';
  }
  if (elapsed < milliSecondsPerHour) {
    return `${Math.round(elapsed / milliSecondsPerMinute)} mins ago`;
  }
  if (elapsed < milliSecondsPerDay) {
    return `${Math.round(elapsed / milliSecondsPerHour)} hours ago`;
  }
  if (elapsed < milliSecondsPerMonth) {
    return `${Math.round(elapsed / milliSecondsPerDay)} days ago`;
  }
  if (elapsed < milliSecondsPerYear) {
    return `${Math.round(elapsed / milliSecondsPerMonth)} months ago`;
  }
  return `${Math.round(elapsed / milliSecondsPerYear)} years ago`;
}

export const timeDifferenceForDate = (date: number): string => {
  if (!date) {
    return '-';
  }
  const now = new Date().getTime();
  const updated = date;
  return timeDifference(now, updated);
};

export function getDurationBetweenTwoDates(startTime: number | undefined, endTime: number | undefined): string {
  if ((startTime === undefined || isNaN(startTime)) && (endTime === undefined || isNaN(endTime))) return '-';
  if (startTime && (endTime === undefined || isNaN(endTime))) {
    return `${moment(startTime).format('D MMM YYYY')}, ${moment(startTime).format('HH:mm')} - --`;
  }
  if (moment(startTime).format('D MMM') === moment(endTime).format('D MMM'))
    return `${moment(startTime).format('D MMM YYYY')}, ${moment(startTime).format('HH:mm')} - ${moment(endTime).format(
      'HH:mm'
    )}`;
  return moment(startTime).format('D MMM YYYY') + ' - ' + moment(endTime).format('D MMM YYYY');
}

export function handleTimestampAmbiguity(timestamp: string): string {
  if (timestamp?.length === 10) return String(parseInt(timestamp) * 1000);
  else return timestamp;
}

// DD = Double Digits Label
export const zeroFiftyNineDDOptions = Array.from({ length: 60 }, (_, i) => ({
  label: i.toString().padStart(2, '0'),
  value: `${i}`
}));

export const oneFiftyNineDDOptions = zeroFiftyNineDDOptions.slice(1);

export const oneTwelveDDOptions = Array.from({ length: 12 }, (_, i) => ({
  label: (i + 1).toString().padStart(2, '0'),
  value: `${i + 1}`
}));

export const amPmOptions = [
  { label: 'AM', value: 'AM' },
  { label: 'PM', value: 'PM' }
];
