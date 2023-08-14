import { FontVariation } from '@harnessio/design-system';
import { Button, ButtonVariation, Container, FormInput, Layout, Text } from '@harnessio/uicore';
import React from 'react';
import { Icon } from '@harnessio/icons';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import type { UseMutateFunction } from '@tanstack/react-query';
import { useStrings } from '@strings';
import type { UpdatePasswordMutationProps, UpdatePasswordOkResponse } from '@api/auth';

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
          onSuccess: () => handleClose()
        }
      );
  }

  return (
    <Layout.Vertical padding="medium" style={{ gap: '1rem' }}>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Text font={{ variation: FontVariation.H4 }}>{getString('udpatePassword')}</Text>
        <Icon name="cross" style={{ cursor: 'pointer' }} size={18} onClick={() => handleClose()} />
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
            newPassword: Yup.string().required(getString('enterNewPassword')),
            reEnterNewPassword: Yup.string().required(getString('reEnterNewPassword'))
          })}
        >
          {formikProps => {
            return (
              <Form style={{ height: '100%' }}>
                <Layout.Vertical style={{ gap: '2rem' }}>
                  <Container>
                    <FormInput.Text
                      name="oldPassword"
                      placeholder={getString('oldPassword')}
                      inputGroup={{ type: 'password' }}
                      label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('oldPassword')}</Text>}
                    />
                    <FormInput.Text
                      name="newPassword"
                      placeholder={getString('newPassword')}
                      inputGroup={{ type: 'password' }}
                      label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('newPassword')}</Text>}
                    />
                    <FormInput.Text
                      name="reEnterNewPassword"
                      placeholder={getString('reEnterNewPassword')}
                      inputGroup={{ type: 'password' }}
                      label={
                        <Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('reEnterNewPassword')}</Text>
                      }
                    />
                  </Container>
                  <Layout.Horizontal style={{ gap: '1rem' }}>
                    <Button
                      type="submit"
                      variation={ButtonVariation.PRIMARY}
                      text={getString('confirm')}
                      loading={updatePasswordMutationLoading}
                      disabled={isSubmitButtonDisabled(formikProps.values)}
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
