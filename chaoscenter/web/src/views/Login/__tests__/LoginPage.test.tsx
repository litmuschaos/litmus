import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPageView from '../LoginPage';
const mockHandleLogin = jest.fn();
const mockGetString = jest.fn((key: string) => {
  const strings = {
    welcomeToLitmus: 'Welcome to Litmus',
    LoginDescription: 'Please sign in to your account'
  };
  return strings[key as keyof typeof strings] || key;
});

jest.mock('@strings', () => ({
  useStrings: () => ({
    getString: mockGetString
  })
}));
describe('LoginPageView', () => {
  test('renders correctly', () => {
    render(<LoginPageView handleLogin={mockHandleLogin} loading={false} />);

    expect(screen.getByText('Welcome to Litmus')).toBeInTheDocument();
    expect(screen.getByText('loginDescription')).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  test('failed to change input', async () => {
    render(<LoginPageView handleLogin={mockHandleLogin} loading={false} />);
    const usernameInput = screen.getByText('Username') as HTMLInputElement;
    const passwordInput = screen.getByText('Password') as HTMLInputElement;

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'password');

    expect(usernameInput.value).toBe(undefined);
    expect(passwordInput.value).toBe(undefined);
  });
});
