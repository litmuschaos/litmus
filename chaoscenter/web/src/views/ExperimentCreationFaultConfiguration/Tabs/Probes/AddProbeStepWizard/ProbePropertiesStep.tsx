// TODO: Unused, to be removed
import React from 'react';
import * as Yup from 'yup';
import { FontVariation, Color } from '@harnessio/design-system';
import { Layout, FormInput, ButtonVariation, Text, Container, Button } from '@harnessio/uicore';
import { Form, Formik } from 'formik';
import { omit } from 'lodash-es';
import { useStrings } from '@strings';
import { ProbeType } from '@api/entities';
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
          : formData.type == ProbeType.HTTP
          ? '1000ms'
          : '5s',
        interval: formData.runProperties?.interval ?? '2s',
        probePollingInterval: formData.runProperties?.probePollingInterval ?? '2s',
        initialDelay: formData.runProperties?.initialDelay ?? '3s',
        stopOnFailure: formData.runProperties?.stopOnFailure ?? false,
        evaluationTimeout: formData.runProperties?.evaluationTimeout ?? '600ms'
      }}
      onSubmit={data => {
        props.setFormData({
          ...formData,
          runProperties: omit(data, ['evaluationTimeout'])
        });
        props.nextStep?.({ name: name || '' });
      }}
      validationSchema={Yup.object().shape({
        probeTimeout: getValidation('Timeout'),
        interval: getValidation('Interval'),
        probePollingInterval: getValidation('Polling Interval'),
        initialDelay: getValidation('Initial Delay'),
        evaluationTimeout: getValidation('Evaluation Timeout')
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
                {
                  <Container padding={{ top: 'large', left: 'xsmall', right: 'large', bottom: 'xsmall' }}>
                    <FormInput.Text
                      inputGroup={{ type: 'number' }}
                      name="probeTimeout"
                      label={formData.type == 'httpProbe' ? getString('probeTimeoutMs') : getString('probeTimeoutSec')}
                      placeholder={String(formData.runProperties?.probeTimeout)}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_timeout' }}
                    />
                    <FormInput.Text
                      inputGroup={{ type: 'number' }}
                      name="interval"
                      label={getString('intervalSec')}
                      placeholder={String(formData.runProperties?.interval)}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_interval' }}
                    />
                    <FormInput.Text
                      inputGroup={{ type: 'number' }}
                      name="probePollingInterval"
                      label={getString('pollingIntervalSec')}
                      placeholder={String(formData.runProperties?.probePollingInterval)}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_polling_interval' }}
                    />
                    <FormInput.Text
                      inputGroup={{ type: 'number' }}
                      name="initialDelay"
                      label={getString('initialDelaySec')}
                      placeholder={String(formData.runProperties?.initialDelay)}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_initial_delay' }}
                    />
                    <FormInput.CheckBox
                      name="stopOnFailure"
                      label={getString('stopOnFailure')}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_stop_failure' }}
                    />
                  </Container>
                }
              </Layout.Vertical>
              <Layout.Horizontal spacing="medium">
                {currentStep !== 1 && (
                  <Button
                    disabled={currentStep === 1}
                    onClick={() => props.previousStep?.({ name: props.name || '' })}
                    variation={ButtonVariation.SECONDARY}
                    icon="main-chevron-left"
                    iconProps={{ color: Color.WHITE }}
                    text={getString('previous')}
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
