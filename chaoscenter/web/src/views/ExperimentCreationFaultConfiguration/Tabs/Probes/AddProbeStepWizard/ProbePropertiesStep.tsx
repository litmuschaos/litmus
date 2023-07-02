import React from 'react';
import * as Yup from 'yup';
import { FontVariation, Color } from '@harness/design-system';
import { Layout, FormInput, ButtonVariation, Text, Container, Button } from '@harness/uicore';
import { Form, Formik } from 'formik';
import { useStrings } from '@strings';
import type { StepData, StepProps } from './AddProbeStepWizard';

export const ProbePropertiesStep: React.FC<StepProps<StepData>> = props => {
  const { getString } = useStrings();
  const totalSteps = props.totalSteps?.();
  const currentStep = props.currentStep?.();
  const { formData, name } = props;

  const getValidation = (field: string): any => {
    return Yup.number()
      .typeError(getString('useIntegerValue'))
      .positive(getString('mustBePositive', { field: field }))
      .integer(getString('mustBeInteger', { field: field }))
      .required(getString('isRequired', { field: field }));
  };

  return (
    <Formik
      initialValues={{
        probeTimeout: formData.runProperties?.probeTimeout
          ? formData.runProperties?.probeTimeout
          : formData.type == 'httpProbe'
          ? 1000
          : 5,
        interval: formData.runProperties?.interval ?? 2,
        retry: formData.runProperties?.retry ?? 1,
        probePollingInterval: formData.runProperties?.probePollingInterval ?? 2,
        initialDelaySeconds: formData.runProperties?.initialDelaySeconds ?? 3,
        stopOnFailure: formData.runProperties?.stopOnFailure ?? false
      }}
      onSubmit={data => {
        props.setFormData({ ...formData, runProperties: data });
        props.nextStep?.({ name: name || '' });
      }}
      validationSchema={Yup.object().shape({
        probeTimeout: getValidation('Timeout'),
        retry: getValidation('Retry'),
        interval: getValidation('Interval'),
        probePollingInterval: getValidation('Polling Interval'),
        initialDelaySeconds: getValidation('Initial Delay')
      })}
    >
      {() => {
        return (
          <Form style={{ height: '100%' }}>
            <Layout.Vertical flex={{ distribution: 'space-between', alignItems: 'flex-start' }} height="100%">
              <Layout.Vertical spacing="medium" width={320}>
                <Text font={{ variation: FontVariation.H3 }} color={Color.GREY_800}>
                  {getString('probeProperties')}
                </Text>
                <Container padding={{ top: 'large', left: 'xsmall', right: 'large', bottom: 'xsmall' }}>
                  <FormInput.Text
                    inputGroup={{ type: 'number' }}
                    name="probeTimeout"
                    label={formData.type == 'httpProbe' ? 'Probe Timeout (ms)' : 'Probe Timeout (sec)'}
                    placeholder={String(formData.runProperties?.probeTimeout)}
                    tooltipProps={{ dataTooltipId: 'chaos_probe_timeout' }}
                  />
                  <FormInput.Text
                    inputGroup={{ type: 'number' }}
                    name="retry"
                    label="Retry (times)"
                    placeholder={String(formData.runProperties?.retry)}
                    tooltipProps={{ dataTooltipId: 'chaos_probe_retry' }}
                  />
                  <FormInput.Text
                    inputGroup={{ type: 'number' }}
                    name="interval"
                    label="Interval (sec)"
                    placeholder={String(formData.runProperties?.interval)}
                    tooltipProps={{ dataTooltipId: 'chaos_probe_interval' }}
                  />
                  <FormInput.Text
                    inputGroup={{ type: 'number' }}
                    name="probePollingInterval"
                    label="Polling Interval (sec)"
                    placeholder={String(formData.runProperties?.probePollingInterval)}
                    tooltipProps={{ dataTooltipId: 'chaos_probe_polling_interval' }}
                  />
                  <FormInput.Text
                    inputGroup={{ type: 'number' }}
                    name="initialDelaySeconds"
                    label="Initial Delay (sec)"
                    placeholder={String(formData.runProperties?.initialDelaySeconds)}
                    tooltipProps={{ dataTooltipId: 'chaos_probe_initial_delay' }}
                  />
                  <FormInput.CheckBox
                    name="stopOnFailure"
                    label="Stop on Failure"
                    tooltipProps={{ dataTooltipId: 'chaos_probe_stop_failure' }}
                  />
                </Container>
              </Layout.Vertical>
              <Layout.Horizontal spacing="medium">
                {currentStep !== 1 && (
                  <Button
                    disabled={currentStep === 1}
                    onClick={() => props.previousStep?.({ name: props.name || '' })}
                    variation={ButtonVariation.SECONDARY}
                    icon="main-chevron-left"
                    iconProps={{ color: Color.WHITE }}
                    text="Previous"
                  />
                )}
                <Button
                  intent="primary"
                  style={{ float: 'right' }}
                  type="submit"
                  rightIcon="main-chevron-right"
                  iconProps={{ color: Color.WHITE }}
                  text={currentStep === totalSteps ? getString('setupProbe') : getString('continue')}
                />
              </Layout.Horizontal>
            </Layout.Vertical>
          </Form>
        );
      }}
    </Formik>
  );
};
