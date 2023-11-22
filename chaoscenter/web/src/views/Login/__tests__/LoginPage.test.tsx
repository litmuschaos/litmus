import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from 'utils/testUtils';
import LoginPageView from '../LoginPage';

const mockHandleLogin = jest.fn();

describe('LoginPageView', () => {
  test('renders correctly', () => {
    render(
      <TestWrapper>
        <LoginPageView handleLogin={mockHandleLogin} loading={false} />
      </TestWrapper>
    );

    expect(screen.getByText('loginDescription')).toBeInTheDocument();
    expect(screen.getByText('username')).toBeInTheDocument();
    expect(screen.getByText('password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'signIn' })).toBeInTheDocument();
  });

  test('failed to change input', async () => {
    render(
      <TestWrapper>
        <LoginPageView handleLogin={mockHandleLogin} loading={false} />
      </TestWrapper>
    );
    const usernameInput = screen.getByText('username') as HTMLInputElement;
    const passwordInput = screen.getByText('password') as HTMLInputElement;

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'password');

    expect(usernameInput.value).toBe(undefined);
    expect(passwordInput.value).toBe(undefined);
  });
});
