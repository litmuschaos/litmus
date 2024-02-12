import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TestWrapper } from 'utils/testUtils';
import AccountPasswordChangeView from '../AccountPasswordChange';

describe('AccountPasswordChangeView Tests', () => {
  const mockClose = jest.fn();
  const mockUpdatePasswordMutation = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <TestWrapper>
        <AccountPasswordChangeView
          handleClose={mockClose}
          username="testuser"
          updatePasswordMutation={mockUpdatePasswordMutation}
          updatePasswordMutationLoading={false}
        />
      </TestWrapper>
    );

  test('renders all form fields and buttons', () => {
    renderComponent();
    expect(screen.getByPlaceholderText('oldPassword')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('newPassword')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('reEnterNewPassword')).toBeInTheDocument();
    expect(screen.getByText('confirm')).toBeInTheDocument();
    expect(screen.getByText('cancel')).toBeInTheDocument();
  });

  test('validates form fields before enabling submit button', async () => {
    renderComponent();
    const submitButton = screen.getByText('confirm');

    fireEvent.change(screen.getByPlaceholderText('oldPassword'), { target: { value: 'oldPass' } });
    fireEvent.change(screen.getByPlaceholderText('newPassword'), { target: { value: 'newPass' } });
    fireEvent.change(screen.getByPlaceholderText('reEnterNewPassword'), { target: { value: 'newPass' } });

    await waitFor(() => expect(submitButton).not.toBeDisabled());
  });

  test('handles submit with correct data', async () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText('oldPassword'), { target: { value: 'oldPass' } });
    fireEvent.change(screen.getByPlaceholderText('newPassword'), { target: { value: 'newPass' } });
    fireEvent.change(screen.getByPlaceholderText('reEnterNewPassword'), { target: { value: 'newPass' } });
    fireEvent.click(screen.getByText('confirm'));

    await waitFor(() => {
      expect(mockUpdatePasswordMutation).toHaveBeenCalledWith(
        {
          body: {
            username: 'testuser',
            oldPassword: 'oldPass',
            newPassword: 'newPass'
          }
        },
        expect.anything()
      );
    });
  });

  test('closes form on cancel button click', () => {
    renderComponent();
    fireEvent.click(screen.getByText('cancel'));
    expect(mockClose).toHaveBeenCalled();
  });
});
