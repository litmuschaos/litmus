import React from 'react';
import { useStrings } from '@strings';
import Toothpick from '@components/Toothpick';
import { zeroFiftyNineDDOptions } from '@utils';
import ExpressionBreakdown, { ActiveInputs } from '../ExpressionBreakdown/ExpressionBreakdown';
import Expression from '../Expression/Expression';
import Spacer from '../Spacer/Spacer';
import { cronSensicalHoursOptions, getUpdatedExpression, getSlashValue } from '../utils';
import css from './HourlyTab.module.scss';

interface HourlyTabInterface {
  formikProps: any;
}

export default function HourlyTab(props: HourlyTabInterface): JSX.Element {
  const {
    formikProps: {
      values: { hours, minutes, expression, selectedScheduleTab },
      values
    },
    formikProps
  } = props;
  const { getString } = useStrings();

  return (
    <div className={css.hourlyTab}>
      <Toothpick
        label={getString('runEvery')}
        startValue={hours}
        endValue={minutes}
        startOptions={cronSensicalHoursOptions}
        handleStartValueChange={val =>
          formikProps.setValues({
            ...values,
            hours: val.value,
            expression: getUpdatedExpression({
              expression,
              value: getSlashValue({ selectedScheduleTab, id: 'hours', value: val.value as string }),
              id: 'hours'
            })
          })
        }
        endOptions={zeroFiftyNineDDOptions}
        handleEndValueChange={val =>
          formikProps.setValues({
            ...values,
            minutes: val.value,
            expression: getUpdatedExpression({ expression, value: val.value as string, id: 'minutes' })
          })
        }
        adjoiningText={getString('hoursAnd')}
        endingText={getString('minutesAfterTheHour')}
      />
      <Spacer paddingTop={'var(--spacing-large)'} />
      <ExpressionBreakdown formikValues={values} activeInputs={[ActiveInputs.MINUTES, ActiveInputs.HOURS]} />
      <Spacer />
      <Expression formikProps={formikProps} />
    </div>
  );
}
