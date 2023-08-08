import React from 'react';
import { Button, ButtonVariation, Container, FormInput, Layout, Text } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import { FontVariation } from '@harnessio/design-system';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import type { UseMutateFunction } from '@tanstack/react-query';
import { useStrings } from '@strings';
import type { UpdateDetailsMutationProps, UpdateDetailsOkResponse, User } from '@api/auth/index.ts';

interface EditUserViewProps {
  handleClose: () => void;
  userData: User | undefined;
  updateDetailsMutation: UseMutateFunction<
    UpdateDetailsOkResponse,
    unknown,
    UpdateDetailsMutationProps<never>,
    unknown
  >;
}
interface EditUserFormProps {
  name: string;
  email: string;
}

export default function EditUserView(props: EditUserViewProps): React.ReactElement {
  const { handleClose, userData, updateDetailsMutation } = props;
  const { getString } = useStrings();

  function manageNameCase(newName: string): string {
    const nameArray = newName.split(' ');
    const nameArrayCapitalized = nameArray.map(
      name => name.charAt(0).toUpperCase() + name.slice(1).toLocaleLowerCase()
    );
    return nameArrayCapitalized.join(' ');
  }

  function handleSubmit(values: EditUserFormProps): void {
    updateDetailsMutation({
      body: {
        name: manageNameCase(values.name),
        email: values.email.toLowerCase()
      }
    });
    handleClose();
  }

  function isUserDetailsUpdated(values: EditUserFormProps): boolean {
    return (
      (userData?.name ?? '').toLowerCase() === values.name.toLowerCase() &&
      (userData?.email ?? '').toLowerCase() === values.email.toLowerCase()
    );
  }

  return (
    <Layout.Vertical padding="medium" style={{ gap: '1rem' }}>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Text font={{ variation: FontVariation.H4 }}>{getString('editName')}</Text>
        <Icon name="cross" style={{ cursor: 'pointer' }} size={18} onClick={() => handleClose()} />
      </Layout.Horizontal>
      <Container>
        <Formik<EditUserFormProps>
          initialValues={{
            name: userData?.name ?? '',
            email: userData?.email ?? ''
          }}
          enableReinitialize
          onSubmit={values => handleSubmit(values)}
          validationSchema={Yup.object().shape({
            name: Yup.string()
              .trim()
              .matches(/^([A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff\s]*)$/gi, 'Name can only contain letters.')
              .required('Name is required in order to update.'),
            email: Yup.string().trim().email('Invalid email address.').required('Email is required in order to update.')
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
                      text={getString('confirm')}
                      onClick={() => formikProps.handleSubmit()}
                      disabled={isUserDetailsUpdated(formikProps.values)}
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
