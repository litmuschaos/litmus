import React from 'react';
import { Button, ButtonVariation, Layout, Text, FormInput, SelectOption, useToaster } from '@harnessio/uicore';
import { FontVariation } from '@harnessio/design-system';
import { Formik, Form } from 'formik';
import { Icon } from '@harnessio/icons';
import { useParams } from 'react-router-dom';
import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import { useStrings } from '@strings';
import { useAddGroupToProjectMutation, type GetProjectGroupsOkResponse } from '@api/auth';

interface AddGroupToProjectViewProps {
  handleClose: () => void;
  getGroupsRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<GetProjectGroupsOkResponse, unknown>>;
}

interface AddGroupFormValues {
  groupName: string;
  displayName: string;
  role: string;
}

const ADD_GROUP_DIALOG_WIDTH = 500;
const CLOSE_ICON_SIZE = 18;

const AddGroupToProjectView = ({ handleClose, getGroupsRefetch }: AddGroupToProjectViewProps): React.ReactElement => {
  const { getString } = useStrings();
  const { projectID } = useParams<{ projectID: string }>();
  const { showSuccess, showError } = useToaster();

  const { mutate: addGroupMutation, isLoading } = useAddGroupToProjectMutation(
    {},
    {
      onSuccess: () => {
        getGroupsRefetch();
        showSuccess(getString('groupAdded'));
        handleClose();
      },
      onError: () => {
        showError(getString('groupAlreadyExists'));
      }
    }
  );

  const roleOptions: SelectOption[] = [
    { label: getString('viewer'), value: 'Viewer' },
    { label: getString('Executor'), value: 'Executor' },
    { label: 'Owner', value: 'Owner' }
  ];

  return (
    <Layout.Vertical padding="medium" style={{ gap: '1rem' }} width={ADD_GROUP_DIALOG_WIDTH}>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Text font={{ variation: FontVariation.H4 }}>{getString('addGroupToProject')}</Text>
        <Icon name="cross" style={{ cursor: 'pointer' }} size={CLOSE_ICON_SIZE} onClick={handleClose} />
      </Layout.Horizontal>
      <Formik<AddGroupFormValues>
        initialValues={{ groupName: '', displayName: '', role: 'Viewer' }}
        onSubmit={values => {
          addGroupMutation({
            body: {
              displayName: values.displayName || undefined,
              group: values.groupName,
              projectID,
              role: values.role as 'Executor' | 'Owner' | 'Viewer'
            }
          });
        }}
        validate={values => {
          const errors: Partial<Record<keyof AddGroupFormValues, string>> = {};
          if (!values.groupName.trim()) {
            errors.groupName = getString('enterGroupName');
          }
          return errors;
        }}
      >
        {() => (
          <Form>
            <Layout.Vertical style={{ gap: '1rem' }}>
              <FormInput.Text
                name="groupName"
                label={getString('groupName')}
                placeholder={getString('enterGroupName')}
              />
              <FormInput.Text
                name="displayName"
                label={getString('groupDisplayName')}
                placeholder={getString('enterGroupDisplayName')}
              />
              <FormInput.Select name="role" label={getString('selectRole')} items={roleOptions} />
              <Layout.Horizontal style={{ gap: '1rem' }}>
                <Button
                  type="submit"
                  variation={ButtonVariation.PRIMARY}
                  text={getString('addGroup')}
                  disabled={isLoading}
                />
                <Button variation={ButtonVariation.TERTIARY} text={getString('cancel')} onClick={handleClose} />
              </Layout.Horizontal>
            </Layout.Vertical>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  );
};

export { AddGroupToProjectView };
