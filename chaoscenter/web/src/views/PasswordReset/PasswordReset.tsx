import { Color, FontVariation } from '@harnessio/design-system';
import { Button, ButtonVariation, Container, Layout, Text } from '@harnessio/uicore';
import React from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Icon } from '@harnessio/icons';
import { UseMutateFunction } from '@tanstack/react-query';
import { useStrings } from '@strings';
import { PASSWORD_REGEX } from '@constants/validation';
import { User, UpdatePasswordMutationProps, ResponseMessageResponse, UpdatePasswordErrorResponse } from '@api/auth';
import PasswordInput from '@components/PasswordInput';
import litmusIcon from '@images/litmusIcon.svg';
import css from './PasswordReset.module.scss';

interface PasswordResetViewProps {
  currentUserData: User | undefined;
  updatePasswordMutation: UseMutateFunction<
    ResponseMessageResponse,
    UpdatePasswordErrorResponse,
    UpdatePasswordMutationProps<never>,
    unknown
  >;
  loading: {
    getUser: boolean;
    updatePassword: boolean;
  };
}

interface AccountPasswordChangeFormProps {
  oldPassword: string;
  newPassword: string;
  reEnterNewPassword: string;
}

const PasswordResetView = (props: PasswordResetViewProps): React.ReactElement => {
  const { currentUserData, updatePasswordMutation, loading } = props;
  const { getString } = useStrings();

  function handleSubmit(values: AccountPasswordChangeFormProps): void {
    updatePasswordMutation({
      body: {
        username: currentUserData?.username ?? '',
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      }
    });
  }

  return (
    <Layout.Vertical width="100%" height="100vh" background={Color.PRIMARY_6}>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'center' }} padding="medium">
        <img src={litmusIcon} alt="Litmus Icon" width={50} height={50} />
      </Layout.Horizontal>
      <Container height="calc(100% - 82px)" flex={{ align: 'center-center' }}>
        <Layout.Vertical
          padding="medium"
          style={{ gap: '1rem' }}
          background={Color.WHITE}
          width={500}
          className={css.formContainer}
        >
          <Text font={{ variation: FontVariation.H4 }}>{getString('updatePassword')}</Text>
          <Container>
            <Formik<AccountPasswordChangeFormProps>
              initialValues={{
                oldPassword: '',
                newPassword: '',
                reEnterNewPassword: ''
              }}
              onSubmit={handleSubmit}
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
                            <Text font={{ variation: FontVariation.FORM_LABEL }}>
                              {getString('reEnterNewPassword')}
                            </Text>
                          }
                        />
                      </Layout.Vertical>
                      <Layout.Horizontal width="100%" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                        <Button
                          type="submit"
                          variation={ButtonVariation.PRIMARY}
                          text={loading.updatePassword ? <Icon name="loading" size={16} /> : getString('confirm')}
                          disabled={loading.updatePassword || Object.keys(formikProps.errors).length > 0}
                          style={{ minWidth: '90px' }}
                        />
                      </Layout.Horizontal>
                    </Layout.Vertical>
                  </Form>
                );
              }}
            </Formik>
          </Container>
        </Layout.Vertical>
      </Container>
    </Layout.Vertical>
  );
};

export default PasswordResetView;
