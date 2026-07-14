import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TestWrapper } from 'utils/testUtils';
import AccountDetailsChangeView from '../AccountDetailsChange';

describe('AccountDetailsChangeView Tests', () => {
  const mockClose = jest.fn();
  const mockUpdateDetailsMutation = jest.fn();

  const currentUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    isRemoved: false,
    role: 'User',
    userID: '123',
    username: 'johndoe'
  };

  const renderComponent = () =>
    render(
      <TestWrapper>
        <AccountDetailsChangeView
          handleClose={mockClose}
          currentUser={currentUser}
          updateDetailsMutation={mockUpdateDetailsMutation}
          updateDetailsMutationLoading={false}
        />
      </TestWrapper>
    );

  test('renders all form fields and buttons', () => {
    renderComponent();
    expect(screen.getByPlaceholderText('enterYourName')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('enterYourEmail')).toBeInTheDocument();
    expect(screen.getByText('confirm')).toBeInTheDocument();
    expect(screen.getByText('cancel')).toBeInTheDocument();
  });

  test('pre-fills form fields with current user data', () => {
    renderComponent();
    const nameInput = screen.getByPlaceholderText('enterYourName') as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText('enterYourEmail') as HTMLInputElement;

    expect(nameInput.value).toBe(currentUser.name);
    expect(emailInput.value).toBe(currentUser.email);
  });

  test('validates form fields before enabling submit button', async () => {
    renderComponent();
    const submitButton = screen.getByText('confirm');

    fireEvent.change(screen.getByPlaceholderText('enterYourName'), { target: { value: 'New Name' } });
    fireEvent.change(screen.getByPlaceholderText('enterYourEmail'), { target: { value: 'new.email@example.com' } });

    await waitFor(() => expect(submitButton).not.toBeDisabled());
  });

  test('submits form with updated data', async () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText('enterYourName'), { target: { value: 'New Name' } });
    fireEvent.change(screen.getByPlaceholderText('enterYourEmail'), { target: { value: 'new.email@example.com' } });
    fireEvent.click(screen.getByText('confirm'));

    await waitFor(() => {
      expect(mockUpdateDetailsMutation).toHaveBeenCalledWith({
        body: {
          name: 'New Name',
          email: 'new.email@example.com'
        }
      });
    });
  });

  test('closes form on cancel button click', () => {
    renderComponent();
    fireEvent.click(screen.getByText('cancel'));
    expect(mockClose).toHaveBeenCalled();
  });
});
