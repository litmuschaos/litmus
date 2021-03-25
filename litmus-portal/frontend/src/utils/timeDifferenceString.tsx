import { TFunction } from 'i18next';
import moment from 'moment';

const GetTimeDiff = (startTime: number, endTime: number, t: TFunction) => {
  const days = moment.unix(startTime).diff(moment.unix(endTime), 'days');
  const hours = moment.unix(startTime).diff(moment.unix(endTime), 'hours') % 24;
  const minutes =
    moment.unix(startTime).diff(moment.unix(endTime), 'minutes') % 60;

  let timeDiffString: string = '';
  if (days > 0) {
    timeDiffString = timeDiffString.concat(
      days === 1
        ? `${days} ${t('analyticsDashboard.timeText.day')} `
        : `${days} ${t('analyticsDashboard.timeText.days')} `
    );
  }
  if (hours > 0) {
    timeDiffString = timeDiffString.concat(
      hours === 1
        ? `${hours} ${t('analyticsDashboard.timeText.hour')} `
        : `${hours} ${t('analyticsDashboard.timeText.hours')} `
    );
  }
  if (minutes > 0) {
    timeDiffString = timeDiffString.concat(
      minutes === 1
        ? `${minutes} ${t('analyticsDashboard.timeText.minute')} `
        : `${minutes} ${t('analyticsDashboard.timeText.minutes')} `
    );
  }
  if (timeDiffString === '') {
    timeDiffString = timeDiffString.concat(
      ` ${t('analyticsDashboard.timeText.few')}  ${t(
        'analyticsDashboard.timeText.seconds'
      )}`
    );
  }
  return timeDiffString;
};
export { GetTimeDiff };
