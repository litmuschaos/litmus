import React, { useEffect } from 'react';
import { FormInput } from '@harnessio/uicore';
import { useStrings } from '@strings';
import { getBreakdownValues } from '../utils';
import ExpressionBreakdown, { ActiveInputs } from '../ExpressionBreakdown/ExpressionBreakdown';
import Expression from '../Expression/Expression';
import Spacer from '../Spacer/Spacer';

interface CustomTabInterface {
  formikProps: any;
  hideSeconds: boolean;
}

export default function CustomTab(props: CustomTabInterface): JSX.Element {
  const {
    formikProps: { values },
    formikProps
  } = props;
  const { getString } = useStrings();

  useEffect(() => {
    formikProps.validateForm();
  }, []);

  return (
    <>
      <FormInput.Text
        label={getString('enterCustomCron')}
        name="expression"
        style={{ margin: 0 }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (e?.target?.value) {
            const breakdownValues = getBreakdownValues(e.target.value);
            formikProps.setValues({ ...values, expression: e.target.value, breakdownValues });
          }
        }}
      />
      <Spacer paddingTop="var(--spacing-large)" paddingBottom="var(--spacing-large)" />
      <ExpressionBreakdown
        formikValues={values}
        activeInputs={[
          ActiveInputs.MINUTES,
          ActiveInputs.HOURS,
          ActiveInputs.DAY_OF_MONTH,
          ActiveInputs.MONTH,
          ActiveInputs.DAY_OF_WEEK
        ]}
      />
      <Spacer paddingTop="var(--spacing-large)" />
      <Expression formikProps={formikProps} />
    </>
  );
}
