import React from 'react';
import { FormInput, Formik, Button, Text, Container } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import { Color } from '@harnessio/design-system';
import { Form } from 'formik';
import AuthLayout from '@components/AuthLayout/AuthLayout';
import { useStrings } from '@strings';

interface LoginForm {
  username: string;
  password: string;
}

interface LoginPageViewProps {
  handleSubmit: (data: LoginForm) => void;
  loading: boolean;
}

export default function LoginPageView({ handleSubmit, loading }: LoginPageViewProps): React.ReactElement {
  const { getString } = useStrings();

  return (
    <>
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
            onSubmit={handleSubmit}
          >
            <Form>
              <FormInput.Text name="username" label={`Username`} disabled={loading} />
              <FormInput.Text name="password" label={'Password'} inputGroup={{ type: 'password' }} disabled={loading} />
              <Button type="submit" intent="primary" loading={loading} disabled={loading} width="100%">
                {'Sign in'}
              </Button>
            </Form>
          </Formik>
        </Container>
      </AuthLayout>
    </>
  );
}
