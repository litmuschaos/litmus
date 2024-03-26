import { FontVariation } from '@harnessio/design-system';
import { Button, ButtonVariation, Container, FormInput, Layout, Text } from '@harnessio/uicore';
import React from 'react';
import { Icon } from '@harnessio/icons';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import type { UseMutateFunction } from '@tanstack/react-query';
import { useStrings } from '@strings';
import type { UpdateDetailsMutationProps, UpdateDetailsOkResponse, User } from '@api/auth';

interface AccountDetailsChangeViewProps {
  handleClose: () => void;
  currentUser: User | undefined;
  updateDetailsMutation: UseMutateFunction<
    UpdateDetailsOkResponse,
    unknown,
    UpdateDetailsMutationProps<never>,
    unknown
  >;
  updateDetailsMutationLoading: boolean;
}
interface AccountDetailsChangeFormProps {
  name: string;
  email: string;
}

export default function AccountDetailsChangeView(props: AccountDetailsChangeViewProps): React.ReactElement {
  const { handleClose, currentUser, updateDetailsMutation, updateDetailsMutationLoading } = props;
  const { getString } = useStrings();

  function manageNameCase(newName: string): string {
    const nameArray = newName.split(' ');
    const nameArrayCapitalized = nameArray.map(
      name => name.charAt(0).toUpperCase() + name.slice(1).toLocaleLowerCase()
    );
    return nameArrayCapitalized.join(' ');
  }

  function handleSubmit(values: AccountDetailsChangeFormProps): void {
    updateDetailsMutation({
      body: {
        name: manageNameCase(values.name),
        email: values.email.toLowerCase()
      }
    });
    handleClose();
  }

  function isUserDetailsUpdated(values: AccountDetailsChangeFormProps): boolean {
    return (
      (currentUser?.name ?? '').toLowerCase() === values.name.toLowerCase() &&
      (currentUser?.email ?? '').toLowerCase() === values.email.toLowerCase()
    );
  }

  return (
    <Layout.Vertical padding="medium" style={{ gap: '1rem' }}>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Text font={{ variation: FontVariation.H4 }}>{getString('editName')}</Text>
        <Icon name="cross" style={{ cursor: 'pointer' }} size={18} onClick={() => handleClose()} />
      </Layout.Horizontal>
      <Container>
        <Formik<AccountDetailsChangeFormProps>
          initialValues={{
            name: currentUser?.name ?? '',
            email: currentUser?.email ?? ''
          }}
          onSubmit={values => handleSubmit(values)}
          validationSchema={Yup.object().shape({
            name: Yup.string()
              .trim()
              .matches(/^[a-zA-Z ]*$/, getString('nameVaidText'))
              .required(getString('nameIsRequired')),
            email: Yup.string().trim().email(getString('invalidEmailText')).required(getString('emailIsRequired'))
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
                  </Container>
                  <Layout.Horizontal style={{ gap: '1rem' }}>
                    <Button
                      type="submit"
                      variation={ButtonVariation.PRIMARY}
                      text={updateDetailsMutationLoading ? <Icon name="loading" size={16} /> : getString('confirm')}
                      loading={updateDetailsMutationLoading}
                      disabled={updateDetailsMutationLoading || isUserDetailsUpdated(formikProps.values)}
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
