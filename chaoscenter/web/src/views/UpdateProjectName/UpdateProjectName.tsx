import type { UseMutateFunction } from '@tanstack/react-query';
import React from 'react';
import { Button, ButtonVariation, Container, FormInput, Layout, Text } from '@harnessio/uicore';
import { FontVariation } from '@harnessio/design-system';
import { Form, Formik } from 'formik';
import { Icon } from '@harnessio/icons';
import * as Yup from 'yup';
import type { UpdateProjectNameMutationProps, UpdateProjectNameOkResponse } from '@api/auth';
import { useStrings } from '@strings';

interface UpdateProjectNameViewProps {
  projectDetails: {
    projectID: string | undefined;
    projectName: string | undefined;
  };
  updateProjectNameMutation: UseMutateFunction<
    UpdateProjectNameOkResponse,
    unknown,
    UpdateProjectNameMutationProps<never>,
    unknown
  >;
  updateProjectNameMutationLoading: boolean;
  handleClose: () => void;
}

interface UpdateProjectNameFormProps {
  name: string;
}

export default function UpdateProjectNameView(props: UpdateProjectNameViewProps): React.ReactElement {
  const { projectDetails, updateProjectNameMutation, updateProjectNameMutationLoading, handleClose } = props;
  const { getString } = useStrings();

  function handleSubmit(values: UpdateProjectNameFormProps): void {
    updateProjectNameMutation({
      body: {
        projectID: projectDetails.projectID ?? '',
        projectName: values.name
      }
    });
    handleClose();
  }

  function isProjectNameDifferent(values: UpdateProjectNameFormProps): boolean {
    return (projectDetails.projectName ?? '').toLowerCase() === values.name.toLowerCase();
  }

  return (
    <Layout.Vertical padding="medium" style={{ gap: '1rem' }}>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Text font={{ variation: FontVariation.H4 }}>{getString('editProjectName')}</Text>
        <Icon name="cross" style={{ cursor: 'pointer' }} size={18} onClick={() => handleClose()} />
      </Layout.Horizontal>
      <Container>
        <Formik<UpdateProjectNameFormProps>
          initialValues={{
            name: projectDetails.projectName ?? ''
          }}
          onSubmit={values => handleSubmit(values)}
          validationSchema={Yup.object().shape({
            name: Yup.string()
              .trim()
              .matches(/^[a-zA-Z0-9- ]*$/, getString('projectNameValidText'))
              .required(getString('projectNameIsRequired'))
          })}
        >
          {formikProps => {
            return (
              <Form style={{ height: '100%' }}>
                <Layout.Vertical style={{ gap: '2rem' }}>
                  <Container>
                    <FormInput.Text
                      name="name"
                      placeholder={getString('enterProjectName')}
                      label={
                        <Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('enterProjectName')}</Text>
                      }
                    />
                  </Container>
                  <Layout.Horizontal style={{ gap: '1rem' }}>
                    <Button
                      type="submit"
                      variation={ButtonVariation.PRIMARY}
                      text={getString('confirm')}
                      loading={updateProjectNameMutationLoading}
                      onClick={() => formikProps.handleSubmit()}
                      disabled={isProjectNameDifferent(formikProps.values)}
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
