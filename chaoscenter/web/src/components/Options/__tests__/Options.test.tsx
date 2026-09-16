import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from 'utils/testUtils';
import Options from '../Options';

beforeEach(() => cleanup());
describe('Delete Options', () => {
  test('checking for correct icon', async () => {
    const user = userEvent.setup();
    const deleteFunction = jest.fn();
    const { container, getByTestId } = render(
      <TestWrapper>
        <Options handleDelete={deleteFunction} />
      </TestWrapper>
    );
    const threeDotMenu = container.getElementsByClassName('bp3-icon')[0];
    threeDotMenu && (await user.click(threeDotMenu));
    expect(getByTestId('optionItemIcon')).toHaveAttribute('data-icon', 'main-trash');
  });
  test('checking for correct text', async () => {
    const user = userEvent.setup();
    const deleteFunction = jest.fn();
    const { container, getByText } = render(
      <TestWrapper>
        <Options handleDelete={deleteFunction} />
      </TestWrapper>
    );
    const threeDotMenu = container.getElementsByClassName('bp3-icon')[0];
    threeDotMenu && (await user.click(threeDotMenu));
    expect(getByText('delete')).toBeInTheDocument();
  });
});
describe('Navigate Options', () => {
  test('checking for correct icon', async () => {
    const user = userEvent.setup();
    const navigateFunction = jest.fn();
    const { container, getByTestId } = render(
      <TestWrapper>
        <Options handleNavigate={navigateFunction} />
      </TestWrapper>
    );
    const threeDotMenu = container.getElementsByClassName('bp3-icon')[0];
    threeDotMenu && (await user.click(threeDotMenu));
    expect(getByTestId('optionItemIcon')).toHaveAttribute('data-icon', 'command-resource-constraint');
  });
  test('checking for correct text', async () => {
    const user = userEvent.setup();
    const navigateFunction = jest.fn();
    const { container, getByText } = render(
      <TestWrapper>
        <Options handleNavigate={navigateFunction} />
      </TestWrapper>
    );
    const threeDotMenu = container.getElementsByClassName('bp3-icon')[0];
    threeDotMenu && (await user.click(threeDotMenu));
    expect(getByText('view')).toBeInTheDocument();
  });
});
