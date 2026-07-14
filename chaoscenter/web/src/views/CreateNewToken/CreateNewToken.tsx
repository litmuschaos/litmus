import type { UseMutateFunction } from '@tanstack/react-query';
import React from 'react';
import { FontVariation } from '@harnessio/design-system';
import { Layout, Container, FormInput, ButtonVariation, Text, Button, OverlaySpinner } from '@harnessio/uicore';
import { Formik, Form } from 'formik';
import { Icon } from '@harnessio/icons';
import * as Yup from 'yup';
import type { CreateApiTokenMutationProps, CreateApiTokenResponse, ErrorModel } from '@api/auth';
import { useStrings } from '@strings';
import { useAppStore } from '@context';

interface CreateNewTokenViewProps {
  createNewTokenMutation: UseMutateFunction<
    CreateApiTokenResponse,
    ErrorModel,
    CreateApiTokenMutationProps<never>,
    unknown
  >;
  createNewTokenMutationLoading: boolean;
  handleClose: () => void;
}

interface CreateNewTokenFormProps {
  name: string;
  daysUntilExpiration: number;
}

export default function CreateNewTokenView(props: CreateNewTokenViewProps): React.ReactElement {
  const { createNewTokenMutation, createNewTokenMutationLoading, handleClose } = props;
  const { getString } = useStrings();
  const { currentUserInfo } = useAppStore();

  function handleSubmit(values: CreateNewTokenFormProps): void {
    createNewTokenMutation(
      {
        body: {
          name: values.name,
          user_id: currentUserInfo?.ID ?? '',
          days_until_expiration: values.daysUntilExpiration
        }
      },
      {
        onSuccess: () => {
          handleClose();
        }
      }
    );
  }

  return (
    <OverlaySpinner show={createNewTokenMutationLoading}>
      <Layout.Vertical padding="medium" style={{ gap: '1rem' }}>
        <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Text font={{ variation: FontVariation.H4 }}>{getString('createNewToken')}</Text>
          <Icon name="cross" style={{ cursor: 'pointer' }} size={18} onClick={() => handleClose()} />
        </Layout.Horizontal>
        <Container>
          <Formik<CreateNewTokenFormProps>
            initialValues={{
              name: '',
              daysUntilExpiration: 30
            }}
            onSubmit={values => handleSubmit(values)}
            validationSchema={Yup.object().shape({
              name: Yup.string().required(getString('nameIsARequiredField'))
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
                      <FormInput.Select
                        name="daysUntilExpiration"
                        label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('expiresIn')}</Text>}
                        items={[
                          { value: 30, label: getString('days', { count: 30 }) },
                          { value: 90, label: getString('days', { count: 90 }) },
                          { value: 180, label: getString('days', { count: 180 }) },
                          { value: 365, label: getString('days', { count: 365 }) },
                          { value: 36500, label: getString('noExpiration') }
                        ]}
                      />
                    </Container>
                    <Layout.Vertical style={{ gap: '0.5rem' }}>
                      <Layout.Horizontal style={{ gap: '1rem' }}>
                        <Button
                          type="submit"
                          variation={ButtonVariation.PRIMARY}
                          text={getString('confirm')}
                          loading={createNewTokenMutationLoading || formikProps.isSubmitting}
                          disabled={Object.keys(formikProps.errors).length > 0}
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
    </OverlaySpinner>
  );
}
