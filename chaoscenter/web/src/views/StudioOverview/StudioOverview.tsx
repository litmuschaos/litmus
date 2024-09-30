import React from 'react';
import {
  Button,
  ButtonVariation,
  Container,
  FlexExpander,
  Layout,
  Text,
  VisualYamlSelectedView
} from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import * as Yup from 'yup';
import { Formik, Form, FormikProps, ErrorMessage, FormikErrors } from 'formik';
import cx from 'classnames';
import { useParams } from 'react-router-dom';
import { isEqual } from 'lodash-es';
import type { ExperimentMetadata } from '@db';
import { useStrings } from '@strings';
import FormErrorListener from '@components/FormErrorListener';
import { useUpdateSearchParams } from '@hooks';
import NameDescriptionTags from '@components/NameIdDescriptionTags';
import { ChaosInfrastructureReferenceFieldProps, StudioErrorState, StudioTabs } from '@models';
import experimentYamlService from 'services/experiment';
import KubernetesChaosInfrastructureReferenceFieldController from '@controllers/KubernetesChaosInfrastructureReferenceField';
import { InfrastructureType } from '@api/entities';
import { getImageRegistry } from '@api/core/ImageRegistry'; 
import { getScope } from '@utils'; 
import css from './StudioOverview.module.scss';

interface StudioOverviewViewProps {
  formRef: React.MutableRefObject<FormikProps<ExperimentMetadata> | undefined>;
  openDiscardDialog: () => void;
  setError: React.Dispatch<React.SetStateAction<StudioErrorState>>;
  disabledExperimentTypeSwitching: boolean;
  setViewFilter: (view: VisualYamlSelectedView) => void;
}

function getChaosInfrastructureReferenceField(
  referenceFieldControllerProps: ChaosInfrastructureReferenceFieldProps
): React.ReactElement {
  return <KubernetesChaosInfrastructureReferenceFieldController {...referenceFieldControllerProps} />;
}

export default function StudioOverviewView({
  formRef,
  openDiscardDialog,
  setError
}: StudioOverviewViewProps): React.ReactElement {
  const { getString } = useStrings();
  const updateSearchParams = useUpdateSearchParams();
  // const searchParams = useSearchParams();
  const { experimentKey } = useParams<{ experimentKey: string }>();
  const experimentHandler = experimentYamlService.getInfrastructureTypeHandler(InfrastructureType.KUBERNETES);

  const [currentExperiment, setCurrentExperiment] = React.useState<ExperimentMetadata | undefined>();

  const scope = getScope();

   // Fetch the image registry data using Apollo's useQuery hook
   const { data: getImageRegistryData, loading: imageRegistryLoading } = getImageRegistry({
    projectID: scope.projectID,
  });

  const imageRegistry = getImageRegistryData?.getImageRegistry?{
      name: getImageRegistryData.getImageRegistry.imageRegistryInfo.imageRegistryName,
      repo: getImageRegistryData.getImageRegistry.imageRegistryInfo.imageRepoName,
      secret: getImageRegistryData.getImageRegistry.imageRegistryInfo.secretName,
  }
  : undefined;

  React.useEffect(() => {
    experimentHandler?.getExperiment(experimentKey).then(experiment => {
      delete experiment?.manifest;
      setCurrentExperiment(experiment as ExperimentMetadata);
    });
  }, [experimentHandler, experimentKey]);

  return (
    <Container padding="large" background={Color.PRIMARY_BG} className={css.mainContainer}>
      <Formik<ExperimentMetadata>
        initialValues={{
          name: currentExperiment?.name ?? '',
          description: currentExperiment?.description ?? '',
          tags: currentExperiment?.tags ?? [],
          chaosInfrastructure: {
            id: currentExperiment?.chaosInfrastructure?.id ?? '',
            namespace: currentExperiment?.chaosInfrastructure?.namespace,
            environmentID: currentExperiment?.chaosInfrastructure?.environmentID
          }
        }}
        validationSchema={Yup.object().shape({
          name: Yup.string()
            .trim()
            .matches(/^[a-z0-9-]*$/, 'Experiment Name can only contain lowercase letters, numbers and dashes')
            .matches(/^[^-].*$/, 'Experiment Name can not start with -')
            .matches(/^.*[^-]$/, 'Experiment Name can not end with -')
            .max(50, 'Experiment Name can have a max length of 50 characters')
            .required('Experiment Name is required!'),
          chaosInfrastructure: Yup.object().shape({
            id: Yup.string().trim().required('Please select a Chaos infrastructure!')
          })
        })}
        onSubmit={values => {

          values.imageRegistry = imageRegistry

          if (values.chaosInfrastructure.namespace === undefined) {
            delete values.chaosInfrastructure.namespace;
          }
          if (!isEqual(values, currentExperiment)) {
            values.unsavedChanges = true;
            experimentHandler?.updateExperimentDetails(experimentKey, values).then(() => {
              updateSearchParams({
                tab: StudioTabs.BUILDER,
                unsavedChanges: 'true',
                experimentName: values.name,
                infrastructureType: InfrastructureType.KUBERNETES
              });
            });
          } else {
            updateSearchParams({ tab: StudioTabs.BUILDER, infrastructureType: InfrastructureType.KUBERNETES });
          }
        }}
        enableReinitialize={true}
        validateOnMount
        innerRef={formRef as React.Ref<FormikProps<ExperimentMetadata>>}
      >
        {formikProps => {
          return (
            <>
              <FormErrorListener<ExperimentMetadata>
                onError={(errors: FormikErrors<ExperimentMetadata>) =>
                  setError(prevErrors => ({
                    ...prevErrors,
                    OVERVIEW: Object.values(errors).length > 0 ? true : false
                  }))
                }
              />
              <Layout.Vertical width={'60%'} height={'100%'}>
                <Form className={cx(css.formContainer, css.gap4)}>
                  <Layout.Vertical width={'100%'} className={css.gap4}>
                    <Layout.Vertical className={css.gap2}>
                      <Text font={{ variation: FontVariation.H6 }}>{getString('experimentOverview')}</Text>
                      <Container background={Color.WHITE} width="100%" padding="medium">
                        <NameDescriptionTags className={css.nameDescriptionField} formikProps={formikProps} />
                      </Container>
                      <Layout.Vertical background={Color.WHITE} padding="medium" spacing="large">
                        {getChaosInfrastructureReferenceField({
                          initialInfrastructureID: formikProps.values.chaosInfrastructure.id,
                          initialEnvironmentID: formikProps.values.chaosInfrastructure.environmentID,
                          setFieldValue: formikProps.setFieldValue
                        })}
                        <ErrorMessage name="chaosInfrastructure.id">
                          {err => <div className={css.errorMessage}>{err}</div>}
                        </ErrorMessage>
                      </Layout.Vertical>
                    </Layout.Vertical>
                  </Layout.Vertical>
                  <FlexExpander />
                  <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing={'medium'}>
                    <Button
                      variation={ButtonVariation.SECONDARY}
                      text={getString('cancel')}
                      onClick={openDiscardDialog}
                    />
                    <Button
                      type="submit" 
                      intent="primary" 
                      text={getString('next')} 
                      rightIcon="chevron-right" 
                      disabled={imageRegistryLoading}
                    />
                  </Layout.Horizontal>
                </Form>
              </Layout.Vertical>
            </>
          );
        }}
      </Formik>
    </Container>
  );
}
