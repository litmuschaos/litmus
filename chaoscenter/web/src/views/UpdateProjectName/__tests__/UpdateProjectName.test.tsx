import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import UpdateProjectNameView from '../UpdateProjectName';
import '@testing-library/jest-dom';

const mockHandleClose = jest.fn();
const mockUpdateProjectNameMutation = jest.fn(() => Promise.resolve());
const initialProps = {
  projectDetails: {
    projectID: '1',
    projectName: 'Old Project'
  },
  updateProjectNameMutation: mockUpdateProjectNameMutation,
  updateProjectNameMutationLoading: false,
  handleClose: mockHandleClose
};

jest.mock('@strings', () => ({
  useStrings: () => ({
    getString: jest.fn(id => {
      switch (id) {
        case 'editProjectName':
          return 'Edit Project Name';
        case 'projectNameValidText':
          return 'Project name can only contain alphanumeric characters, spaces, and dashes.';
        case 'projectNameIsRequired':
          return 'Project name is required.';
        case 'enterProjectName':
          return 'Enter Project Name';
        case 'confirm':
          return 'Confirm';
        case 'cancel':
          return 'Cancel';
        default:
          return id;
      }
    })
  })
}));
describe('UpdateProjectNameView', () => {
  test('renders with initial project name', () => {
    const { getByPlaceholderText } = render(<UpdateProjectNameView {...initialProps} />);
    expect(getByPlaceholderText('Enter Project Name')).toHaveValue(initialProps.projectDetails.projectName);
  });

  test('calls updateProjectNameMutation on form submit with new name', async () => {
    const { getByText, getByPlaceholderText } = render(<UpdateProjectNameView {...initialProps} />);
    const newName = 'New Project';

    fireEvent.change(getByPlaceholderText('Enter Project Name'), { target: { value: newName } });
    fireEvent.click(getByText('Confirm'));

    await waitFor(() => {
      expect(mockUpdateProjectNameMutation).toHaveBeenCalledWith({
        body: {
          projectID: initialProps.projectDetails.projectID,
          projectName: newName
        }
      });
    });
  });
});
