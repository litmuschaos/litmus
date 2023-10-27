import React, { FormEvent } from 'react';
import {
  Button,
  ButtonVariation,
  CardSelect,
  Container,
  FlexExpander,
  FormInput,
  Layout,
  RadioButtonGroup,
  StepWizard,
  Text,
  TextInput,
  useToaster
} from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import type { GotoStepArgs } from '@harnessio/uicore/dist/components/StepWizard/StepWizard';
import type { MutationFunction } from '@apollo/client';
import { Color, FontVariation } from '@harnessio/design-system';
import { getScope } from '@utils';
import { AuthType, ChaosHub, RepoType } from '@api/entities';
import { useStrings } from '@strings';
import type { UpdateChaosHubRequest, UpdateChaosHubResponse } from '@api/core';
import NameDescriptionTags from '@components/NameIdDescriptionTags';
import CopyButton from '@components/CopyButton';
import getRepoAccessType from '@views/AddHubModalWizard/RepoAccessType';
import { generateSSHKey } from '@api/core/chaoshubs/generateSSH';
import css from './EditHubModalWizard.module.scss';

interface EditHubModalWizardViewProps {
  updateChaosHubMutation: MutationFunction<UpdateChaosHubResponse, UpdateChaosHubRequest>;
  error: {
    updateChaosHubMutation: Error | undefined;
  };
  loading: {
    updateChaosHubMutation: boolean;
  };
  hideDarkModal?: () => void;
  hubDetails: ChaosHub | undefined;
}

interface EditHubFormData {
  hubId: string;
  repoURL: string;
  name: string;
  description?: string;
  tags: string[];
  repoBranch: string;
  isPrivate: boolean;
  authType: AuthType;
  sshPublicKey?: string;
  sshPrivateKey?: string;
  token?: string;
}
interface StepData {
  value?: EditHubFormData;
}
interface StepProps<PrevStepData> {
  name?: string | JSX.Element;
  // These props will be passed by wizard
  subTitle?: string | JSX.Element;
  prevStepData?: PrevStepData;
  formData: EditHubFormData;
  setFormData: React.Dispatch<React.SetStateAction<EditHubFormData>>;
  currentStep?: () => number;
  totalSteps?: () => number;
  nextStep?: (data?: PrevStepData) => void;
  previousStep?: (data?: PrevStepData) => void;
  gotoStep?: (args: GotoStepArgs<PrevStepData>) => boolean;
  firstStep?: (data?: PrevStepData) => void;
  lastStep?: (data?: PrevStepData) => void;
}

const OverviewStep: React.FC<StepProps<StepData>> = props => {
  const currentStep = props.currentStep?.();
  const { getString } = useStrings();
  return (
    <Layout.Vertical height={'100%'} width={400}>
      <Formik<EditHubFormData>
        initialValues={props.formData}
        onSubmit={data => {
          props.setFormData({ ...props.formData, name: data.name, description: data.description, tags: data.tags });
          props.nextStep?.();
        }}
        validationSchema={Yup.object().shape({
          name: Yup.string().trim().required('Hub Name is a required field')
        })}
      >
        {formikProps => {
          return (
            <Form style={{ height: '100%' }}>
              <Layout.Vertical height={'100%'}>
                <Text font={{ variation: FontVariation.H3 }} color={Color.GREY_800} margin={{ bottom: 'large' }}>
                  {getString('overview')}
                </Text>

                <NameDescriptionTags formikProps={formikProps} />

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
                  rightIcon="chevron-right"
                  variation={ButtonVariation.PRIMARY}
                  text={getString('continue')}
                />
              </Layout.Horizontal>
            </Form>
          );
        }}
      </Formik>
    </Layout.Vertical>
  );
};

const GitConnectionStep: React.FC<
  StepProps<StepData> & Pick<EditHubModalWizardViewProps, 'updateChaosHubMutation'>
> = props => {
  const scope = getScope();
  const currentStep = props.currentStep?.();
  const { getString } = useStrings();
  const { updateChaosHubMutation, formData, setFormData } = props;
  const [accessType, setAccessType] = React.useState<RepoType>(
    props.formData.isPrivate ? RepoType.PRIVATE : RepoType.PUBLIC
  );
  const [sshPublicKey, setPublicSshKey] = React.useState<string>(formData.sshPublicKey ?? '');
  const { showError, showSuccess } = useToaster();

  const [generateSSHKeyMutation] = generateSSHKey({
    onError: err => showError(err.message)
  });

  const repoAccessType = getRepoAccessType();

  return (
    <Layout.Vertical height={'100%'} width={400}>
      <Formik<EditHubFormData>
        initialValues={props.formData}
        onSubmit={values => {
          setFormData({
            ...formData,
            repoBranch: values.repoBranch,
            isPrivate: values.isPrivate,
            repoURL: values.repoURL,
            authType: values.authType,
            token: values.token,
            sshPublicKey: values.sshPublicKey,
            sshPrivateKey: values.sshPrivateKey
          });
          updateChaosHubMutation({
            variables: {
              projectID: scope.projectID,
              request: {
                id: formData.hubId,
                name: formData.name,
                repoBranch: values.repoBranch,
                description: formData.description,
                tags: formData.tags,
                repoURL: values.repoURL,
                authType: values.authType,
                isPrivate: values.isPrivate,
                token: values.token,
                sshPublicKey: values.sshPublicKey,
                sshPrivateKey: values.sshPrivateKey
              }
            },
            onError: error => {
              showError(error);
            },
            onCompleted: () => {
              showSuccess('Chaoshub updated successfully');
            }
          });
        }}
        validationSchema={Yup.object().shape({
          repoBranch: Yup.string().trim().required('Hub Branch name is a required field'),
          repoURL: Yup.string().trim().required('Hub Repo name is a required field')
        })}
      >
        {formikProps => {
          return (
            <Form style={{ height: '100%' }}>
              <Layout.Vertical height={'100%'}>
                <Text font={{ variation: FontVariation.H3 }} color={Color.GREY_800} margin={{ bottom: 'large' }}>
                  {getString('gitConnection')}
                </Text>
                <Text font={{ variation: FontVariation.FORM_LABEL }} margin={{ bottom: 'small' }}>
                  Choose the repo access
                </Text>
                <CardSelect
                  defaultChecked
                  selected={repoAccessType.find(objective => objective._cardName === accessType)}
                  data={repoAccessType}
                  onChange={key => {
                    setAccessType(key._cardName);
                    formikProps.setFieldValue('isPrivate', key.key);
                  }}
                  className={css.cardContainer}
                  renderItem={item => (
                    <Container className={css.card} flex={{ justifyContent: 'center', alignItems: 'center' }}>
                      <Text font={{ variation: FontVariation.BODY, align: 'center' }}>{item.text}</Text>
                    </Container>
                  )}
                />

                <FormInput.Text
                  name="repoURL"
                  label={
                    <Text font={{ variation: FontVariation.FORM_LABEL }} margin={{ top: 'medium' }}>
                      {getString('hubRepositoryURL')}
                    </Text>
                  }
                  placeholder={getString('enterHubRepositoryURL')}
                />

                <FormInput.Text
                  name="repoBranch"
                  label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('hubRepositoryBranch')}</Text>}
                  placeholder={getString('enterHubRepositoryBranch')}
                />

                {formikProps.values.isPrivate && (
                  <RadioButtonGroup
                    name="type"
                    label={<Text font={{ variation: FontVariation.FORM_LABEL }}>Select Security Key Type</Text>}
                    inline={true}
                    selectedValue={formData.authType}
                    onChange={(e: FormEvent<HTMLInputElement>) => {
                      formikProps.setFieldValue('authType', e.currentTarget.value);
                    }}
                    options={[
                      {
                        label: <Text font={{ variation: FontVariation.FORM_LABEL }}>SSH</Text>,
                        value: AuthType.SSH
                      },
                      {
                        label: <Text font={{ variation: FontVariation.FORM_LABEL }}>PAT</Text>,
                        value: AuthType.TOKEN
                      }
                    ]}
                  />
                )}
                {formikProps.values.isPrivate && formikProps.values.authType === AuthType.TOKEN && (
                  <FormInput.Text
                    inputGroup={{ type: 'password' }}
                    name="token"
                    label={
                      <Text font={{ variation: FontVariation.FORM_LABEL }} margin={{ top: 'medium' }}>
                        PAT
                      </Text>
                    }
                    placeholder="Enter your Personal Acess Token"
                  />
                )}
                {formikProps.values.isPrivate && formikProps.values.authType === AuthType.SSH && (
                  <Layout.Vertical spacing={'small'} flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                    <Button
                      onClick={() => {
                        generateSSHKeyMutation({
                          onCompleted: data => {
                            setPublicSshKey(data.generateSSHKey.publicKey);
                            formikProps.setFieldValue('sshPrivateKey', data.generateSSHKey.privateKey);
                            formikProps.setFieldValue('sshPublicKey', data.generateSSHKey.publicKey);
                          }
                        });
                      }}
                      variation={ButtonVariation.SECONDARY}
                      text={getString('generateSSH')}
                    />
                    <div className={css.textInputContainer}>
                      <Text font={{ variation: FontVariation.FORM_LABEL }} margin={{ bottom: 'xsmall' }}>
                        SSH Key
                      </Text>
                      <TextInput
                        placeholder="SSH Key"
                        value={sshPublicKey}
                        onChange={(e: FormEvent<HTMLInputElement>) => {
                          setPublicSshKey(e.currentTarget.value);
                          formikProps.setFieldValue('sshPublicKey', e.currentTarget.value);
                        }}
                        rightElement={
                          (
                            <Container flex={{ justifyContent: 'center', alignItems: 'center' }} height="100%">
                              <CopyButton stringToCopy={sshPublicKey} />
                            </Container>
                          ) as any
                        }
                      />
                      <Layout.Horizontal spacing={'xsmall'} flex={{ alignItems: 'center' }}>
                        <Icon name="info-message" size={15} />
                        <Text font={{ variation: FontVariation.SMALL }}>
                          Please make sure you copy the SSH key and saved it safely.
                        </Text>
                      </Layout.Horizontal>
                    </div>
                  </Layout.Vertical>
                )}
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
                  rightIcon="chevron-right"
                  variation={ButtonVariation.PRIMARY}
                  text={getString('editChaosHub')}
                />
              </Layout.Horizontal>
            </Form>
          );
        }}
      </Formik>
    </Layout.Vertical>
  );
};

export default function EditHubModalWizardView({
  hideDarkModal,
  updateChaosHubMutation,
  hubDetails
}: EditHubModalWizardViewProps): React.ReactElement {
  const { getString } = useStrings();

  const [formData, setFormData] = React.useState<EditHubFormData>({
    hubId: hubDetails?.id ?? '',
    name: hubDetails?.name ?? '',
    description: hubDetails?.description,
    tags: hubDetails?.tags ?? [],
    repoBranch: hubDetails?.repoBranch ?? '',
    isPrivate: hubDetails?.isPrivate ?? false,
    authType: hubDetails?.authType ?? AuthType.NONE,
    repoURL: hubDetails?.repoURL ?? '',
    token: hubDetails?.token ?? '',
    sshPublicKey: hubDetails?.sshPublicKey ?? '',
    sshPrivateKey: hubDetails?.sshPrivateKey ?? ''
  });

  return (
    <StepWizard
      icon={<Icon size={50} name="chaos-hubs" color={Color.WHITE} />}
      className={css.hubWizard}
      title={getString('editChaosHub')}
      onCompleteWizard={() => {
        hideDarkModal && hideDarkModal();
      }}
    >
      <OverviewStep name={getString('overview')} formData={formData} setFormData={setFormData} />
      <GitConnectionStep
        name={getString('gitConnection')}
        formData={formData}
        setFormData={setFormData}
        updateChaosHubMutation={updateChaosHubMutation}
      />
    </StepWizard>
  );
}
