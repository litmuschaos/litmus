import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TestWrapper } from 'utils/testUtils';
import ResetPasswordView from '../ResetPassword';

describe('ResetPasswordView Component', () => {
  const mockClose = jest.fn();
  const mockRestPasswordMutation = jest.fn();

  beforeEach(() => {
    render(
      <TestWrapper>
        <ResetPasswordView
          handleClose={mockClose}
          resetPasswordMutation={mockRestPasswordMutation}
          username="testUser"
        />
      </TestWrapper>
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should render without crashing', () => {
    expect(screen.getByPlaceholderText('newPassword')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('reEnterNewPassword')).toBeInTheDocument();
    expect(screen.getByText('confirm')).toBeInTheDocument();
    expect(screen.getByText('cancel')).toBeInTheDocument();
  });

  test('submit button should be disabled when input fields are empty', () => {
    const submitButton = screen.getByText('confirm');
    expect(submitButton).toBeDisabled();
  });

  test('submit button should be disabled when passwords do not match', () => {
    fireEvent.change(screen.getByPlaceholderText('newPassword'), { target: { value: 'password1' } });
    fireEvent.change(screen.getByPlaceholderText(' reEnterNewPassword'), { target: { value: 'password2' } });

    const submitButton = screen.getByText('confirm');
    expect(submitButton).toBeDisabled();
  });

  test('should call reset password mutatin when form is submitted with valid inputs', () => {
    fireEvent.change(screen.getByPlaceholderText('newPassword'), { target: { value: 'password' } });
    fireEvent.change(screen.getByPlaceholderText('reEnterNewPassword'), { target: { value: 'password' } });

    const submitButton = screen.getByText('confirm');
    fireEvent.click(submitButton);

    expect(mockRestPasswordMutation).toHaveBeenCalledWith(
      {
        body: {
          username: 'testUser',
          oldPassword: '',
          newPassword: 'password'
        }
      },
      expect.any(Object)
    );

    test('should call handleClose when cancel button is clicked', () => {
      const cancelButton = screen.getByText('cancel');
      fireEvent.click(cancelButton);

      expect(mockClose).toHaveBeenCalled();
    });

    test('should call handleClose when close icon is clicked', () => {
      const closeIcon = screen.getByTestId('cross-icon');
      fireEvent.click(closeIcon);

      expect(mockClose).toHaveBeenCalled();
    });
  });
});
