import React from 'react';
import { Formik, Form, FormikProps } from 'formik';
import { Container, Layout, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import type { FaultData, FaultTunables } from '@models';
import SearchEmptyState from '@images/SearchEmptyState.png';
import { useStrings } from '@strings';
import InputSlider from '@components/InputSlider';
import { useSearchParams, useUpdateSearchParams } from '@hooks';
import experimentYamlService from '@services/experiment';
import {
  getFaultTunableFromTuneExperimentFormValues,
  getInitialValueFromFaultTunable,
  getYupValidationFromFaultTunable
} from '@utils';
import { InfrastructureType } from '@api/entities';
import { getTypeBasedFaultEnvInput } from './getTypeBasedFaultEnvInput';
import type { TuneExperimentForm } from './types';

interface FaultTunablesTabProps {
  formRef: React.MutableRefObject<FormikProps<TuneExperimentForm> | undefined>;
  faultData: FaultData | undefined;
  setFaultData: React.Dispatch<React.SetStateAction<FaultData | undefined>>;
  initialFaultTunables: FaultTunables | undefined;
  setFaultWeight: React.Dispatch<React.SetStateAction<number>>;
}

export default function FaultTunablesTab({
  formRef,
  faultData,
  setFaultData,
  initialFaultTunables,
  setFaultWeight
}: FaultTunablesTabProps): React.ReactElement {
  const { getString } = useStrings();
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();
  const hasUnsavedChangesInURL = searchParams.get('unsavedChanges') === 'true';
  const experimentHandler = experimentYamlService.getInfrastructureTypeHandler(InfrastructureType.KUBERNETES);

  const setUnsavedChanges = (): void => {
    if (!hasUnsavedChangesInURL) updateSearchParams({ unsavedChanges: 'true' });
  };

  const [collapsed, setCollapsed] = React.useState(false);
  const faultTunableLength = Object.keys(initialFaultTunables ?? {}).length;

  return (
    <Container
      height={'100%'}
      background={Color.PRIMARY_BG}
      padding={{ left: 'xxlarge', right: 'xxlarge', top: 'xlarge', bottom: 'xlarge' }}
      style={{ overflowY: 'scroll' }}
    >
      <Layout.Vertical spacing={'large'} margin={{ bottom: 'large' }}>
        {initialFaultTunables && faultTunableLength !== 0 ? (
          <Formik<TuneExperimentForm>
            innerRef={formRef as React.Ref<FormikProps<TuneExperimentForm>>}
            initialValues={getInitialValueFromFaultTunable(initialFaultTunables)}
            validationSchema={getYupValidationFromFaultTunable(initialFaultTunables)}
            onSubmit={values => {
              const updatedFaultData = experimentHandler?.updateFaultTunablesInFaultData(
                faultData,
                getFaultTunableFromTuneExperimentFormValues(values)
              );
              setFaultData(updatedFaultData);
            }}
          >
            {formikProps => {
              return (
                <>
                  <Form
                    style={{
                      height: collapsed ? faultTunableLength * 66 - 7 : Math.min(6, faultTunableLength) * 66 - 7,
                      transition: 'height 0.25s ease-in',
                      overflow: 'hidden'
                    }}
                  >
                    <Layout.Vertical flex={{ distribution: 'space-between', alignItems: 'flex-start' }} height="100%">
                      <Layout.Vertical spacing="medium" width={'50%'}>
                        <Container padding={'xsmall'}>
                          {Object.entries(initialFaultTunables).map(([envName, faultTunable]) => {
                            return getTypeBasedFaultEnvInput({
                              envName,
                              faultTunable,
                              getString,
                              formikProps,
                              setUnsavedChanges
                            });
                          })}
                        </Container>
                      </Layout.Vertical>
                    </Layout.Vertical>
                  </Form>
                  {faultTunableLength > 6 && (
                    <Text
                      margin={{ top: 'medium', left: 'small', bottom: 'medium' }}
                      onClick={() => setCollapsed(!collapsed)}
                      icon={collapsed ? 'double-chevron-up' : 'double-chevron-down'}
                      iconProps={{ color: Color.PRIMARY_7, size: 16 }}
                      color={Color.PRIMARY_7}
                      style={{ cursor: 'pointer' }}
                      font={{ weight: 'semi-bold' }}
                    >
                      {!collapsed ? getString('viewAllDefaultProperties') : getString('viewLessDefaultProperties')}
                    </Text>
                  )}
                </>
              );
            }}
          </Formik>
        ) : (
          <Layout.Vertical
            flex={{ alignItems: 'center', justifyContent: 'center' }}
            width={'100%'}
            height={'fit-content'}
            spacing="small"
          >
            <img src={SearchEmptyState} alt="searchEmptyState" />
            <Text font={{ variation: FontVariation.H5, weight: 'semi-bold' }} color={Color.GREY_600}>
              {`${getString('noTunables')} :`}
            </Text>
          </Layout.Vertical>
        )}
      </Layout.Vertical>
      <Layout.Vertical
        padding={{ top: 'xxlarge' }}
        border={{ top: true, style: `1px solid ${Color.GREY_200}` }}
        spacing={'large'}
      >
        <Container width={'95%'}>
          {faultData && (
            <InputSlider
              key={faultData.faultName}
              name={faultData.faultName}
              initialValue={faultData.weight ?? 10}
              onChange={weight => setFaultWeight(weight)}
            />
          )}
        </Container>
      </Layout.Vertical>
    </Container>
  );
}
