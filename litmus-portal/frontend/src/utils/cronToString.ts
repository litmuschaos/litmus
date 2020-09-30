function convertCronToString(cronExpression: string) {
  let cronToString = 'Runs at ';
  if (cronExpression === '') {
    cronToString = 'Scheduling now';
    return cronToString;
  }
  const cron = cronExpression.split(' ');
  let minutes = cron[0];
  let hours = cron[1];
  const dayOfMonth = cron[2];
  // var month = cron[3];
  let dayOfWeek = cron[4];

  // Formatting time if composed of zeros
  if (minutes === '0') minutes = '00';
  if (hours === '0') hours = '00';
  // If it's not past noon add a zero before the hour to make it look like "04h00" instead of "4h00"
  else if (hours.length === 1 && hours !== '*') {
    hours = `0${hours}`;
  }
  // Our activities do not allow launching pipelines every minute. It won't be processed.
  if (minutes === '*') {
    cronToString = `Unreadable cron format. Cron will be displayed in its raw form: ${cronExpression}`;
  }

  cronToString = `${cronToString + hours}h${minutes} `;

  //   if (dayOfWeek === '0,6') dayOfWeek = 'on weekends';
  //   else if (dayOfWeek === '1-5') dayOfWeek = 'on weekdays';
  if (dayOfWeek.length) {
    if (dayOfWeek === '*' && dayOfMonth === '*') dayOfWeek = 'every day ';
    else if (dayOfWeek === '*' && dayOfMonth !== '*') {
      cronToString = `${cronToString}on the ${dayOfMonth}`;
      if (dayOfMonth === '1' || dayOfMonth === '21' || dayOfMonth === '31') {
        cronToString += 'st ';
      } else if (dayOfMonth === '2' || dayOfMonth === '22') {
        cronToString += 'nd ';
      } else if (dayOfMonth === '3' || dayOfMonth === '23') {
        cronToString += 'rd ';
      } else {
        cronToString += 'th ';
      }
      cronToString += 'day of every month';
      return cronToString;
    } else if (dayOfWeek !== '*' && dayOfMonth === '*') {
      switch (dayOfWeek) {
        case 'Sun':
          dayOfWeek = 'on Sundays';
          break;
        case 'Mon':
          dayOfWeek = 'on Mondays';
          break;
        case 'Tue':
          dayOfWeek = 'on Tuesdays';
          break;
        case 'Wed':
          dayOfWeek = 'on Wednesdays';
          break;
        case 'Thu':
          dayOfWeek = 'on Thursdays';
          break;
        case 'Fri':
          dayOfWeek = 'on Fridays';
          break;
        case 'Sat':
          dayOfWeek = 'on Saturdays';
          break;
        default:
          cronToString = `Unreadable cron format. Cron will be displayed in its raw form: ${cronExpression}`;
          return cronToString;
      }
    }
    cronToString = `${cronToString + dayOfWeek} `;
  }

  return cronToString;
}
export default convertCronToString;
