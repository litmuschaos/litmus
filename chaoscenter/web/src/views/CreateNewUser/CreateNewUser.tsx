import type { UseMutateFunction } from '@tanstack/react-query';
import React from 'react';
import { Color, FontVariation } from '@harnessio/design-system';
import { Layout, Container, FormInput, ButtonVariation, Text, Button } from '@harnessio/uicore';
import { Formik, Form, FormikProps } from 'formik';
import { Icon } from '@harnessio/icons';
import * as Yup from 'yup';
import type { CreateUserMutationProps, User } from '@api/auth/index.ts';
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
  function isSubmitButtonDisabled(formikProps: FormikProps<CreateNewUserFormProps>): boolean {
    return (
      formikProps.values.name.length === 0 ||
      formikProps.values.email.length === 0 ||
      formikProps.values.username.length === 0 ||
      formikProps.values.password.length === 0 ||
      formikProps.values.reEnterPassword.length === 0 ||
      formikProps.errors.name !== undefined ||
      formikProps.errors.email !== undefined ||
      formikProps.errors.username !== undefined ||
      formikProps.errors.password !== undefined ||
      formikProps.errors.reEnterPassword !== undefined ||
      formikProps.values.password !== formikProps.values.reEnterPassword
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
          validationSchema={Yup.object().shape({})}
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
                  <Layout.Vertical style={{ gap: '0.5rem' }}>
                    <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_700}>
                      {getString('userCreateModalBottomText')}
                    </Text>
                    <Layout.Horizontal style={{ gap: '1rem' }}>
                      <Button
                        type="submit"
                        variation={ButtonVariation.PRIMARY}
                        text={getString('confirm')}
                        loading={createNewUserMutationLoading || formikProps.isSubmitting}
                        disabled={isSubmitButtonDisabled(formikProps)}
                      />
                      <Button
                        variation={ButtonVariation.TERTIARY}
                        text={getString('cancel')}
                        onClick={() => handleClose()}
                      />
                    </Layout.Horizontal>
                  </Layout.Vertical>
                </Layout.Vertical>
              </Form>
            );
          }}
        </Formik>
      </Container>
    </Layout.Vertical>
  );
}
