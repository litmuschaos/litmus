import {
  Button,
  ButtonVariation,
  Text,
  Layout,
  Container,
  RadioButtonGroup,
  FormInput,
  useToaster
} from '@harnessio/uicore';
import React, { FormEvent } from 'react';
import { Color, FontVariation } from '@harnessio/design-system';
import { Form, Formik, FormikProps } from 'formik';
import { Icon } from '@harnessio/icons';
import type { MutationFunction } from '@apollo/client';
import { useHistory, useParams } from 'react-router-dom';
import { InputGroup } from '@blueprintjs/core';
import DefaultLayout from '@components/DefaultLayout';
import RbacButton from '@components/RbacButton';
import { GitopsValues, PermissionGroup } from '@models';
import { AuthType } from '@api/entities';
import CopyButton from '@components/CopyButton';
import { generateSSHKey } from '@api/core/chaoshubs/generateSSH';
import type {
  DisableGitOpsRequest,
  EnableGitOpsRequest,
  GitOpsConfig,
  UpdateGitOpsRequest
} from '@api/entities/gitops';
import { useDocumentTitle, useRouteWithBaseUrl } from '@hooks';
import { useStrings } from '@strings';
import Loader from '@components/Loader';
import css from './Gitops.module.scss';

interface GitopsData {
  branch: string;
  repoURL: string;
  authType: AuthType;
  token?: string;
  sshPrivateKey?: string;
  userName?: string;
  password?: string;
}

interface GitopsViewProps {
  gitopsDetails: GitOpsConfig | undefined;
  enableGitops: MutationFunction<boolean, EnableGitOpsRequest>;
  updateGitops: MutationFunction<boolean, UpdateGitOpsRequest>;
  disableGitops: MutationFunction<boolean, DisableGitOpsRequest>;
  loading: {
    getGitOpsDetailsLoading: boolean;
    enableGitopsMutationLoading: boolean;
    updateGitopsMutationLoading: boolean;
    disableGitopsMutationLoading: boolean;
  };
}

export default function GitopsView({
  gitopsDetails,
  enableGitops,
  disableGitops,
  updateGitops,
  loading
}: GitopsViewProps): React.ReactElement {
  const { showError } = useToaster();
  const { getString } = useStrings();
  const history = useHistory();
  const paths = useRouteWithBaseUrl();
  const { projectID } = useParams<{ projectID: string }>();
  const [sshPublicKey, setPublicSshKey] = React.useState<string>('');
  const [gitopsType, setGitopstype] = React.useState<GitopsValues>(
    gitopsDetails?.enabled ? GitopsValues.GITHUB : GitopsValues.LOCAL
  );

  useDocumentTitle(getString('gitOps'));

  const initialValues: GitopsData = {
    branch: gitopsDetails?.branch ?? '',
    repoURL: gitopsDetails?.repoURL ?? '',
    authType: (gitopsDetails?.authType as AuthType) ?? AuthType.TOKEN,
    token: gitopsDetails?.token ?? '',
    sshPrivateKey: gitopsDetails?.sshPrivateKey ?? ''
  };

  const [generateSSHKeyMutation] = generateSSHKey({
    onError: error => showError(error.message)
  });

  const formikRef: React.Ref<FormikProps<GitopsData>> = React.useRef(null);
  function handleSubmit(values: GitopsData): void {
    if (gitopsDetails?.enabled) {
      if (gitopsType === GitopsValues.LOCAL) {
        disableGitops({ variables: { projectID: projectID } });
      } else {
        values &&
          updateGitops({
            variables: {
              projectID: projectID,
              configurations: {
                branch: values.branch,
                repoURL: values.repoURL,
                authType: values.authType,
                token: values.token ?? '',
                sshPrivateKey: values.sshPrivateKey ?? '',
                userName: values.userName ?? '',
                password: values.password ?? ''
              }
            }
          });
      }
    } else {
      if (gitopsType === GitopsValues.GITHUB) {
        values &&
          enableGitops({
            variables: {
              projectID: projectID,
              configurations: {
                branch: values.branch,
                repoURL: values.repoURL,
                authType: values.authType,
                token: values.token ?? '',
                sshPrivateKey: values.sshPrivateKey ?? '',
                userName: values.userName ?? '',
                password: values.password ?? ''
              }
            }
          });
      }
    }
  }

  return (
    <DefaultLayout
      headerToolbar={
        <Layout.Horizontal flex={{ distribution: 'space-between' }} style={{ gap: '0.5rem' }}>
          <RbacButton
            intent="primary"
            data-testid="gitops"
            iconProps={{ size: 10 }}
            text={getString('save')}
            permission={PermissionGroup.EDITOR}
            loading={
              loading.disableGitopsMutationLoading ||
              loading.enableGitopsMutationLoading ||
              loading.updateGitopsMutationLoading
            }
            onClick={() => formikRef.current?.handleSubmit()}
          />
          <Button
            disabled={false}
            variation={ButtonVariation.SECONDARY}
            text={getString('discard')}
            onClick={() => history.push(paths.toDashboard())}
          />
        </Layout.Horizontal>
      }
      title={getString('gitops')}
      breadcrumbs={[]}
    >
      <Loader loading={loading.getGitOpsDetailsLoading}>
        <Container
          padding={{ top: 'medium', right: 'xlarge', left: 'xlarge' }}
          height="100%"
          style={{ overflowY: 'auto' }}
        >
          <Formik<GitopsData>
            initialValues={initialValues}
            onSubmit={values => handleSubmit(values)}
            innerRef={formikRef}
          >
            {formikProps => {
              return (
                <Form className={css.formContainer}>
                  <RadioButtonGroup
                    name="type"
                    inline={false}
                    selectedValue={gitopsType}
                    className={css.radioButton}
                    options={[
                      {
                        label: (
                          <Layout.Vertical style={{ gap: '1rem' }}>
                            <Text
                              font={{ variation: FontVariation.BODY2_SEMI, weight: 'semi-bold' }}
                              color={Color.BLACK}
                            >
                              {getString('local')}
                            </Text>
                          </Layout.Vertical>
                        ),
                        value: GitopsValues.LOCAL
                      },
                      {
                        label: (
                          <Layout.Vertical style={{ gap: '0.5rem' }} width={'60%'}>
                            <Layout.Vertical style={{ gap: '0.25rem' }}>
                              <Text
                                font={{ variation: FontVariation.BODY2_SEMI, weight: 'semi-bold' }}
                                color={Color.BLACK}
                              >
                                {getString('githubRepo')}
                              </Text>
                            </Layout.Vertical>
                            {gitopsType === GitopsValues.GITHUB && (
                              <Layout.Vertical
                                flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}
                                className={css.subCard}
                              >
                                <FormInput.Text
                                  name="repoURL"
                                  label={
                                    <Text font={{ variation: FontVariation.FORM_LABEL }} margin={{ top: 'medium' }}>
                                      {getString('hubRepositoryURL')}
                                    </Text>
                                  }
                                  placeholder={getString('repoURLPlaceholder')}
                                />

                                <FormInput.Text
                                  name="branch"
                                  label={
                                    <Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('branch')}</Text>
                                  }
                                  placeholder={getString('repoBranchPlaceholder')}
                                />
                                <RadioButtonGroup
                                  name="authType"
                                  selectedValue={initialValues.authType ?? AuthType.TOKEN}
                                  label={
                                    <Text font={{ variation: FontVariation.FORM_LABEL }}>
                                      {getString('securityKeyType')}
                                    </Text>
                                  }
                                  inline={true}
                                  className={css.subRadioBtn}
                                  onChange={(e: FormEvent<HTMLInputElement>) => {
                                    formikProps.setFieldValue('authType', e.currentTarget.value);
                                  }}
                                  options={[
                                    {
                                      label: (
                                        <Text font={{ variation: FontVariation.FORM_LABEL }}>
                                          {getString('accessToken')}
                                        </Text>
                                      ),
                                      value: AuthType.TOKEN
                                    },
                                    {
                                      label: (
                                        <Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('ssh')}</Text>
                                      ),
                                      value: AuthType.SSH
                                    }
                                  ]}
                                />
                                {formikProps.values.authType === AuthType.TOKEN && (
                                  <FormInput.Text
                                    name="token"
                                    label={
                                      <Text font={{ variation: FontVariation.FORM_LABEL }} margin={{ top: 'medium' }}>
                                        {getString('accessToken')}
                                      </Text>
                                    }
                                    placeholder={getString('accessTokenPlaceholder')}
                                  />
                                )}
                                {formikProps.values.authType === AuthType.SSH && (
                                  <Layout.Vertical
                                    spacing={'small'}
                                    flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}
                                  >
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
                                      <Text
                                        font={{ variation: FontVariation.FORM_LABEL }}
                                        margin={{ bottom: 'xsmall' }}
                                      >
                                        {getString('sshKey')}
                                      </Text>
                                      <div className={css.inputGroup}>
                                        <InputGroup
                                          type="text"
                                          placeholder={getString('sshKey')}
                                          value={sshPublicKey}
                                          onChange={(e: FormEvent<HTMLInputElement>) => {
                                            setPublicSshKey(e.currentTarget.value);
                                            formikProps.setFieldValue('sshPublicKey', e.currentTarget.value);
                                          }}
                                          rightElement={
                                            <Container
                                              margin={{ left: 'small', right: 'xsmall' }}
                                              flex={{ justifyContent: 'center', alignItems: 'center' }}
                                              height="100%"
                                            >
                                              <CopyButton stringToCopy={sshPublicKey} />
                                            </Container>
                                          }
                                        />
                                      </div>

                                      <Layout.Horizontal spacing={'xsmall'} flex={{ alignItems: 'center' }}>
                                        <Icon name="info-message" size={15} />
                                        <Text font={{ variation: FontVariation.SMALL }}>
                                          {getString('sshKeyHelper')}
                                        </Text>
                                      </Layout.Horizontal>
                                    </div>
                                  </Layout.Vertical>
                                )}
                              </Layout.Vertical>
                            )}
                          </Layout.Vertical>
                        ),
                        value: GitopsValues.GITHUB
                      }
                    ]}
                    onChange={(e: FormEvent<HTMLInputElement>) => {
                      setGitopstype(e.currentTarget.value as GitopsValues);
                    }}
                  />
                </Form>
              );
            }}
          </Formik>
        </Container>
      </Loader>
    </DefaultLayout>
  );
}
