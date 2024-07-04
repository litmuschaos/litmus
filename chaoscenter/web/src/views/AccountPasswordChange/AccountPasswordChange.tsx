import { FontVariation } from '@harnessio/design-system';
import { Button, ButtonVariation, Container, Layout, Text, useToaster } from '@harnessio/uicore';
import React from 'react';
import { Icon } from '@harnessio/icons';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import type { UseMutateFunction } from '@tanstack/react-query';
import { useStrings } from '@strings';
import type { UpdatePasswordMutationProps, UpdatePasswordOkResponse } from '@api/auth';
import { PASSWORD_REGEX } from '@constants/validation';
import PasswordInput from '@components/PasswordInput';

interface AccountPasswordChangeViewProps {
  handleClose: () => void;
  username: string | undefined;
  updatePasswordMutation: UseMutateFunction<
    UpdatePasswordOkResponse,
    unknown,
    UpdatePasswordMutationProps<never>,
    unknown
  >;
  updatePasswordMutationLoading: boolean;
}
interface AccountPasswordChangeFormProps {
  oldPassword: string;
  newPassword: string;
  reEnterNewPassword: string;
}

export default function AccountPasswordChangeView(props: AccountPasswordChangeViewProps): React.ReactElement {
  const { handleClose, updatePasswordMutation, updatePasswordMutationLoading, username } = props;
  const { getString } = useStrings();
  const { showError } = useToaster();

  function isSubmitButtonDisabled(values: AccountPasswordChangeFormProps): boolean {
    if (values.oldPassword === '' || values.newPassword === '' || values.reEnterNewPassword === '') {
      return true;
    }
    if (values.newPassword !== values.reEnterNewPassword) {
      return true;
    }
    return false;
  }
  function doesNewPasswordMatch(values: AccountPasswordChangeFormProps): boolean {
    if (values.newPassword !== values.reEnterNewPassword) {
      return false;
    }
    return true;
  }

  function handleSubmit(values: AccountPasswordChangeFormProps): void {
    doesNewPasswordMatch(values) &&
      updatePasswordMutation(
        {
          body: {
            username: username ?? '',
            oldPassword: values.oldPassword,
            newPassword: values.newPassword
          }
        },
        {
          onError: () => showError(getString('passwordsDoNotMatch')),
          onSuccess: () => handleClose()
        }
      );
  }

  return (
    <Layout.Vertical padding="medium" style={{ gap: '1rem' }}>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Text font={{ variation: FontVariation.H4 }}>{getString('updatePassword')}</Text>
        <Icon name="cross" style={{ cursor: 'pointer' }} size={18} onClick={handleClose} />
      </Layout.Horizontal>
      <Container>
        <Formik<AccountPasswordChangeFormProps>
          initialValues={{
            oldPassword: '',
            newPassword: '',
            reEnterNewPassword: ''
          }}
          onSubmit={values => handleSubmit(values)}
          validationSchema={Yup.object().shape({
            oldPassword: Yup.string().required(getString('enterOldPassword')),
            newPassword: Yup.string()
              .required(getString('enterNewPassword'))
              .min(8, getString('fieldMinLength', { length: 8 }))
              .max(16, getString('fieldMaxLength', { length: 16 }))
              .matches(PASSWORD_REGEX, getString('passwordValidation')),
            reEnterNewPassword: Yup.string()
              .required(getString('reEnterNewPassword'))
              .oneOf([Yup.ref('newPassword'), null], getString('passwordsDoNotMatch'))
          })}
        >
          {formikProps => {
            return (
              <Form style={{ height: '100%' }}>
                <Layout.Vertical style={{ gap: '2rem' }}>
                  <Layout.Vertical width="100%" style={{ gap: '0.5rem' }}>
                    <PasswordInput
                      name="oldPassword"
                      placeholder={getString('oldPassword')}
                      label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('oldPassword')}</Text>}
                    />
                    <PasswordInput
                      name="newPassword"
                      placeholder={getString('newPassword')}
                      label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('newPassword')}</Text>}
                    />
                    <PasswordInput
                      name="reEnterNewPassword"
                      placeholder={getString('reEnterNewPassword')}
                      label={
                        <Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('reEnterNewPassword')}</Text>
                      }
                    />
                  </Layout.Vertical>
                  <Layout.Horizontal style={{ gap: '1rem' }} width="100%">
                    <Button
                      type="submit"
                      variation={ButtonVariation.PRIMARY}
                      text={updatePasswordMutationLoading ? <Icon name="loading" size={16} /> : getString('confirm')}
                      loading={updatePasswordMutationLoading}
                      disabled={updatePasswordMutationLoading || isSubmitButtonDisabled(formikProps.values)}
                      style={{ minWidth: '90px' }}
                    />
                    <Button variation={ButtonVariation.TERTIARY} text={getString('cancel')} onClick={handleClose} />
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
