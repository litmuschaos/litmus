import React from 'react';
import type { SelectOption } from '@harnessio/uicore';
import { useStrings } from '@strings';
import TimeSelect from '@components/TimeSelect';
import ExpressionBreakdown, { ActiveInputs } from '../ExpressionBreakdown/ExpressionBreakdown';
import Expression from '../Expression/Expression';
import Spacer from '../Spacer/Spacer';
import { getUpdatedExpression, getMilitaryHours } from '../utils';
import css from './DailyTab.module.scss';

interface DailyTabInterface {
  formikProps: any;
  hideSeconds: boolean;
}

export default function DailyTab(props: DailyTabInterface): JSX.Element {
  const {
    formikProps: {
      values: { minutes, hours, amPm, expression },
      values
    },
    formikProps,
    hideSeconds
  } = props;
  const { getString } = useStrings();

  return (
    <div className={css.dailyTab}>
      <TimeSelect
        label={getString('runDailyAt')}
        handleMinutesSelect={(option: SelectOption) =>
          formikProps.setValues({
            ...values,
            minutes: option.value,
            expression: getUpdatedExpression({ expression, value: option.value as string, id: 'minutes' })
          })
        }
        handleAmPmSelect={(option: SelectOption) => {
          const newHours = getMilitaryHours({ hours: values.hours, amPm: option.value as string });
          formikProps.setValues({
            ...values,
            amPm: option.value,
            expression: getUpdatedExpression({ expression, value: newHours, id: 'hours' })
          });
        }}
        handleHoursSelect={(option: SelectOption) =>
          formikProps.setValues({
            ...values,
            hours: option.value,
            expression: getUpdatedExpression({
              expression,
              value: getMilitaryHours({ hours: option.value as string, amPm }),
              id: 'hours'
            })
          })
        }
        hideSeconds={hideSeconds}
        hoursValue={hours}
        minutesValue={minutes}
        amPmValue={amPm}
      />
      <Spacer paddingTop={'var(--spacing-large)'} />
      <ExpressionBreakdown formikValues={values} activeInputs={[ActiveInputs.MINUTES, ActiveInputs.HOURS]} />
      <Spacer />
      <Expression formikProps={formikProps} />
    </div>
  );
}
