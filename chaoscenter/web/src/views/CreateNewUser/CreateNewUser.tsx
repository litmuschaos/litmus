import type { UseMutateFunction } from '@tanstack/react-query';
import React from 'react';
import { FontVariation } from '@harnessio/design-system';
import { Layout, Container, FormInput, ButtonVariation, Text, Button } from '@harnessio/uicore';
import { Formik, Form } from 'formik';
import { Icon } from '@harnessio/icons';
import * as Yup from 'yup';
import type { CreateUserMutationProps, User } from '@api/auth';
import { useStrings } from '@strings';

interface CreateNewUserViewProps {
  createNewUserMutation: UseMutateFunction<User, unknown, CreateUserMutationProps<never>, unknown>;
  createNewUserMutationLoading: boolean;
  handleClose: () => void;
}

interface CreateNewUserFormProps {
  name: string;
  email: string;
  username: string;
  password: string;
  reEnterPassword: string;
}

export default function CreateNewUserView(props: CreateNewUserViewProps): React.ReactElement {
  const { createNewUserMutation, createNewUserMutationLoading, handleClose } = props;
  const { getString } = useStrings();

  function handleSubmit(values: CreateNewUserFormProps): void {
    createNewUserMutation(
      {
        body: {
          name: values.name,
          email: values.email,
          username: values.username,
          password: values.password,
          role: 'user'
        }
      },
      {
        onSuccess: () => {
          handleClose();
        }
      }
    );
  }

  return (
    <Layout.Vertical padding="medium" style={{ gap: '1rem' }}>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Text font={{ variation: FontVariation.H4 }}>{getString('createNewUser')}</Text>
        <Icon name="cross" style={{ cursor: 'pointer' }} size={18} onClick={() => handleClose()} />
      </Layout.Horizontal>
      <Container>
        <Formik<CreateNewUserFormProps>
          initialValues={{
            name: '',
            email: '',
            username: '',
            password: '',
            reEnterPassword: ''
          }}
          onSubmit={values => handleSubmit(values)}
          validationSchema={Yup.object().shape({
            name: Yup.string(),
            email: Yup.string().email(getString('invalidEmailText')).required(getString('emailIsRequired')),
            username: Yup.string().required(getString('usernameIsRequired')),
            password: Yup.string().required(getString('passwordIsRequired')),
            reEnterPassword: Yup.string()
              .required(getString('reEnterPassword'))
              .oneOf([Yup.ref('password'), null], getString('passwordsDoNotMatch'))
          })}
        >
          {formikProps => {
            return (
              <Form style={{ height: '100%' }}>
                <Layout.Vertical style={{ gap: '2rem' }}>
                  <Container>
                    <FormInput.Text
                      name="name"
                      placeholder={getString('enterYourName')}
                      label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('name')}</Text>}
                    />
                    <FormInput.Text
                      name="email"
                      placeholder={getString('enterYourEmail')}
                      label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('email')}</Text>}
                    />
                    <Text font={{ variation: FontVariation.H5 }} margin={{ bottom: 'medium', top: 'large' }}>
                      {getString('authentication')}
                    </Text>
                    <FormInput.Text
                      name="username"
                      placeholder={getString('enterYourUsername')}
                      label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('username')}</Text>}
                    />
                    <FormInput.Text
                      name="password"
                      inputGroup={{ type: 'password' }}
                      placeholder={getString('enterYourPassword')}
                      label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('password')}</Text>}
                    />
                    <FormInput.Text
                      name="reEnterPassword"
                      inputGroup={{ type: 'password' }}
                      placeholder={getString('reEnterYourPassword')}
                      label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('confirmPassword')}</Text>}
                    />
                  </Container>
                  <Layout.Horizontal style={{ gap: '1rem' }}>
                    <Button
                      type="submit"
                      variation={ButtonVariation.PRIMARY}
                      text={createNewUserMutationLoading ? <Icon name="loading" size={16} /> : getString('confirm')}
                      loading={createNewUserMutationLoading || formikProps.isSubmitting}
                      disabled={createNewUserMutationLoading || Object.keys(formikProps.errors).length > 0}
                      style={{ minWidth: '90px' }}
                    />
                    <Button
                      variation={ButtonVariation.TERTIARY}
                      text={getString('cancel')}
                      onClick={() => handleClose()}
                    />
                  </Layout.Horizontal>
                </Layout.Vertical>
              </Form>
            );
          }}
        </Formik>
      </Container>
    </Layout.Vertical>
  );
}
