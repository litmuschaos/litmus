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
    expect(getByText('createNewUser')).toBeInTheDocument();
  });

  test('validates form fields', async () => {
    const { getByText, getByPlaceholderText } = setup();
    fireEvent.change(getByPlaceholderText('enterYourName'), { target: { value: '' } });
    fireEvent.submit(getByText('confirm'));
    await waitFor(() => {
      expect(getByText('nameIsARequiredField')).toBeInTheDocument();
    });
  });

  test('calls handleClose on cancel', () => {
    const { getByText } = setup();
    fireEvent.click(getByText('cancel'));
    expect(mockHandleClose).toHaveBeenCalled();
  });
});
