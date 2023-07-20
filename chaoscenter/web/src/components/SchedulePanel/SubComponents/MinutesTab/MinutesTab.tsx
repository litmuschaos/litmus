import React from 'react';
import { FormInput, Text, Layout } from '@harnessio/uicore';
import { Color } from '@harnessio/design-system';
import { useStrings } from '@strings';
import ExpressionBreakdown, { ActiveInputs } from '../ExpressionBreakdown/ExpressionBreakdown';
import Expression from '../Expression/Expression';
import Spacer from '../Spacer/Spacer';
import { cronSensicalMinutesOptions, getUpdatedExpression, getSlashValue } from '../utils';
import css from './MinutesTab.module.scss';

interface MinutesTabInterface {
  formikProps: any;
}

export default function MinutesTab(props: MinutesTabInterface): JSX.Element {
  const {
    formikProps: {
      values: { expression, selectedScheduleTab },
      values
    },
    formikProps
  } = props;
  const { getString } = useStrings();

  return (
    <div className={css.minutesTab}>
      <Text className={css.label}>{getString('runEvery')}</Text>
      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
        <FormInput.Select
          name="minutes"
          items={cronSensicalMinutesOptions}
          placeholder="Select"
          onChange={option => {
            formikProps.setValues({
              ...values,
              minutes: option.value,
              expression: getUpdatedExpression({
                expression,
                value: getSlashValue({ selectedScheduleTab, id: 'minutes', value: option.value as string }),
                id: 'minutes'
              })
            });
          }}
        />
        <Text style={{ marginBottom: 'var(--spacing-medium)' }} color={Color.GREY_800}>
          {getString('minutesParentheses')}
        </Text>
      </Layout.Horizontal>
      <Spacer paddingTop="var(--spacing-xsmall)" />
      <ExpressionBreakdown formikValues={values} activeInputs={[ActiveInputs.MINUTES]} />
      <Spacer />
      <Expression formikProps={formikProps} />
    </div>
  );
}
