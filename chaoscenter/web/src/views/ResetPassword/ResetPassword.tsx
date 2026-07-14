import React from 'react';
import { FontVariation } from '@harnessio/design-system';
import { Layout, Container, ButtonVariation, Text, Button } from '@harnessio/uicore';
import type { UseMutateFunction } from '@tanstack/react-query';
import { Formik, Form } from 'formik';
import { Icon } from '@harnessio/icons';
import * as Yup from 'yup';
import type { ResetPasswordOkResponse, ResetPasswordMutationProps } from '@api/auth';
import { useStrings } from '@strings';
import { PASSWORD_REGEX } from '@constants/validation';
import PasswordInput from '@components/PasswordInput';

interface ResetPasswordViewProps {
  handleClose: () => void;
  resetPasswordMutation: UseMutateFunction<
    ResetPasswordOkResponse,
    unknown,
    ResetPasswordMutationProps<never>,
    unknown
  >;
  username: string | undefined;
  resetPasswordMutationLoading: boolean;
}
interface ResetPasswordFormProps {
  password: string;
  reEnterPassword: string;
}

export default function ResetPasswordView(props: ResetPasswordViewProps): React.ReactElement {
  const { handleClose, resetPasswordMutation, username, resetPasswordMutationLoading } = props;
  const { getString } = useStrings();

  function isSubmitButtonDisabled(values: ResetPasswordFormProps): boolean {
    if (values.password === '' || values.reEnterPassword === '') {
      return true;
    }
    if (values.password !== values.reEnterPassword) {
      return true;
    }
    return false;
  }

  function doesNewPasswordMatch(values: ResetPasswordFormProps): boolean {
    if (values.password !== values.reEnterPassword) {
      return false;
    }
    return true;
  }

  function handleSubmit(values: ResetPasswordFormProps): void {
    doesNewPasswordMatch(values) &&
      username &&
      resetPasswordMutation(
        {
          body: {
            username: username,
            oldPassword: '',
            newPassword: values.password
          }
        },
        {
          onSuccess: () => handleClose()
        }
      );
  }

  return (
    <Layout.Vertical padding="medium" style={{ gap: '1rem' }}>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Text font={{ variation: FontVariation.H4 }}>{getString('resetPassword')}</Text>
        <Icon name="cross" style={{ cursor: 'pointer' }} size={18} onClick={() => handleClose()} />
      </Layout.Horizontal>
      <Container>
        <Formik<ResetPasswordFormProps>
          initialValues={{
            password: '',
            reEnterPassword: ''
          }}
          onSubmit={values => handleSubmit(values)}
          validationSchema={Yup.object().shape({
            password: Yup.string()
              .required(getString('enterNewPassword'))
              .min(8, getString('fieldMinLength', { length: 8 }))
              .max(16, getString('fieldMaxLength', { length: 16 }))
              .matches(PASSWORD_REGEX, getString('passwordValidation')),
            reEnterPassword: Yup.string()
              .required(getString('reEnterNewPassword'))
              .oneOf([Yup.ref('password'), null], getString('passwordsDoNotMatch'))
          })}
        >
          {formikProps => {
            return (
              <Form style={{ height: '100%' }}>
                <Layout.Vertical style={{ gap: '2rem' }}>
                  <Layout.Vertical width="100%" style={{ gap: '0.5rem' }}>
                    <PasswordInput
                      name="password"
                      placeholder={getString('newPassword')}
                      label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('newPassword')}</Text>}
                    />
                    <PasswordInput
                      name="reEnterPassword"
                      placeholder={getString('reEnterNewPassword')}
                      label={
                        <Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('reEnterNewPassword')}</Text>
                      }
                    />
                  </Layout.Vertical>
                  <Layout.Horizontal style={{ gap: '1rem' }}>
                    <Button
                      type="submit"
                      variation={ButtonVariation.PRIMARY}
                      text={resetPasswordMutationLoading ? <Icon name="loading" size={16} /> : getString('confirm')}
                      disabled={resetPasswordMutationLoading || isSubmitButtonDisabled(formikProps.values)}
                      onClick={() => formikProps.handleSubmit()}
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
