import React from 'react';
import {
  Button,
  ButtonVariation,
  FlexExpander,
  FormInput,
  Layout,
  StepWizard,
  Container,
  Text,
  Switch,
  SelectOption
} from '@harnessio/uicore';
import { Form, Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import type { GotoStepArgs } from '@harnessio/uicore/dist/components/StepWizard/StepWizard';
import type { ApolloError, LazyQueryResult, MutationFunction, QueryLazyOptions } from '@apollo/client';
import { Color, FontVariation } from '@harnessio/design-system';
import { noop, omit } from 'lodash-es';
import { Divider } from '@blueprintjs/core';
import { parse } from 'yaml';
import { Icon } from '@harnessio/icons';
import { cleanApolloResponse, getIcon, getScope } from '@utils';
import { useStrings } from '@strings';
import NameDescriptionTags from '@components/NameIdDescriptionTags';
import type {
  AddProbeRequest,
  AddProbeResponse,
  UpdateProbeRequest,
  UpdateProbeResponse,
  ValidateUniqueProbeRequest,
  ValidateUniqueProbeResponse
} from '@api/core';
import { ProbeType, Probe, InfrastructureType } from '@api/entities';
import type { CmdProbeInputs, HTTPProbeInputs, K8sProbeInputs, PromProbeInputs, RunProperty } from '@models';
import Loader from '@components/Loader';
import YAMLBuilder from '@components/YAMLBuilder';
import css from './AddProbeModalWizard.module.scss';

enum HTTPMethod {
  GET = 'get',
  POST = 'post'
}

interface AddProbeModalWizardViewProps {
  mutation: {
    addKubernetesHTTPProbeMutation?: MutationFunction<AddProbeResponse, AddProbeRequest>;
    addKubernetesCMDProbeMutation?: MutationFunction<AddProbeResponse, AddProbeRequest>;
    addPROMProbeMutation?: MutationFunction<AddProbeResponse, AddProbeRequest>;
    addK8SProbeMutation?: MutationFunction<AddProbeResponse, AddProbeRequest>;
    updateProbeMutation?: MutationFunction<UpdateProbeResponse, UpdateProbeRequest>;
  };
  infrastructureType: InfrastructureType | undefined;
  validateName: (
    options?: QueryLazyOptions<ValidateUniqueProbeRequest> | undefined
  ) => Promise<LazyQueryResult<ValidateUniqueProbeResponse, ValidateUniqueProbeRequest>>;
  probeData?: Probe;
  loading: boolean;
  error: ApolloError | undefined;
  isEdit?: boolean;
  hideDarkModal?: () => void;
}

type TypeWithMethodDropdown<T> = T & {
  methodDropdown?: HTTPMethod;
};

interface AddProbeFormData {
  name: string;
  description?: string;
  tags: string[];
  type: ProbeType | null;
  infrastructureType: InfrastructureType | undefined;
  kubernetesHTTPProperties: TypeWithMethodDropdown<Probe['kubernetesHTTPProperties']> | undefined;
  kubernetesCMDProperties: Probe['kubernetesCMDProperties'] | undefined;
  promProperties: Probe['promProperties'] | undefined;
  k8sProperties: Probe['k8sProperties'] | undefined;
}

interface StepData {
  value?: AddProbeFormData;
}

interface StepProps<PrevStepData> {
  name?: string | JSX.Element;
  // These props will be passed by wizard
  subTitle?: string | JSX.Element;
  prevStepData?: PrevStepData;
  formData: AddProbeFormData;
  setFormData: React.Dispatch<React.SetStateAction<AddProbeFormData>>;
  currentStep?: () => number;
  totalSteps?: () => number;
  nextStep?: (data?: PrevStepData) => void;
  previousStep?: (data?: PrevStepData) => void;
  gotoStep?: (args: GotoStepArgs<PrevStepData>) => boolean;
  firstStep?: (data?: PrevStepData) => void;
  lastStep?: (data?: PrevStepData) => void;
}

export let initialValues: AddProbeFormData = {
  name: '',
  description: '',
  tags: [],
  type: null,
  infrastructureType: undefined,
  kubernetesHTTPProperties: undefined,
  kubernetesCMDProperties: undefined,
  promProperties: undefined,
  k8sProperties: undefined
};

const OverviewStep: React.FC<
  StepProps<StepData> & Pick<AddProbeModalWizardViewProps, 'hideDarkModal' | 'validateName' | 'isEdit'>
> = props => {
  const { getString } = useStrings();
  const scope = getScope();
  const { hideDarkModal, validateName, isEdit } = props;

  // Checks for the type of probe from `ProbeType` and sets the data
  const handleClick = (formikProps: FormikProps<AddProbeFormData>): void => {
    // Stores the current form data
    initialValues = {
      ...props.formData,
      name: formikProps.values.name,
      description: formikProps.values.description,
      tags: formikProps.values.tags
    };

    props.setFormData(initialValues);

    if (formikProps.values.name && !isEdit) {
      validateName({
        variables: {
          projectID: scope.projectID,
          probeName: formikProps.values.name
        }
      }).then(result => {
        if (result.data?.validateUniqueProbe === false) {
          formikProps.setFieldError(
            'name',
            `The name ${formikProps.values.name} is not unique and was already used before, please provide a unique name`
          );
        } else {
          props.nextStep?.();
        }
      });
    } else {
      // Validates the data and only if it is valid, goes through
      formikProps.validateForm().then(errors => {
        if (Object.keys(errors).length === 0) {
          props.nextStep?.();
        }
      });
    }
  };

  return (
    <Layout.Vertical height={'100%'} width={400}>
      <Formik<AddProbeFormData>
        initialValues={initialValues}
        onSubmit={noop}
        validationSchema={Yup.object().shape({
          name: Yup.string().trim().required(getString(`probeValidation.name`))
        })}
      >
        {formikProps => {
          return (
            <Form style={{ height: '100%' }}>
              <Layout.Vertical height={'100%'}>
                <Text font={{ variation: FontVariation.H3 }} color={Color.GREY_800} margin={{ bottom: 'large' }}>
                  {getString('overview')}
                </Text>

                <NameDescriptionTags
                  disabledFields={{
                    name: isEdit ? true : false
                  }}
                  formikProps={formikProps}
                />

                <FlexExpander />
              </Layout.Vertical>
              <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing={'medium'}>
                <Button
                  onClick={() => hideDarkModal && hideDarkModal()}
                  variation={ButtonVariation.SECONDARY}
                  text={getString('cancel')}
                />
                <Button
                  type="submit"
                  onClick={() => {
                    handleClick(formikProps);
                  }}
                  rightIcon="chevron-right"
                  variation={ButtonVariation.PRIMARY}
                  text={getString(`configureProperties`)}
                />
              </Layout.Horizontal>
            </Form>
          );
        }}
      </Formik>
    </Layout.Vertical>
  );
};

const TunePropertiesStep: React.FC<StepProps<StepData>> = props => {
  const currentStep = props.currentStep?.();
  const { getString } = useStrings();

  /**
   * API structure for v1alpha1,
   * required to have `httpProperties`, `cmdProperties`, `promProperties` , `k8sProperties` and `sloProperties`
   * @returns {string} the specific property key for the respective probe type
   */
  const getType = (): string | undefined => {
    if (props.formData.infrastructureType === InfrastructureType.KUBERNETES) {
      switch (props.formData.type) {
        case ProbeType.HTTP:
          return 'kubernetesHTTPProperties';
        case ProbeType.CMD:
          return 'kubernetesCMDProperties';
        case ProbeType.PROM:
          return 'promProperties';
        case ProbeType.K8S:
          return 'k8sProperties';
      }
    }
  };

  // Checks for the type of probe from `ProbeType` and sets the data
  const handleClick = (formikProps: FormikProps<AddProbeFormData>): void => {
    if (props.formData.infrastructureType === InfrastructureType.KUBERNETES) {
      switch (props.formData.type) {
        case ProbeType.HTTP: {
          initialValues = {
            ...props.formData,
            kubernetesHTTPProperties: {
              ...props.formData.kubernetesHTTPProperties,
              ...(formikProps.values.kubernetesHTTPProperties as RunProperty)
            } as Probe['kubernetesHTTPProperties']
          };

          props.setFormData(initialValues);
          break;
        }
        case ProbeType.CMD: {
          initialValues = {
            ...props.formData,
            kubernetesCMDProperties: {
              ...props.formData.kubernetesCMDProperties,
              ...(formikProps.values.kubernetesCMDProperties as RunProperty)
            } as Probe['kubernetesCMDProperties']
          };

          props.setFormData(initialValues);
          break;
        }
        case ProbeType.PROM: {
          initialValues = {
            ...props.formData,
            promProperties: {
              ...props.formData.promProperties,
              ...(formikProps.values.promProperties as RunProperty)
            } as Probe['promProperties']
          };

          props.setFormData(initialValues);
          break;
        }
        case ProbeType.K8S: {
          initialValues = {
            ...props.formData,
            k8sProperties: {
              ...props.formData.k8sProperties,
              ...(formikProps.values.k8sProperties as RunProperty)
            } as Probe['k8sProperties']
          };

          props.setFormData(initialValues);
          break;
        }
      }
    }

    // Validates the data and only if it is valid, goes through
    formikProps.validateForm().then(errors => {
      if (Object.keys(errors).length === 0) {
        props.nextStep?.();
      }
    });
  };

  /**
   * Creates a nested structure for the properties to validate against Yup and types of Chaos Engine
   * @returns {Yup} the yup object which validates the properties according to the nested structure
   */
  const validateProperties = () => {
    const unitsRegex = /^(\d+)(ns|us|ms|s|m|h)$/;
    /**
     * Objects shared between the 5 probe keys `httpProperties`, `cmdProperties`, `promProperties`,
     * `k8sProperties` and `sloProperties`
     * Required for Yup validation
     */
    const sharedValidation = {
      probeTimeout: Yup.string()
        .matches(unitsRegex, 'Probe timeout should contain values in ns, us, ms, m, s or h only')
        .required(getString(`probeValidation.timeout`)),
      interval: Yup.string()
        .matches(unitsRegex, 'Probe interval should contain values in ns, us, ms, m, s or h only')
        .required(getString(`probeValidation.interval`)),
      probePollingInterval: Yup.string()
        .matches(unitsRegex, 'Probe polling interval should contain values in ns, us, ms, m, s or h only')
        .nullable(),
      initialDelay: Yup.string()
        .matches(unitsRegex, 'Probe evaluation timeout should contain values in ns, us, ms, m, s or h only')
        .nullable(),
      evaluationTimeout: Yup.string()
        .matches(unitsRegex, 'Probe evaluation timeout should contain values in ns, us, ms, m, s or h only')
        .nullable()
    };

    if (props.formData.infrastructureType === InfrastructureType.KUBERNETES) {
      switch (props.formData.type) {
        case ProbeType.HTTP:
          return Yup.object().shape({
            kubernetesHTTPProperties: Yup.object().shape(sharedValidation)
          });
        case ProbeType.CMD:
          return Yup.object().shape({
            kubernetesCMDProperties: Yup.object().shape(sharedValidation)
          });
        case ProbeType.PROM:
          return Yup.object().shape({
            promProperties: Yup.object().shape(sharedValidation)
          });
        case ProbeType.K8S:
          return Yup.object().shape({
            k8sProperties: Yup.object().shape(sharedValidation)
          });
      }
    }
  };

  return (
    <Layout.Vertical height={'100%'} width={400}>
      <Formik<AddProbeFormData>
        initialValues={initialValues}
        onSubmit={() => {
          validateProperties();
          props.nextStep?.();
        }}
        validationSchema={validateProperties()}
      >
        {formikProps => {
          return (
            <Form style={{ height: '100%' }}>
              <Layout.Vertical height={516} style={{ overflow: 'auto' }}>
                <Text font={{ variation: FontVariation.H3 }} color={Color.GREY_800} margin={{ bottom: 'large' }}>
                  {getString(`properties`)}
                </Text>

                <FormInput.Text
                  name={`${getType()}.probeTimeout`}
                  inputGroup={{ type: 'string' }}
                  label={getString(`timeout`)}
                />
                <FormInput.Text
                  name={`${getType()}.interval`}
                  inputGroup={{ type: 'string' }}
                  label={getString(`interval`)}
                />
                <FormInput.Text
                  name={`${getType()}.retry`}
                  inputGroup={{ type: 'number' }}
                  label={getString(`retry`)}
                />
                <FormInput.Text
                  name={`${getType()}.attempt`}
                  inputGroup={{ type: 'number' }}
                  label={getString(`attempt`)}
                />
                <FormInput.Text
                  name={`${getType()}.probePollingInterval`}
                  inputGroup={{ type: 'string' }}
                  label={getString(`pollingInterval`)}
                />
                <FormInput.Text
                  name={`${getType()}.initialDelay`}
                  inputGroup={{ type: 'string' }}
                  label={`${getString(`initialDelay`)} ${getString(`optional`)}`}
                />
                <FormInput.Text
                  name={`${getType()}.evaluationTimeout`}
                  inputGroup={{ type: 'string' }}
                  label={getString(`evaluationTimeout`)}
                />
                <FormInput.Toggle
                  name={`${getType()}.stopOnFailure`}
                  label={`${getString(`stopOnFailure`)} ${getString(`optional`)}`}
                  tooltipProps={{ dataTooltipId: 'stopOnFailure' }}
                />

                <FlexExpander />
              </Layout.Vertical>
              <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing={'medium'}>
                <Button
                  disabled={currentStep === 1}
                  onClick={() => props.previousStep?.()}
                  icon="chevron-left"
                  variation={ButtonVariation.SECONDARY}
                  text={getString('back')}
                />
                <Button
                  type="submit"
                  onClick={() => {
                    handleClick(formikProps);
                  }}
                  rightIcon="chevron-right"
                  variation={ButtonVariation.PRIMARY}
                  text={getString(`configureDetails`)}
                />
              </Layout.Horizontal>
            </Form>
          );
        }}
      </Formik>
    </Layout.Vertical>
  );
};

const TuneDetailsStep: React.FC<
  StepProps<StepData> &
    Pick<AddProbeModalWizardViewProps, 'error' | 'loading' | 'mutation' | 'isEdit' | 'hideDarkModal'>
> = props => {
  const scope = getScope();
  const { getString } = useStrings();
  // TODO: Add monaco editor for source probe in CMD
  const cmdComparatorType = React.useRef<string>('int');
  const promComparatorType = React.useRef<string>('int');
  const source = React.useRef<string>(props.formData.kubernetesCMDProperties?.source ?? '');
  const [isSourceSelected, setIsSourceSelected] = React.useState<boolean>(
    props.formData.kubernetesCMDProperties?.source ? true : false
  );
  const { error, loading, mutation, isEdit, hideDarkModal } = props;

  const preventDefault = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Checks for the type of probe from `ProbeType` and sets the data as well as calls the respective mutation
  const handleClick = (formikProps: FormikProps<AddProbeFormData>): void => {
    if (props.formData.infrastructureType === InfrastructureType.KUBERNETES) {
      switch (props.formData.type) {
        case ProbeType.HTTP: {
          initialValues = {
            ...props.formData,
            kubernetesHTTPProperties: {
              methodDropdown: '',
              ...props.formData.kubernetesHTTPProperties,
              ...(formikProps.values.kubernetesHTTPProperties as HTTPProbeInputs)
            } as Probe['kubernetesHTTPProperties']
          };

          props.setFormData(initialValues);

          formikProps.validateForm().then(errors => {
            if (Object.keys(errors).length === 0) {
              // Shared request payload
              const request: AddProbeRequest['request'] = {
                name: props.formData.name,
                description: props.formData.description,
                tags: props.formData.tags,
                type: props.formData.type as ProbeType,
                infrastructureType: InfrastructureType.KUBERNETES,
                kubernetesHTTPProperties: omit(initialValues.kubernetesHTTPProperties, [
                  'methodDropdown',
                  `method.${
                    initialValues.kubernetesHTTPProperties?.methodDropdown === HTTPMethod.GET
                      ? HTTPMethod.POST
                      : HTTPMethod.GET
                  }`
                ]) as Probe['kubernetesHTTPProperties']
              };

              // Request Payload for Add
              const addProbePayload: AddProbeRequest = {
                projectID: scope.projectID,
                request: request
              };

              // Request Payload for Update
              const updateProbePayload: UpdateProbeRequest = {
                projectID: scope.projectID,
                request: {
                  ...request
                }
              };

              if (isEdit && mutation.updateProbeMutation) {
                /**
                 * Calls the `updateProbe` mutation from `/api` to
                 * update HTTP probe properties, if successful also close the modal
                 */
                mutation.updateProbeMutation({
                  variables: updateProbePayload,
                  onCompleted: () => !error && hideDarkModal && hideDarkModal()
                });
              } else if (mutation.addKubernetesHTTPProbeMutation) {
                /**
                 * Calls the `addHTTPProbe` mutation from `/api` to
                 * save HTTP probe properties, if successful also close the modal
                 */
                mutation.addKubernetesHTTPProbeMutation({
                  variables: addProbePayload,
                  onCompleted: () => !error && hideDarkModal && hideDarkModal()
                });
              }
            }
          });

          break;
        }
        case ProbeType.CMD: {
          initialValues = {
            ...props.formData,
            kubernetesCMDProperties: {
              ...props.formData.kubernetesCMDProperties,
              source: source.current !== '' ? JSON.stringify(parse(source.current)) : undefined,
              ...(formikProps.values.kubernetesCMDProperties as CmdProbeInputs)
            } as Probe['kubernetesCMDProperties']
          };

          props.setFormData(initialValues);

          formikProps.validateForm().then(errors => {
            if (Object.keys(errors).length === 0) {
              // Shared request payload
              const request: AddProbeRequest['request'] = {
                name: props.formData.name,
                description: props.formData.description,
                tags: props.formData.tags,
                type: props.formData.type as ProbeType,
                infrastructureType: InfrastructureType.KUBERNETES,
                kubernetesCMDProperties: initialValues.kubernetesCMDProperties
              };

              // Request Payload for Add
              const addProbePayload: AddProbeRequest = {
                projectID: scope.projectID,
                request: request
              };

              // Request Payload for Update
              const updateProbePayload: UpdateProbeRequest = {
                projectID: scope.projectID,
                request: {
                  ...request
                }
              };

              if (isEdit && mutation.updateProbeMutation) {
                /**
                 * Calls the `updateProbe` mutation from `/api` to
                 * update CMD probe properties, if successful also close the modal
                 */
                mutation.updateProbeMutation({
                  variables: updateProbePayload,
                  onCompleted: () => !error && hideDarkModal && hideDarkModal()
                });
              } else if (mutation.addKubernetesCMDProbeMutation) {
                /**
                 * Calls the `addCMDProbe` mutation from `/api` to
                 * save CMD probe properties, if successful also close the modal
                 */
                mutation.addKubernetesCMDProbeMutation({
                  variables: addProbePayload,
                  onCompleted: () => !error && hideDarkModal && hideDarkModal()
                });
              }
            }
          });

          break;
        }
        case ProbeType.PROM: {
          initialValues = {
            ...props.formData,
            promProperties: {
              ...props.formData.promProperties,
              ...(formikProps.values.promProperties as PromProbeInputs)
            } as Probe['promProperties']
          };

          props.setFormData(initialValues);
          formikProps.validateForm().then(errors => {
            if (Object.keys(errors).length === 0) {
              // Shared request payload
              const request: AddProbeRequest['request'] = {
                name: props.formData.name,
                description: props.formData.description,
                tags: props.formData.tags,
                type: props.formData.type as ProbeType,
                infrastructureType: InfrastructureType.KUBERNETES,
                promProperties: initialValues.promProperties
              };
              // Request Payload for Add
              const addProbePayload: AddProbeRequest = {
                projectID: scope.projectID,
                request: request
              };

              // Request Payload for Update
              const updateProbePayload: UpdateProbeRequest = {
                projectID: scope.projectID,
                request: {
                  ...request
                }
              };

              if (isEdit && mutation.updateProbeMutation) {
                /**
                 * Calls the `updateProbe` mutation from `/api` to
                 * update PROM probe properties, if successful also close the modal
                 */
                mutation.updateProbeMutation({
                  variables: updateProbePayload,
                  onCompleted: () => !error && hideDarkModal && hideDarkModal()
                });
              } else if (mutation.addPROMProbeMutation) {
                /**
                 * Calls the `addPROMProbe` mutation from `/api` to
                 * save PROM probe properties, if successful also close the modal
                 */
                mutation.addPROMProbeMutation({
                  variables: addProbePayload,
                  onCompleted: () => !error && hideDarkModal && hideDarkModal()
                });
              }
            }
          });

          break;
        }
        case ProbeType.K8S: {
          initialValues = {
            ...props.formData,
            k8sProperties: {
              ...props.formData.k8sProperties,
              ...(formikProps.values.k8sProperties as K8sProbeInputs)
            } as Probe['k8sProperties']
          };

          props.setFormData(initialValues);
          formikProps.validateForm().then(errors => {
            if (Object.keys(errors).length === 0) {
              // Shared request payload
              const request: AddProbeRequest['request'] = {
                name: props.formData.name,
                description: props.formData.description,
                tags: props.formData.tags,
                type: props.formData.type as ProbeType,
                infrastructureType: InfrastructureType.KUBERNETES,
                k8sProperties: initialValues.k8sProperties
              };

              // Request Payload for Add
              const addProbePayload: AddProbeRequest = {
                projectID: scope.projectID,
                request: request
              };

              // Request Payload for Update
              const updateProbePayload: UpdateProbeRequest = {
                projectID: scope.projectID,
                request: {
                  ...request
                }
              };

              if (isEdit && mutation.updateProbeMutation) {
                /**
                 * Calls the `updateProbe` mutation from `/api` to
                 * update K8S probe properties, if successful also close the modal
                 */
                mutation.updateProbeMutation({
                  variables: updateProbePayload,
                  onCompleted: () => !error && hideDarkModal && hideDarkModal()
                });
              } else if (mutation.addK8SProbeMutation) {
                /**
                 * Calls the `addK8SProbe` mutation from `/api` to
                 * save K8S probe properties, if successful also close the modal
                 */
                mutation.addK8SProbeMutation({
                  variables: addProbePayload,
                  onCompleted: () => !error && hideDarkModal && hideDarkModal()
                });
              }
            }
          });

          break;
        }
      }
    }
  };

  /**
   * Creates a nested structure for the properties to validate against Yup and types of Chaos Engine
   * @returns {Yup} the yup object which validates the properties according to the nested structure
   */
  const validateDetails = () => {
    if (props.formData.infrastructureType === InfrastructureType.KUBERNETES) {
      switch (props.formData.type) {
        case ProbeType.HTTP:
          return Yup.object().shape({
            kubernetesHTTPProperties: Yup.object().shape({
              url: Yup.string().trim().required(getString(`probeValidation.url`)),
              methodDropdown: Yup.string().required().oneOf([HTTPMethod.GET, HTTPMethod.POST]),
              method: Yup.object().when('methodDropdown', {
                is: (_method: HTTPMethod) => _method === HTTPMethod.GET,
                then: Yup.object().shape({
                  get: Yup.object().shape({
                    criteria: Yup.string().required(getString(`probeValidation.getCriteria`)),
                    responseCode: Yup.number().required(getString(`probeValidation.getResponseCode`))
                  })
                }),
                otherwise: Yup.object().shape({
                  post: Yup.object().shape({
                    criteria: Yup.string().required(getString(`probeValidation.postCriteria`)),
                    responseCode: Yup.number().required(getString(`probeValidation.postResponseCode`))
                  })
                })
              })
            })
          });
        case ProbeType.CMD:
          return Yup.object().shape({
            kubernetesCMDProperties: Yup.object().shape({
              command: Yup.string().required(getString(`probeValidation.command`)),
              comparator: Yup.object().shape({
                type: Yup.string().required(getString(`probeValidation.type`)),
                value: Yup.string().required(getString(`probeValidation.value`)),
                criteria: Yup.string().required(getString(`probeValidation.criteria`))
              })
            })
          });
        case ProbeType.PROM:
          return Yup.object().shape({
            promProperties: Yup.object().shape({
              endpoint: Yup.string().trim().required(getString(`probeValidation.endpoint`)),
              comparator: Yup.object().shape({
                type: Yup.string().required(getString(`probeValidation.type`)),
                value: Yup.string().required(getString(`probeValidation.value`)),
                criteria: Yup.string().required(getString(`probeValidation.criteria`))
              })
            })
          });
        case ProbeType.K8S:
          return Yup.object().shape({
            k8sProperties: Yup.object().shape({
              version: Yup.string().trim().required(getString(`probeValidation.version`)),
              resource: Yup.string().trim().required(getString(`probeValidation.resource`)),
              operation: Yup.string().trim().required(getString(`probeValidation.operation`))
            })
          });
      }
    }
  };

  /**
   * Function to retrieve HTTP details
   * @returns HTTP details for HTTP probes
   */ const httpRenderer = (formikProps: FormikProps<AddProbeFormData>): React.ReactElement => {
    return (
      <>
        {props.formData.infrastructureType === InfrastructureType.KUBERNETES ? (
          <>
            {/* Probe details for Kubernetes HTTP probe */}
            <FormInput.Text name="kubernetesHTTPProperties.url" label={'URL'} placeholder={'http://localhost:8080'} />
            <FormInput.Toggle name="kubernetesHTTPProperties.insecureSkipVerify" label={'Insecure Skip Verify'} />
            <FormInput.Select
              name={'kubernetesHTTPProperties.methodDropdown'}
              value={
                formikProps.values.kubernetesHTTPProperties?.methodDropdown
                  ? ({
                      label: formikProps.values.kubernetesHTTPProperties.methodDropdown.toUpperCase(),
                      value: formikProps.values.kubernetesHTTPProperties.methodDropdown
                    } as SelectOption)
                  : undefined
              }
              label={getString('method')}
              placeholder={getString('selectMethod')}
              items={[
                { label: 'GET', value: 'get' },
                { label: 'POST', value: 'post' }
              ]}
            />
            {formikProps.values.kubernetesHTTPProperties?.methodDropdown === HTTPMethod.GET ? (
              <>
                <FormInput.Select
                  name="kubernetesHTTPProperties.method.get.criteria"
                  label={getString('criteria')}
                  placeholder={getString('criteriaForData')}
                  items={[
                    { label: '==', value: '==' },
                    { label: '!=', value: '!=' },
                    { label: 'oneOf', value: 'oneOf' }
                  ]}
                />
                <FormInput.Text
                  name="kubernetesHTTPProperties.method.get.responseCode"
                  label={'Response Code'}
                  placeholder={'200'}
                />
              </>
            ) : formikProps.values.kubernetesHTTPProperties?.methodDropdown === HTTPMethod.POST ? (
              <>
                <FormInput.Text
                  name="kubernetesHTTPProperties.method.post.contentType"
                  label={'Content Type'}
                  placeholder={'Content type for HTTP body data'}
                />
                <FormInput.Text
                  name="kubernetesHTTPProperties.method.post.body"
                  label={'Body'}
                  placeholder={'HTTP body for POST request'}
                />
                <FormInput.Text
                  name="kubernetesHTTPProperties.method.post.bodyPath"
                  label={'Body Path'}
                  placeholder={'Contains filePath, which contains HTTP body'}
                />
                <FormInput.Select
                  name="kubernetesHTTPProperties.method.post.criteria"
                  label={getString('criteria')}
                  placeholder={getString('criteriaForData')}
                  items={[
                    { label: '==', value: '==' },
                    { label: '!=', value: '!=' }
                  ]}
                />
                <FormInput.Text
                  name="kubernetesHTTPProperties.method.post.responseCode"
                  label={'Response Code'}
                  placeholder={'200'}
                />
              </>
            ) : null}
          </>
        ) : null}
      </>
    );
  };

  /**
   * Function to retrieve CMD details
   * @returns CMD details for CMD probes
   */
  const cmdRenderer = (): React.ReactElement => {
    return (
      <div>
        {props.formData.infrastructureType === InfrastructureType.KUBERNETES ? (
          <>
            <FormInput.TextArea
              name="kubernetesCMDProperties.command"
              label={'Command'}
              placeholder={'Command to be executed'}
            />

            <Divider />

            <Text
              font={{ variation: FontVariation.FORM_SUB_SECTION }}
              padding={{ top: 'medium', bottom: 'medium' }}
              color={Color.GREY_500}
            >
              Data Comparison
            </Text>
            <FormInput.Select
              name="kubernetesCMDProperties.comparator.type"
              label={getString('type')}
              placeholder={getString('typeOfData')}
              onChange={selected => (cmdComparatorType.current = selected.value as string)}
              items={[
                { label: 'Int', value: 'int' },
                { label: 'Float', value: 'float' },
                { label: 'String', value: 'string' }
              ]}
            />
            <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }} spacing="small">
              <FormInput.Select
                name="kubernetesCMDProperties.comparator.criteria"
                label={getString('comparisonCriteria')}
                usePortal
                style={{ width: '50%' }}
                placeholder={getString('criteriaForData')}
                items={
                  cmdComparatorType.current === 'string'
                    ? [
                        { label: 'contains', value: 'contains' },
                        { label: 'equal', value: 'equal' },
                        { label: 'notEqual', value: 'notEqual' },
                        { label: 'matches', value: 'matches' },
                        { label: 'notMatches', value: 'notMatches' }
                      ]
                    : [
                        { label: '>=', value: '>=' },
                        { label: '<=', value: '<=' },
                        { label: '==', value: '==' },
                        { label: '<', value: '<' },
                        { label: '>', value: '>' },
                        { label: '!=', value: '!=' }
                      ]
                }
              />
              <FormInput.Text
                name="kubernetesCMDProperties.comparator.value"
                label={'Value'}
                style={{ width: '50%' }}
                placeholder={'Relative value for criteria'}
              />
            </Layout.Horizontal>

            <Switch
              label="Source"
              checked={isSourceSelected}
              onChange={event => {
                setIsSourceSelected(prev => !prev);
                (event.target as HTMLInputElement).checked &&
                  window.setTimeout(() => document.getElementById('sourceContainer')?.scrollIntoView(false), 100);
              }}
            />
            <Text
              font={{ variation: FontVariation.FORM_INPUT_TEXT }}
              padding={{ top: 'medium', bottom: 'medium' }}
              color={Color.GREY_400}
            >
              {getString('sourceModeDesction')}
            </Text>
            {isSourceSelected && (
              <Container id="sourceContainer" height={200}>
                <div
                  className={css.yamlBuilder}
                  onDragEnter={preventDefault}
                  onDragOver={preventDefault}
                  onDrop={preventDefault}
                >
                  <YAMLBuilder
                    renderCustomHeader={() => (
                      <Text
                        font={{ variation: FontVariation.FORM_LABEL }}
                        padding={{ top: 'medium', bottom: 'medium' }}
                        color={Color.GREY_400}
                      >
                        {getString('pleaseSpecifyYAMLValues')}
                      </Text>
                    )}
                    fileName=""
                    onChange={(_, updatedYaml) => {
                      source.current = updatedYaml;
                    }}
                    existingJSON={
                      props.formData.kubernetesCMDProperties?.source
                        ? JSON.parse(props.formData.kubernetesCMDProperties?.source)
                        : ''
                    }
                    customCss={css.yamlBuilderBody}
                    isReadOnlyMode={false}
                    isEditModeSupported={true}
                  />
                </div>
              </Container>
            )}
          </>
        ) : undefined}
      </div>
    );
  };

  /**
   * Function to retrieve PROM details
   * @returns PROM details for PROM probes
   */
  const promRenderer = (): React.ReactElement => {
    return (
      <div>
        <FormInput.Text
          name="promProperties.endpoint"
          label={'Prometheus endpoint'}
          placeholder={'http://localhost:8000'}
        />
        <FormInput.TextArea
          name="promProperties.query"
          label={'Prometheus Query'}
          placeholder={'Query to get promethus metrics'}
        />
        <FormInput.Text
          name="promProperties.queryPath"
          label={'Prometheus Query Path'}
          placeholder={'FilePath, which contains Prometheus Query'}
        />
        <Divider />

        <Text
          font={{ variation: FontVariation.FORM_SUB_SECTION }}
          padding={{ top: 'medium', bottom: 'medium' }}
          color={Color.GREY_500}
        >
          Prometheus Data Comparison
        </Text>
        <FormInput.Select
          name="promProperties.comparator.type"
          label={getString('type')}
          onChange={selected => (promComparatorType.current = selected.value as string)}
          placeholder="Type of data"
          items={[
            { label: 'Int', value: 'int' },
            { label: 'Float', value: 'float' },
            { label: 'String', value: 'string' }
          ]}
        />
        <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }} spacing="small">
          <FormInput.Select
            name="promProperties.comparator.criteria"
            label={getString('comparisonCriteria')}
            usePortal
            style={{ width: '50%' }}
            placeholder={getString('criteriaForData')}
            items={
              promComparatorType.current === 'string'
                ? [
                    { label: 'contains', value: 'contains' },
                    { label: 'equal', value: 'equal' },
                    { label: 'notEqual', value: 'notEqual' },
                    { label: 'matches', value: 'matches' },
                    { label: 'notMatches', value: 'notMatches' }
                  ]
                : [
                    { label: '>=', value: '>=' },
                    { label: '<=', value: '<=' },
                    { label: '==', value: '==' },
                    { label: '<', value: '<' },
                    { label: '>', value: '>' },
                    { label: '!=', value: '!=' }
                  ]
            }
          />
          <FormInput.Text
            name="promProperties.comparator.value"
            label={'Value'}
            style={{ width: '50%' }}
            placeholder={'Relative value for criteria'}
          />
        </Layout.Horizontal>
      </div>
    );
  };

  /**
   * Function to retrieve K8S details
   * @returns K8S details for K8S probes
   */
  const k8sRenderer = (): React.ReactElement => {
    return (
      <div>
        <FormInput.Text name="k8sProperties.group" label={'Kubernetes Resource Group'} placeholder={'Group Name'} />
        <FormInput.Text name="k8sProperties.version" label={'Version'} placeholder={'v1alpha1'} />
        <FormInput.Text name="k8sProperties.resource" label={'Resource'} placeholder={'Kind of Resource'} />
        <FormInput.Text
          name="k8sProperties.resourceNames"
          label={'Resource Names'}
          placeholder={'Resource Name using comma seperated values'}
        />
        <FormInput.Text name="k8sProperties.namespace" label={'Namespace'} placeholder={'Resource Namespace'} />
        <FormInput.Text name="k8sProperties.fieldSelector" label={'Field Selector'} placeholder={'Field Selector'} />
        <FormInput.Text name="k8sProperties.labelSelector" label={'Label Selector'} placeholder={'Label Selector'} />
        <FormInput.Select
          name="k8sProperties.operation"
          label={getString('operation')}
          usePortal
          placeholder={getString('operation')}
          items={[
            // Create to be enabled once Engine CR is updated to include `data` inside k8s properties
            // { label: 'Create', value: 'create' },
            { label: 'Delete', value: 'delete' },
            { label: 'Present', value: 'present' },
            { label: 'Absent', value: 'absent' }
          ]}
        />
      </div>
    );
  };

  const getProbeContent = (formikProps: FormikProps<AddProbeFormData>): React.ReactElement | undefined => {
    switch (props.formData.type) {
      case ProbeType.HTTP:
        return httpRenderer(formikProps);
      case ProbeType.CMD:
        return cmdRenderer();
      case ProbeType.PROM:
        return promRenderer();
      case ProbeType.K8S:
        return k8sRenderer();
    }
  };

  return (
    <Loader loading={loading} height="100%">
      <Formik<AddProbeFormData> initialValues={initialValues} onSubmit={noop} validationSchema={validateDetails()}>
        {formikProps => {
          return (
            <Form style={{ height: '100%' }}>
              <Layout.Vertical className={css.probeDetailsInnerContainer}>
                <Text font={{ variation: FontVariation.H3 }} color={Color.GREY_800} margin={{ bottom: 'large' }}>
                  {getString(`probeDetails`)}
                </Text>

                <Layout.Vertical width={400}>{getProbeContent(formikProps)}</Layout.Vertical>
              </Layout.Vertical>

              <FlexExpander />
              <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing={'medium'} margin={{ top: 'large' }}>
                <Button
                  onClick={() => props.previousStep?.()}
                  icon="chevron-left"
                  variation={ButtonVariation.SECONDARY}
                  text={getString('back')}
                />
                <Button
                  type="submit"
                  onClick={() => {
                    handleClick(formikProps);
                  }}
                  rightIcon="chevron-right"
                  variation={ButtonVariation.PRIMARY}
                  text={getString(`setupProbeBtn`)}
                />
              </Layout.Horizontal>
            </Form>
          );
        }}
      </Formik>
    </Loader>
  );
};

export default function AddProbeModalWizardView({
  hideDarkModal,
  mutation,
  validateName,
  loading,
  probeData: probeDataWithTypename,
  isEdit,
  infrastructureType,
  error
}: AddProbeModalWizardViewProps): React.ReactElement {
  const { getString } = useStrings();
  const isUpdated = React.useRef<boolean>(false);
  const type = localStorage.getItem('probeType') as ProbeType;

  const [formData, setFormData] = React.useState<AddProbeFormData>({
    name: '',
    description: '',
    tags: [],
    type: type,
    infrastructureType: infrastructureType,
    kubernetesHTTPProperties: undefined,
    kubernetesCMDProperties: undefined,
    promProperties: undefined,
    k8sProperties: undefined
  });

  React.useMemo(() => {
    if (mutation.updateProbeMutation && probeDataWithTypename) {
      const probeData = cleanApolloResponse(probeDataWithTypename) as Probe;

      initialValues = {
        name: probeData.name,
        description: probeData.description,
        tags: probeData.tags ?? [],
        type: probeData.type,
        infrastructureType: probeData.infrastructureType,
        kubernetesHTTPProperties: probeData.kubernetesHTTPProperties && {
          methodDropdown: probeData.kubernetesHTTPProperties.method.get ? HTTPMethod.GET : HTTPMethod.POST,
          ...probeData.kubernetesHTTPProperties
        },
        kubernetesCMDProperties: probeData.kubernetesCMDProperties,
        promProperties: probeData.promProperties,
        k8sProperties: probeData.k8sProperties
      };

      setFormData(initialValues);
      isUpdated.current = true;
    }
  }, [loading, isEdit]);

  // Resets the initial value of the form
  if (!mutation.updateProbeMutation) initialValues = formData;

  function getTitle(): string | undefined {
    switch (formData.type) {
      case ProbeType.HTTP:
        return getString(`probeTypes.httpProbe`);
      case ProbeType.CMD:
        return getString(`probeTypes.cmdProbe`);
      case ProbeType.PROM:
        return getString(`probeTypes.promProbe`);
      case ProbeType.K8S:
        return getString(`probeTypes.k8sProbe`);
    }
  }

  const stepWizard = formData.type && (
    <>
      <StepWizard
        icon={<Icon name={getIcon(formData.type)} size={50} />}
        // iconProps={{ size: 50 }}
        className={css.probeWizard}
        title={getTitle()}
      >
        <OverviewStep
          name={getString('overview')}
          isEdit={isEdit}
          formData={formData}
          validateName={validateName}
          setFormData={setFormData}
          hideDarkModal={hideDarkModal}
        />
        <TunePropertiesStep name={getString(`properties`)} formData={formData} setFormData={setFormData} />
        <TuneDetailsStep
          formData={formData}
          setFormData={setFormData}
          name={getString(`probeDetails`)}
          mutation={mutation}
          loading={loading}
          isEdit={isEdit}
          hideDarkModal={hideDarkModal}
          error={error}
        />
      </StepWizard>
    </>
  );

  return <>{isEdit ? isUpdated.current && stepWizard : stepWizard}</>;
}
