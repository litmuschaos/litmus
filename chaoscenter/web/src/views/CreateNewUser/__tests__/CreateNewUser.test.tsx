import React from 'react';
import { render, fireEvent } from '@testing-library/react';
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

  test('calls handleClose on cancel', () => {
    const { getByText } = setup();
    fireEvent.click(getByText('cancel'));
    expect(mockHandleClose).toHaveBeenCalled();
  });
});
