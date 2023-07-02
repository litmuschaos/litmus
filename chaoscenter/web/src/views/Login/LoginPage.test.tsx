import React from 'react';
import { render } from '@testing-library/react';
import { TestWrapper } from 'utils/testUtils';
import LoginPageView from '.';

describe('Login Page', () => {
  test('The login page renders', () => {
    function handleSubmit(): void {
      return;
    }

    const { container } = render(
      <TestWrapper>
        <LoginPageView handleSubmit={() => handleSubmit()} loading={false} />
      </TestWrapper>
    );

    expect(container).toMatchSnapshot();
  });
});
