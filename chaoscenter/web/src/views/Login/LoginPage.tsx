import React from 'react';
import { Formik, Button, Text, Container, Layout } from '@harnessio/uicore';
import { Color } from '@harnessio/design-system';
import { Form } from 'formik';
import * as Yup from 'yup';
import type { UseMutateFunction } from '@tanstack/react-query';
import AuthLayout from '@components/AuthLayout/AuthLayout';
import { useStrings } from '@strings';
import type { ErrorModel, LoginMutationProps, LoginResponse, GetCapabilitiesOkResponse } from '@api/auth';
import PasswordInput from '@components/PasswordInput';
import UserNameInput from '@components/UserNameInput';
import litmusIcon from '@images/litmusIcon.svg';

interface LoginForm {
  username: string;
  password: string;
}

interface LoginPageViewProps {
  handleLogin: UseMutateFunction<LoginResponse, ErrorModel, LoginMutationProps<never>, unknown>;
  loading: boolean;
  capabilities?: GetCapabilitiesOkResponse;
}

export const LoginPageView = ({ handleLogin, loading, capabilities }: LoginPageViewProps): React.ReactElement => {
  const { getString } = useStrings();

  return (
    <AuthLayout>
      <img src={litmusIcon} alt="Litmus Icon" width={60} height={60} />
      <Text font={{ size: 'large', weight: 'bold' }} color={Color.BLACK}>
        {getString('welcomeToLitmus')}
      </Text>
      <Text font={{ size: 'medium' }} color={Color.BLACK} margin={{ top: 'xsmall' }}>
        {getString('loginDescription')}
      </Text>

      <Container margin={{ top: 'xxxlarge' }}>
        <Formik<LoginForm>
          initialValues={{ username: '', password: '' }}
          formName="loginPageForm"
          validationSchema={Yup.object().shape({
            username: Yup.string().required(getString('isRequired', { field: getString('username') })),
            password: Yup.string().required(getString('isRequired', { field: getString('password') }))
          })}
          onSubmit={data =>
            handleLogin({
              body: data
            })
          }
        >
          <Form>
            <Layout.Vertical style={{ gap: '1.5rem' }}>
              <Layout.Vertical style={{ gap: '1rem' }} width={'100%'}>
                <UserNameInput
                  name="username"
                  label={getString('username')}
                  placeholder={getString('enterYourUsername')}
                  disabled={loading}
                />
                <PasswordInput
                  name="password"
                  label={getString('password')}
                  placeholder={getString('enterYourPassword')}
                  disabled={loading}
                />
              </Layout.Vertical>
              <Button type="submit" intent="primary" loading={loading} disabled={loading} width="100%">
                {getString('signIn')}
              </Button>
            </Layout.Vertical>
          </Form>
        </Formik>
      </Container>
      {capabilities?.dex?.enabled && (
        <Button
          type="submit"
          intent="primary"
          href="/auth/dex/login"
          loading={loading}
          width="100%"
          margin={{ top: 'xxxlarge' }}
          icon="cloud-sso"
          iconProps={{ padding: { right: 'small' } }}
        >
          {getString('signInWithDex')}
        </Button>
      )}
    </AuthLayout>
  );
};
