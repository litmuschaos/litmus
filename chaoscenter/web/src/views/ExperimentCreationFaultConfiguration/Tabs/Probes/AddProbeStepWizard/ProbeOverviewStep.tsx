import React from 'react';
import * as Yup from 'yup';
import { FontVariation, Color } from '@harnessio/design-system';
import { Layout, FormInput, ButtonVariation, Text, Container, Button, SelectOption } from '@harnessio/uicore';
import { Form, Formik } from 'formik';
import { useParams } from 'react-router-dom';
import { useStrings } from '@strings';
import experimentYamlService from 'services/experiment';
import { InfrastructureType } from '@api/entities';
import { useSearchParams } from '@hooks';
import type { StepData, StepProps } from './AddProbeStepWizard';

export const ProbeOverviewStep: React.FC<StepProps<StepData>> = props => {
  const { getString } = useStrings();
  const { experimentKey } = useParams<{ experimentKey: string }>();

  const searchParams = useSearchParams();
  const infrastructureType =
    (searchParams.get('infrastructureType') as InfrastructureType | undefined) ?? InfrastructureType.KUBERNETES;
  const experimentHandler = experimentYamlService.getInfrastructureTypeHandler(infrastructureType);

  const totalSteps = props.totalSteps?.();
  const currentStep = props.currentStep?.();
  const { formData, name, faultData } = props;

  const probeList: SelectOption[] = [
    { label: getString('probeTypes.httpProbe'), value: 'httpProbe' },
    { label: getString('probeTypes.k8sProbe'), value: 'k8sProbe' },
    { label: getString('probeTypes.promProbe'), value: 'promProbe' },
    { label: getString('probeTypes.cmdProbe'), value: 'cmdProbe' }
  ];

  Yup.addMethod(Yup.string, 'probeNameExists', function (errorMessage) {
    return this.test(`test-probe-name-duplicate`, errorMessage, async function (value) {
      const { path, createError } = this;

      return (await experimentHandler?.doesProbeNameExist(experimentKey, faultData?.faultName, value))
        ? createError({ path, message: errorMessage })
        : true;
    });
  });

  return (
    <Formik
      initialValues={{
        name: formData.name ?? '',
        type: formData.type ?? 'httpProbe',
        mode: formData.mode ?? 'Continuous'
      }}
      onSubmit={data => {
        props.setFormData({ ...formData, name: data.name, type: data.type, mode: data.mode });
        props.nextStep?.({ name: name || '' });
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string()
          .trim()
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .probeNameExists(getString('alreadyExists', { value: getString('probeName') }))
          .required(getString('isRequired', { field: 'Probe Name' })),
        type: Yup.string()
          .oneOf(['httpProbe', 'k8sProbe', 'promProbe', 'cmdProbe'], getString('invalidSelection'))
          .required('Required'),
        mode: Yup.string().oneOf(['SOT', 'EOT', 'Edge', 'Continuous', 'OnChaos'], getString('invalidSelection'))
      })}
    >
      {() => {
        return (
          <Form style={{ height: '100%' }}>
            <Layout.Vertical flex={{ distribution: 'space-between', alignItems: 'flex-start' }} height="100%">
              <Layout.Vertical spacing="medium" width={320}>
                <Text font={{ variation: FontVariation.H3 }} color={Color.GREY_800}>
                  {getString('probeOverview')}
                </Text>
                <Container padding={{ top: 'large', left: 'xsmall', right: 'large', bottom: 'xsmall' }}>
                  <FormInput.Text
                    name="name"
                    label={getString('probeName')}
                    placeholder={formData.name}
                    tooltipProps={{ dataTooltipId: 'chaos_probe_name' }}
                  />
                  <FormInput.Select
                    name="type"
                    label={getString('probeType')}
                    placeholder={formData.type}
                    tooltipProps={{ dataTooltipId: 'chaos_probe_type' }}
                    items={probeList}
                  />

                  <FormInput.Select
                    name="mode"
                    label={getString('probeMode')}
                    placeholder={formData.mode}
                    tooltipProps={{ dataTooltipId: 'chaos_probe_mode' }}
                    items={[
                      { label: getString('probeModes.SOT'), value: 'SOT' },
                      { label: getString('probeModes.EOT'), value: 'EOT' },
                      { label: getString('probeModes.Edge'), value: 'Edge' },
                      { label: getString('probeModes.Continuous'), value: 'Continuous' },
                      { label: getString('probeModes.OnChaos'), value: 'OnChaos' }
                    ]}
                  />
                </Container>
              </Layout.Vertical>
              <Layout.Horizontal spacing="medium">
                {currentStep !== 1 && (
                  <Button
                    disabled={currentStep === 1}
                    onClick={() => props.previousStep?.({ name: name || '' })}
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
