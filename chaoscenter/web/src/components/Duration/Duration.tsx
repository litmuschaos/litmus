import React, { useEffect, useState } from 'react';
import { Text, TextProps, timeToDisplayText } from '@harnessio/uicore';
import { isNil } from 'lodash-es';
import { useStrings } from '@strings';

export interface DurationProps extends Omit<TextProps, 'icon'> {
  startTime?: number;
  /**
   * if endTime is nullable, endTime is Date.now() and the duration is re-calculated by an interval
   */
  endTime?: number;
  /**
   * optional text to override the default `Duration: ` prefix: ;
   */
  durationText?: React.ReactNode;
  /**
   * If true, will show time with ms
   */
  showMilliSeconds?: boolean;
  /**
   * If true, will show 0s instead of ms when duration is less than 1s
   */
  showZeroSecondsResult?: boolean;
  icon?: TextProps['icon'] | null;
}

export default function Duration(props: DurationProps): React.ReactElement {
  const { startTime, endTime, durationText, icon, showMilliSeconds, showZeroSecondsResult, ...textProps } = props;
  const [_endTime, setEndTime] = useState(endTime || Date.now());
  const { getString } = useStrings();

  useEffect(() => {
    if (endTime) {
      setEndTime(endTime);
    }

    const timeoutId =
      (!endTime &&
        window.setInterval(() => {
          setEndTime(Date.now());
        }, 1000)) ||
      0;

    return () => {
      window.clearInterval(timeoutId);
    };
  }, [endTime]);

  let delta = startTime ? Math.abs(startTime - _endTime) : 0;
  const showZeroSecondsResultLessThan1ms = !!showZeroSecondsResult && delta < 1000;

  if ((!showMilliSeconds && delta >= 1000) || showZeroSecondsResultLessThan1ms) {
    delta = Math.round(delta / 1000) * 1000;
  }

  const text = showZeroSecondsResultLessThan1ms ? timeToDisplayText(delta) || '0s' : timeToDisplayText(delta);

  return (
    <Text inline icon={isNil(icon) ? undefined : icon || 'hourglass'} {...textProps}>
      {durationText ?? getString('duration')}
      {text}
    </Text>
  );
}
