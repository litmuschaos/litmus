import React from 'react';
import { Formik, Button, Text, Container, Layout } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import { Color } from '@harnessio/design-system';
import { Form } from 'formik';
import type { UseMutateFunction } from '@tanstack/react-query';
import AuthLayout from '@components/AuthLayout/AuthLayout';
import { useStrings } from '@strings';
import type { ErrorModel, LoginMutationProps, LoginResponse } from '@api/auth';
import PassowrdInput from '@components/PasswordInput';
import UserNameInput from '@components/UserNameInput';

interface LoginForm {
  username: string;
  password: string;
}

interface LoginPageViewProps {
  handleLogin: UseMutateFunction<LoginResponse, ErrorModel, LoginMutationProps<never>, unknown>;
  loading: boolean;
}

export default function LoginPageView({ handleLogin, loading }: LoginPageViewProps): React.ReactElement {
  const { getString } = useStrings();

  return (
    <AuthLayout>
      <Icon name="chaos-litmuschaos" size={60} margin={{ bottom: 'medium' }} />
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
                <PassowrdInput
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
    </AuthLayout>
  );
}
