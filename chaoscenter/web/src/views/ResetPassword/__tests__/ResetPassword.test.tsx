import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, screen } from '@testing-library/react';
import * as stringUtils from '@strings';
import { TestWrapper } from 'utils/testUtils';
import ResetPasswordView from '../ResetPassword';

beforeEach(() => {
  jest.spyOn(stringUtils, 'useStrings').mockReturnValue({
    getString: jest.fn().mockImplementation(key => `Mocked String for ${key}`)
  });
});

afterEach(() => {
  jest.clearAllMocks();
});
describe('ResetPasswordView Component', () => {
  const mockClose = jest.fn();
  const mockRestPasswordMutation = jest.fn();

  test('should render without crashing', () => {
    render(
      <TestWrapper>
        <ResetPasswordView
          handleClose={mockClose}
          resetPasswordMutation={mockRestPasswordMutation}
          resetPasswordMutationLoading={false}
          username="testUser"
        />
      </TestWrapper>
    );
    expect(screen.getByPlaceholderText('Mocked String for newPassword')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mocked String for reEnterNewPassword')).toBeInTheDocument();
    screen.getByRole('button', { name: /confirm/i });
  });

  test('submit button should be disabled when input fields are empty', () => {
    render(
      <ResetPasswordView
        handleClose={() => {
          /* noop */
        }}
        resetPasswordMutation={() => {
          /* noop */
        }}
        resetPasswordMutationLoading={false}
        username="testUser"
      />
    );

    const submitButton = screen.getByRole('button', { name: /confirm/i });
    expect(submitButton).toBeDisabled();
  });

  test('submit button is enabled when input fields are valid', () => {
    render(
      <TestWrapper>
        <ResetPasswordView
          handleClose={mockClose}
          resetPasswordMutation={mockRestPasswordMutation}
          resetPasswordMutationLoading={false}
          username="testUser"
        />
      </TestWrapper>
    );
    fireEvent.change(screen.getByPlaceholderText('Mocked String for newPassword'), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByPlaceholderText('Mocked String for reEnterNewPassword'), {
      target: { value: 'password123' }
    });

    const submitButton = screen.getByRole('button', { name: /confirm/i });
    expect(submitButton).not.toBeDisabled();
  });

  test('submit button remains disabled if passwords do not match', () => {
    render(
      <TestWrapper>
        <ResetPasswordView
          handleClose={mockClose}
          resetPasswordMutation={mockRestPasswordMutation}
          resetPasswordMutationLoading={false}
          username="testUser"
        />
      </TestWrapper>
    );
    fireEvent.change(screen.getByPlaceholderText('Mocked String for newPassword'), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByPlaceholderText('Mocked String for reEnterNewPassword'), {
      target: { value: 'differentPassword123' }
    });

    const submitButton = screen.getByRole('button', { name: /confirm/i });
    expect(submitButton).toBeDisabled();
  });
});
