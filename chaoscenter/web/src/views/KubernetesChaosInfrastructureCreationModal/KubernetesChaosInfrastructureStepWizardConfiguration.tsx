import { Dialog } from '@blueprintjs/core';
import { Color, FontVariation } from '@harnessio/design-system';
import {
  Button,
  ButtonVariation,
  Container,
  FlexExpander,
  FormInput,
  Layout,
  NestedAccordionPanel,
  NestedAccordionProvider,
  StepWizard,
  Text
} from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import { FieldArray, Formik, Form, FormikProps } from 'formik';
import { get } from 'lodash-es';
import React from 'react';
import * as Yup from 'yup';
import type { ApolloQueryResult } from '@apollo/client';
import { useStrings } from '@strings';
import {
  DeploymentScopeOptions,
  InitialValueProps,
  initialValues,
  kubernetesChaosInfrastructureCRDsEndpoint,
  NodeSelector,
  Toleration
} from '@models';
import KubernetesChaosInfrastructureGreenfieldController from '@controllers/KubernetesChaosInfrastructureGreenfield';
import KubernetesChaosInfrastructureDeploymentScopeController from '@controllers/KubernetesChaosInfrastructureDeploymentScope';
import NameDescriptionTags from '@components/NameIdDescriptionTags';
import CodeBlock from '@components/CodeBlock';
import type { ListKubernetesChaosInfrastructureRequest, ListKubernetesChaosInfrastructureResponse } from '@api/core';
import css from './KubernetesChaosInfrastructureCreationModal.module.scss';

interface ParentModalProps {
  kubernetesChaosInfrastructureCreationModalClose: () => void;
  chaosStepWizardIsOpen: boolean;
  setChaosStepWizardIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isConnectorMode?: boolean;
  connectorScope?: string;
  delegateID?: string;
  selectedConnector?: string;
  refetch: {
    listChaosInfra: (
      variables?: Partial<ListKubernetesChaosInfrastructureRequest> | undefined
    ) => Promise<ApolloQueryResult<ListKubernetesChaosInfrastructureResponse>>;
  };
}

interface DeploySetupStepProps {
  kubernetesChaosInfrastructureCreationModalClose: () => void;
  setChaosStepWizardIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refetch: {
    listChaosInfra: (
      variables?: Partial<ListKubernetesChaosInfrastructureRequest> | undefined
    ) => Promise<ApolloQueryResult<ListKubernetesChaosInfrastructureResponse>>;
  };
}

interface BasicChaosInfrastructureConfigProps {
  deploymentScope: DeploymentScopeOptions;
  setDeploymentScope: React.Dispatch<React.SetStateAction<DeploymentScopeOptions>>;
  isInfraPresent: boolean;
  setIsInfraPresent: React.Dispatch<React.SetStateAction<boolean>>;
}

interface AdvancedChaosInfrastructureConfigProps {
  nodeSelectorToggle: boolean;
  setNodeSelectorToggle: React.Dispatch<React.SetStateAction<boolean>>;
  tolerationToggle: boolean;
  setTolerationToggle: React.Dispatch<React.SetStateAction<boolean>>;
  formikProps: FormikProps<InitialValueProps>;
}

export interface StepData {
  name?: string | JSX.Element;
  value: InitialValueProps;
}

interface StepProps<PrevStepData> {
  name?: string | JSX.Element;
  // These props will be passed by wizard
  subTitle?: string | JSX.Element;
  prevStepData?: PrevStepData;
  nextStep?: (data?: PrevStepData) => void;
  previousStep?: (data?: PrevStepData) => void;
}

function AdvancedChaosInfrastructureConfig({
  nodeSelectorToggle,
  setNodeSelectorToggle,
  tolerationToggle,
  setTolerationToggle,
  formikProps
}: AdvancedChaosInfrastructureConfigProps): React.ReactElement {
  const { getString } = useStrings();

  const nodeSelectorEntities: Array<NodeSelector> = get(formikProps.values, 'nodeSelectorValues') || [
    { key: '', value: '' }
  ];

  const tolerationEntities: Array<Toleration> = get(formikProps.values, 'tolerationValues') || [
    {
      tolerationSeconds: 0,
      key: '',
      operator: '',
      effect: '',
      value: ''
    }
  ];

  return (
    <Layout.Vertical spacing="large" padding={'small'}>
      <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_800}>
        {getString('topology')}
      </Text>
      <FormInput.Toggle
        name="addNodeselector"
        label={getString('addNodeSelectorAgentDeployment')}
        onToggle={() => {
          setNodeSelectorToggle(!nodeSelectorToggle);
        }}
        tooltipProps={{ dataTooltipId: 'chaos_infra_node_selectors' }}
      />
      {nodeSelectorToggle && (
        <Container className={css.nodeSelectorContainer}>
          <FieldArray
            name={'nodeSelectorValues'}
            render={() => {
              return (
                <Container>
                  <Layout.Horizontal className={css.keyValHeader} border={{ bottom: true }}>
                    <Text className={css.textCss}>{getString('key')}</Text>
                    <Text className={css.textCss}>{getString('value')}</Text>
                  </Layout.Horizontal>
                  {nodeSelectorEntities.map((_, index) => (
                    <Layout.Horizontal key={index} className={css.keyValueContainer}>
                      <FormInput.Text
                        className={css.textCss}
                        name={`${'nodeSelectorValues'}[${index}].key`}
                        placeholder={getString('key')}
                      />
                      <FormInput.Text
                        className={css.textCss}
                        name={`${'nodeSelectorValues'}[${index}].value`}
                        placeholder={getString('value')}
                      />
                    </Layout.Horizontal>
                  ))}
                </Container>
              );
            }}
          />
        </Container>
      )}
      <FormInput.Toggle
        name="tolerations"
        label={getString('addTolerationAgentDeployment')}
        onToggle={() => {
          setTolerationToggle(!tolerationToggle);
        }}
        tooltipProps={{ dataTooltipId: 'chaos_infra_tolerations' }}
      />
      {tolerationToggle && (
        <Container className={css.tolerationsContainer}>
          <FieldArray
            name={'tolerationValues'}
            render={arrayHelpers => {
              return (
                <Container>
                  <Layout.Horizontal className={css.tolerationHeader} border={{ bottom: true }}>
                    <Text style={{ flexBasis: '20%' }} className={css.textCss}>
                      {getString('tolerationSeconds')}
                    </Text>
                    <Text style={{ flexBasis: '18%' }} className={css.textCss}>
                      {getString('key')}
                    </Text>
                    <Text style={{ flexBasis: '19%' }} className={css.textCss}>
                      {getString('operator')}
                    </Text>
                    <Text style={{ flexBasis: '19%' }} className={css.textCss}>
                      {getString('effect')}
                    </Text>
                    <Text style={{ flexBasis: '10%' }} className={css.textCss}>
                      {getString('value')}
                    </Text>
                    <Button
                      icon="plus"
                      text={getString('addRow')}
                      variation={ButtonVariation.LINK}
                      onClick={() =>
                        arrayHelpers.insert(tolerationEntities.length, {
                          tolerationSeconds: 0,
                          key: '',
                          operator: '',
                          effect: '',
                          value: ''
                        })
                      }
                      className={css.addRowButton}
                    />
                  </Layout.Horizontal>
                  {tolerationEntities.map((toleration, index) => (
                    <Layout.Horizontal key={index} className={css.keyValueContainer}>
                      <FormInput.Text
                        inputGroup={{ type: 'number' }}
                        className={css.textCss}
                        disabled={toleration.effect === 'NoSchedule' || toleration.effect === ''}
                        name={`${'tolerationValues'}[${index}].tolerationSeconds`}
                        placeholder={getString('tolerationSeconds')}
                      />
                      <FormInput.Text
                        className={css.textCss}
                        name={`${'tolerationValues'}[${index}].key`}
                        placeholder={getString('key')}
                      />
                      <FormInput.Select
                        className={css.textCss}
                        name={`tolerationValues.${index}.operator`}
                        placeholder={getString('operator')}
                        items={[
                          { label: 'Equal', value: 'Equal' },
                          { label: 'Exists', value: 'Exists' }
                        ]}
                      />
                      <FormInput.Select
                        className={css.textCss}
                        name={`tolerationValues.${index}.effect`}
                        placeholder={getString('effect')}
                        items={[
                          { label: 'NoSchedule', value: 'NoSchedule' },
                          { label: 'PreferNoSchedule', value: 'PreferNoSchedule' },
                          { label: 'NoExecute', value: 'NoExecute' }
                        ]}
                      />
                      <FormInput.Text
                        className={css.textCss}
                        name={`${'tolerationValues'}[${index}].value`}
                        placeholder={getString('value')}
                      />
                      <Button
                        icon="trash"
                        minimal
                        onClick={() => arrayHelpers.remove(index)}
                        className={css.removeRow}
                      />
                    </Layout.Horizontal>
                  ))}
                </Container>
              );
            }}
          />
        </Container>
      )}
    </Layout.Vertical>
  );
}

function BasicChaosInfrastructureConfig({
  deploymentScope,
  setDeploymentScope,
  setIsInfraPresent,
  isInfraPresent
}: BasicChaosInfrastructureConfigProps): React.ReactElement {
  const { getString } = useStrings();
  return (
    <Layout.Vertical spacing="large" padding={'small'}>
      <div className={css.flexProvider}>
        <KubernetesChaosInfrastructureDeploymentScopeController
          deploymentScope={deploymentScope}
          isInfraPresent={isInfraPresent}
          setDeploymentScope={setDeploymentScope}
          setIsInfraPresent={setIsInfraPresent}
        />
        {isInfraPresent && (
          <div className={css.noteCard}>
            <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
              {getString('connectInfraTooltip')}
            </Text>
          </div>
        )}
      </div>
      <FormInput.Text
        className={css.formSubSection}
        name="chaosInfrastructureNamespace"
        placeholder={initialValues.chaosInfrastructureNamespace}
        label={
          <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_800}>
            {getString('chaosInfrastructureNamespace')}
          </Text>
        }
      />
      <Layout.Vertical spacing="xsmall">
        <FormInput.Text
          className={`${css.formSubSection} ${css.serviceAccountInput}`}
          name="serviceAccountName"
          label={
            <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_800}>
              {getString('serviceAccountName')}
            </Text>
          }
          placeholder={initialValues.serviceAccountName}
        />
        <a
          className={css.serviceAccountLink}
          href="https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/#use-multiple-service-accounts"
          target="_blank"
          rel="noopener noreferrer"
        >
          {getString('howToFindServiceAccount')}
        </a>
      </Layout.Vertical>
    </Layout.Vertical>
  );
}

export function DeploySetupStep({
  prevStepData,
  kubernetesChaosInfrastructureCreationModalClose,
  setChaosStepWizardIsOpen,
  refetch
}: StepProps<StepData> & DeploySetupStepProps): React.ReactElement {
  const { getString } = useStrings();
  const [infraRegistered, setInfraRegistered] = React.useState<boolean>(false);
  const data = prevStepData;
  return (
    <Layout.Vertical height="100%" spacing="large">
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Text font={{ variation: FontVariation.H4, weight: 'semi-bold' }} color={Color.GREY_1000}>
          {getString('deployChaosInfrastructure')}
        </Text>
        <Icon
          name="cross"
          size={24}
          className={css.crossIcon}
          onClick={() => {
            prevStepData && (prevStepData.value = initialValues);
            setChaosStepWizardIsOpen(false);
          }}
        />
      </Layout.Horizontal>
      <>
        <div className={css.deploymentContainer}>
          <Text font={{ variation: FontVariation.H6, weight: 'semi-bold' }} color={Color.GREY_1000}>
            {getString('kubernetesSetupInstructions')}
          </Text>
          <hr className={css.horizontalRule} />
          {data?.value.infraScope === DeploymentScopeOptions.NAMESPACE && (
            <>
              <Text
                className={css.namespaceScopeText}
                font={{ variation: FontVariation.BODY2, weight: 'light' }}
                color={Color.GREY_1000}
              >
                {getString('createNamespace')}
              </Text>
              <CodeBlock
                text={`kubectl create namespace ${data.value.chaosInfrastructureNamespace}`}
                isCopyButtonEnabled
              />
              <Text
                font={{ variation: FontVariation.BODY2, weight: 'light' }}
                className={css.namespaceScopeText}
                color={Color.GREY_1000}
              >
                {getString('copyPrompt1')}
              </Text>
              <CodeBlock text={`kubectl apply -f ${kubernetesChaosInfrastructureCRDsEndpoint}`} isCopyButtonEnabled />
            </>
          )}
          <Text
            className={css.kubectlApplyText}
            font={{ variation: FontVariation.BODY2, weight: 'light' }}
            color={Color.GREY_1000}
          >
            {data?.value.infraScope === DeploymentScopeOptions.NAMESPACE
              ? getString('copyPrompt2')
              : getString('copyPrompt')}
          </Text>
          <Text
            className={css.runCommandText}
            font={{ variation: FontVariation.BODY2, weight: 'light' }}
            color={Color.GREY_1000}
          >
            {getString('infrastructureCommand')}
          </Text>
          {data && (
            <KubernetesChaosInfrastructureGreenfieldController
              data={data}
              infraRegistered={infraRegistered}
              setInfraRegistered={setInfraRegistered}
            />
          )}
          <Text
            className={css.checkStatusText}
            font={{ variation: FontVariation.BODY2, weight: 'light' }}
            color={Color.GREY_1000}
          >
            {getString('statusCheck')}
          </Text>
        </div>
        <FlexExpander />
        <Layout.Horizontal spacing="small">
          <Button
            disabled={!infraRegistered}
            className={css.stepButton}
            onClick={() => {
              prevStepData && (prevStepData.value = initialValues);
              refetch.listChaosInfra();
              kubernetesChaosInfrastructureCreationModalClose();
            }}
            variation={ButtonVariation.PRIMARY}
            text={getString('done')}
          />
        </Layout.Horizontal>
      </>
    </Layout.Vertical>
  );
}

const ConfigureStep: React.FC<
  StepProps<StepData> & {
    setChaosStepWizardIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }
> = props => {
  const { getString } = useStrings();
  const [deploymentScope, setDeploymentScope] = React.useState<DeploymentScopeOptions>(DeploymentScopeOptions.CLUSTER);
  const [isInfraPresent, setIsInfraPresent] = React.useState<boolean>(false);
  const [nodeSelectorToggle, setNodeSelectorToggle] = React.useState(false);
  const [tolerationToggle, setTolerationToggle] = React.useState(false);
  const prevStepData = props.prevStepData?.value;
  return (
    <Layout.Vertical height={'100%'}>
      <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
        <Text font={{ variation: FontVariation.H4, weight: 'semi-bold' }} color={Color.GREY_1000}>
          {getString('configureChaosInfrastructure')}
        </Text>
        <Icon
          name="cross"
          size={24}
          style={{ cursor: 'pointer' }}
          onClick={() => {
            props.prevStepData && (props.prevStepData.value = initialValues);
            props.setChaosStepWizardIsOpen(false);
          }}
        />
      </Layout.Horizontal>
      <Formik<InitialValueProps>
        initialValues={initialValues}
        onSubmit={data => {
          data.name = prevStepData?.name ?? '';
          data.description = prevStepData?.description ?? '';
          data.tags = prevStepData?.tags;
          data.infraScope = isInfraPresent ? DeploymentScopeOptions.NAMESPACE : deploymentScope;
          // If toggle is switched off, discard the values
          data.nodeSelectorValues = nodeSelectorToggle ? data.nodeSelectorValues : undefined;
          data.tolerationValues = tolerationToggle ? data.tolerationValues : undefined;
          props.nextStep?.({ value: data });
        }}
      >
        {formikProps => {
          return (
            <Form style={{ height: '100%', display: 'flex', flexDirection: 'column', paddingTop: '8px' }}>
              <div style={{ overflow: 'scroll', flexGrow: 1 }}>
                <NestedAccordionProvider>
                  <NestedAccordionPanel
                    noAutoScroll
                    isDefaultOpen
                    addDomId
                    id={getString('basic')}
                    summary={
                      <Text font={{ variation: FontVariation.CARD_TITLE }} color={Color.GREY_1000}>
                        {getString('chaosComponentInstallation')}
                      </Text>
                    }
                    details={
                      <BasicChaosInfrastructureConfig
                        deploymentScope={deploymentScope}
                        setDeploymentScope={setDeploymentScope}
                        setIsInfraPresent={setIsInfraPresent}
                        isInfraPresent={isInfraPresent}
                      />
                    }
                    collapseProps={{
                      keepChildrenMounted: true
                    }}
                  />
                  <NestedAccordionPanel
                    noAutoScroll
                    addDomId
                    id="Advanced"
                    summary={
                      <Text font={{ variation: FontVariation.CARD_TITLE }} color={Color.GREY_1000}>
                        {getString('advanced')}
                      </Text>
                    }
                    details={
                      <AdvancedChaosInfrastructureConfig
                        nodeSelectorToggle={nodeSelectorToggle}
                        setNodeSelectorToggle={setNodeSelectorToggle}
                        tolerationToggle={tolerationToggle}
                        setTolerationToggle={setTolerationToggle}
                        formikProps={formikProps}
                      />
                    }
                    collapseProps={{
                      keepChildrenMounted: true
                    }}
                  />
                </NestedAccordionProvider>
              </div>
              <Layout.Horizontal spacing="small">
                <Button
                  className={css.stepButton}
                  icon="chevron-left"
                  variation={ButtonVariation.SECONDARY}
                  text={getString('back')}
                  onClick={() => props.previousStep?.()}
                />
                <Button
                  type="submit"
                  className={css.stepButton}
                  rightIcon="chevron-right"
                  variation={ButtonVariation.PRIMARY}
                  text={getString('next')}
                />
              </Layout.Horizontal>
            </Form>
          );
        }}
      </Formik>
    </Layout.Vertical>
  );
};

export const OverviewStep: React.FC<
  StepProps<StepData> & {
    setChaosStepWizardIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }
> = props => {
  const { getString } = useStrings();
  return (
    <Layout.Vertical height={'100%'}>
      <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
        <Text font={{ variation: FontVariation.H4, weight: 'semi-bold' }} color={Color.GREY_1000}>
          {getString('overview')}
        </Text>
        <Icon
          name="cross"
          size={24}
          className={css.crossIcon}
          onClick={() => {
            props.prevStepData && (props.prevStepData.value = initialValues);
            props.setChaosStepWizardIsOpen(false);
          }}
        />
      </Layout.Horizontal>
      <Formik<InitialValueProps>
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          name: Yup.string()
            .trim()
            .matches(/^[a-z0-9-]*$/, 'Chaos Infrastructure Name can only contain lowercase letters, numbers and dashes')
            .matches(/^[^-].*$/, 'Chaos Infrastructure Name can not start with -')
            .matches(/^.*[^-]$/, 'Chaos Infrastructure Name can not end with -')
            .max(50, 'Chaos Infrastructure Name can have a max length of 50 characters')
            .required('Chaos Infrastructure Name is required!')
        })}
        onSubmit={data => {
          props.nextStep?.({ value: data });
        }}
      >
        {formikProps => {
          return (
            <div style={{ height: '100%' }}>
              <Form style={{ height: '100%', display: 'flex', flexDirection: 'column', paddingTop: '32px' }}>
                <NameDescriptionTags className={css.formSubSection} formikProps={formikProps} />
                <FlexExpander />
                <Button
                  type="submit"
                  className={css.stepButton}
                  rightIcon="chevron-right"
                  variation={ButtonVariation.PRIMARY}
                  text={getString('next')}
                />
              </Form>
            </div>
          );
        }}
      </Formik>
    </Layout.Vertical>
  );
};

export function KubernetesChaosInfrastructureStepWizardConfiguration({
  kubernetesChaosInfrastructureCreationModalClose,
  chaosStepWizardIsOpen,
  setChaosStepWizardIsOpen,
  refetch
}: ParentModalProps): React.ReactElement {
  const { getString } = useStrings();

  return (
    <Dialog
      className={css.modalStepWizard}
      canOutsideClickClose={false}
      canEscapeKeyClose={false}
      enforceFocus={false}
      isOpen={chaosStepWizardIsOpen}
      onClose={() => {
        setChaosStepWizardIsOpen(false);
      }}
    >
      <section className={css.wrapper}>
        <StepWizard
          icon={<Icon size={50} name="infrastructure" color={Color.WHITE} />}
          title={getString('newChaosInfrastructure')}
        >
          <OverviewStep name={getString('overview')} setChaosStepWizardIsOpen={setChaosStepWizardIsOpen} />
          <ConfigureStep name={getString('configure')} setChaosStepWizardIsOpen={setChaosStepWizardIsOpen} />
          <DeploySetupStep
            refetch={refetch}
            name={getString('deploySetup')}
            kubernetesChaosInfrastructureCreationModalClose={kubernetesChaosInfrastructureCreationModalClose}
            setChaosStepWizardIsOpen={setChaosStepWizardIsOpen}
          />
        </StepWizard>
      </section>
    </Dialog>
  );
}
