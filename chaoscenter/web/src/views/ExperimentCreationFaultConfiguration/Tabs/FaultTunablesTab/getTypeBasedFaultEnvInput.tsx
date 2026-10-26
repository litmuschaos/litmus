import React from 'react';
import { Container, FormInput, Select, Text } from '@harnessio/uicore';
import { FontVariation } from '@harnessio/design-system';
import type { FormikProps } from 'formik';
import { startCase } from 'lodash-es';
import { FaultTunableInputType, FaultTunable } from '@models';
import type { UseStringsReturn } from '@strings';
import type { TuneExperimentForm } from './types';

export interface GetTypeBasedFaultEnvInput {
  envName: string;
  faultTunable: FaultTunable;
  getString: UseStringsReturn['getString'];
  formikProps: FormikProps<TuneExperimentForm>;
  setUnsavedChanges: () => void;
}

export function getTypeBasedFaultEnvInput({
  envName,
  faultTunable,
  getString,
  formikProps,
  setUnsavedChanges
}: GetTypeBasedFaultEnvInput): React.ReactElement {
  switch (faultTunable.type) {
    case FaultTunableInputType.Text:
      return (
        <FormInput.Text
          key={envName}
          name={envName}
          onChange={(event: any) => {
            formikProps.setFieldValue(envName, event.target.value);
            setUnsavedChanges();
          }}
          label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{startCase(envName)}</Text>}
          placeholder={getString('valuePlaceholder')}
        />
      );
    case FaultTunableInputType.Number:
      return (
        <FormInput.Text
          key={envName}
          name={envName}
          onChange={(event: any) => {
            formikProps.setFieldValue(envName, parseInt(event.target.value));
            setUnsavedChanges();
          }}
          inputGroup={{
            type: 'number',
            min: 0
          }}
          label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{startCase(envName)}</Text>}
          placeholder={getString('valuePlaceholder')}
        />
      );
    case FaultTunableInputType.Boolean:
      return (
        <Container margin={{ bottom: 'small' }}>
          <Container margin={{ bottom: 'xsmall' }}>
            <Text font={{ variation: FontVariation.FORM_LABEL }}>{startCase(envName)}</Text>
          </Container>
          <Select
            key={envName}
            name={envName}
            value={{ label: String(formikProps.values[envName]), value: String(formikProps.values[envName]) }}
            items={[
              { label: 'true', value: 'true' },
              { label: 'false', value: 'false' }
            ]}
            onChange={event => {
              formikProps.setFieldValue(envName, event.value === 'true');
              setUnsavedChanges();
            }}
          />
        </Container>
      );
    case FaultTunableInputType.SecretKeyRef:
      return <></>;
    case FaultTunableInputType.ConfigMapKeyRef:
      return <></>;
  }
}
