import {
  Button,
  ButtonVariation,
  Text,
  Layout,
  Container,
  RadioButtonGroup,
  FormInput,
  TextInput,
  useToaster
} from '@harnessio/uicore';
import React, { FormEvent } from 'react';
import { Color, FontVariation } from '@harnessio/design-system';
import { Form, Formik } from 'formik';
import { Icon } from '@harnessio/icons';
import DefaultLayout from '@components/DefaultLayout';
import RbacButton from '@components/RbacButton';
import { PermissionGroup } from '@models';
import { AuthType } from '@api/entities';
import CopyButton from '@components/CopyButton';
import { generateSSHKey } from '@api/core/chaoshubs/generateSSH';
import type { GitOpsData } from '@api/entities/gitops';
import css from './Gitops.module.scss';

enum GitopsValues {
  LOCAL = 'local',
  GITHUB = 'github'
}

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
  gitopsDetails: GitOpsData;
}

export default function GitopsView({ gitopsDetails }: GitopsViewProps): React.ReactElement {
  const initialValues: GitopsData = {
    branch: gitopsDetails.branch ?? '',
    repoURL: gitopsDetails.repoURL ?? '',
    authType: (gitopsDetails.authType as AuthType) ?? AuthType.TOKEN,
    token: gitopsDetails.token ?? '',
    sshPrivateKey: gitopsDetails.sshPrivateKey ?? ''
  };
  const [sshPublicKey, setPublicSshKey] = React.useState<string>('');
  const [gitopsType, setGitopstype] = React.useState<GitopsValues>(
    gitopsDetails.enabled ? GitopsValues.GITHUB : GitopsValues.LOCAL
  );
  const { showError } = useToaster();
  const [generateSSHKeyMutation] = generateSSHKey({
    onError: error => showError(error.message)
  });

  return (
    <DefaultLayout
      headerToolbar={
        <Layout.Horizontal flex={{ distribution: 'space-between' }} width="12%">
          <RbacButton
            intent="primary"
            data-testid="gitops"
            iconProps={{ size: 10 }}
            text="Save"
            permission={PermissionGroup.EDITOR}
          />
          <Button disabled={false} variation={ButtonVariation.SECONDARY} text="Discard" />
        </Layout.Horizontal>
      }
      title="Gitops"
      breadcrumbs={[]}
      //   subHeader={}
    >
      <Container
        padding={{ top: 'medium', right: 'xlarge', left: 'xlarge' }}
        height="100%"
        style={{ overflowY: 'auto' }}
      >
        <Formik initialValues={initialValues} onSubmit={() => console.log('')}>
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
                          <Text font={{ variation: FontVariation.BODY2_SEMI, weight: 'semi-bold' }} color={Color.BLACK}>
                            Locally in Litmus
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
                              GitHub repository
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
                                    Repository URL
                                  </Text>
                                }
                                placeholder="Enter repository URL"
                              />

                              <FormInput.Text
                                name="repoBranch"
                                label={<Text font={{ variation: FontVariation.FORM_LABEL }}>Branch</Text>}
                                placeholder="Enter repository branch"
                              />
                              <RadioButtonGroup
                                name="authType"
                                selectedValue={initialValues.authType ?? AuthType.TOKEN}
                                label={
                                  <Text font={{ variation: FontVariation.FORM_LABEL }}>Select Security Key Type</Text>
                                }
                                inline={true}
                                className={css.subRadioBtn}
                                // selectedValue={formikProps.values.authType}
                                onChange={(e: FormEvent<HTMLInputElement>) => {
                                  formikProps.setFieldValue('authType', e.currentTarget.value);
                                }}
                                options={[
                                  {
                                    label: <Text font={{ variation: FontVariation.FORM_LABEL }}>Access Token</Text>,
                                    value: AuthType.TOKEN
                                  },
                                  {
                                    label: <Text font={{ variation: FontVariation.FORM_LABEL }}>SSH</Text>,
                                    value: AuthType.SSH
                                  }
                                ]}
                              />
                              {formikProps.values.authType === AuthType.TOKEN && (
                                <FormInput.Text
                                  name="token"
                                  label={
                                    <Text font={{ variation: FontVariation.FORM_LABEL }} margin={{ top: 'medium' }}>
                                      Access Token
                                    </Text>
                                  }
                                  placeholder="Enter your Personal Acess Token"
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
                                    text="Generate New SSH Key"
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
                                          <Container
                                            flex={{ justifyContent: 'center', alignItems: 'center' }}
                                            height="100%"
                                          >
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
    </DefaultLayout>
  );
}
