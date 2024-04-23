import type { UseMutateFunction } from '@tanstack/react-query';
import React from 'react';
import { FontVariation } from '@harnessio/design-system';
import { Layout, Container, FormInput, ButtonVariation, Text, Button } from '@harnessio/uicore';
import { Formik, Form } from 'formik';
import { Icon } from '@harnessio/icons';
import * as Yup from 'yup';
import type { CreateProjectErrorResponse, CreateProjectMutationProps, CreateProjectOkResponse } from '@api/auth';
import { useStrings } from '@strings';

interface CreateProjectViewProps {
  createProjectMutation: UseMutateFunction<
    CreateProjectOkResponse,
    CreateProjectErrorResponse,
    CreateProjectMutationProps<never>
  >;
  createProjectMutationLoading: boolean;
  handleClose: () => void;
}

interface CreateProjectFormProps {
  projectName: string;
  projectDescription: string;
  tags: string[];
}

export default function CreateProjectView(props: CreateProjectViewProps): React.ReactElement {
  const { createProjectMutation, createProjectMutationLoading, handleClose } = props;
  const { getString } = useStrings();

  function handleSubmit(values: CreateProjectFormProps): void {
    createProjectMutation(
      {
        body: {
          projectName: values.projectName
          // projectDescription: values.projectDescription,
          // tags: values.tags,
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
    <Layout.Vertical padding="medium" style={{ gap: '1rem' }}>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Text font={{ variation: FontVariation.H4 }}>{'Create Project'}</Text>
      </Layout.Horizontal>
      <Container>
        <Formik<CreateProjectFormProps>
          initialValues={{
            projectName: '',
            projectDescription: '',
            tags: []
          }}
          onSubmit={values => handleSubmit(values)}
          validationSchema={Yup.object().shape({
            projectName: Yup.string(),
            projectDescription: Yup.string().required(getString('usernameIsRequired'))
          })}
        >
          {formikProps => {
            return (
              <Form style={{ height: '100%' }}>
                <Layout.Vertical style={{ gap: '2rem' }}>
                  <Container>
                    <FormInput.Text
                      name="projectName"
                      placeholder={getString('enterYourName')}
                      label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('name')}</Text>}
                    />
                    <FormInput.Text
                      name="projectDescription"
                      placeholder={getString('projectDescription')}
                      label={
                        <Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('projectDescription')}</Text>
                      }
                    />
                  </Container>
                  <Layout.Horizontal style={{ gap: '1rem' }}>
                    <Button
                      type="submit"
                      variation={ButtonVariation.PRIMARY}
                      text={createProjectMutationLoading ? <Icon name="loading" size={16} /> : getString('confirm')}
                      loading={createProjectMutationLoading || formikProps.isSubmitting}
                      disabled={createProjectMutationLoading || Object.keys(formikProps.errors).length > 0}
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
