import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { TestWrapper } from 'utils/testUtils';
import CreateNewUserView from '../CreateNewUser';
import '@testing-library/jest-dom';

describe('<CreateNewUserView />', () => {
  const mockCreateNewUserMutation = jest.fn();
  const mockHandleClose = jest.fn();

  const setup = () =>
    render(
      <TestWrapper>
        <CreateNewUserView
          createNewUserMutation={mockCreateNewUserMutation}
          createNewUserMutationLoading={false}
          handleClose={mockHandleClose}
        />
      </TestWrapper>
    );

  test('renders without crashing', () => {
    const { getByText } = setup();
    expect(getByText('Create New User')).toBeInTheDocument();
  });

  test('validates form fields', async () => {
    const { getByText, getByPlaceholderText } = setup();
    fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: '' } });
    fireEvent.submit(getByText('Confirm'));
    await waitFor(() => {
      expect(getByText('Name is a required field')).toBeInTheDocument();
    });
  });

  test('submits form with valid data', async () => {
    const { getByText, getByPlaceholderText } = setup();
    fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: 'John Doe' } });
    fireEvent.click(getByText('Confirm'));

    await waitFor(() => {
      expect(mockCreateNewUserMutation).toHaveBeenCalledWith({
        body: expect.objectContaining({ name: 'John Doe' })
      });
    });
  });

  test('calls handleClose on cancel', () => {
    const { getByText } = setup();
    fireEvent.click(getByText('Cancel'));
    expect(mockHandleClose).toHaveBeenCalled();
  });
});
