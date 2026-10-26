import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { TestWrapper } from 'utils/testUtils';
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

describe('UpdateProjectNameView', () => {
  test('renders with initial project name', () => {
    const { getByPlaceholderText } = render(
      <TestWrapper>
        <UpdateProjectNameView {...initialProps} />
      </TestWrapper>
    );
    expect(getByPlaceholderText('enterProjectName')).toHaveValue(initialProps.projectDetails.projectName);
  });

  test('calls updateProjectNameMutation on form submit with new name', async () => {
    const { getByText, getByPlaceholderText } = render(
      <TestWrapper>
        <UpdateProjectNameView {...initialProps} />
      </TestWrapper>
    );
    const newName = 'New Project';

    fireEvent.change(getByPlaceholderText('enterProjectName'), { target: { value: newName } });
    fireEvent.click(getByText('confirm'));

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
