import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../../../testHelpers/test-util';
import WorkflowSettings from '../index';
import '@testing-library/jest-dom';

describe('WorkflowSettings', () => {
  it('Renders', () => {
    render(<WorkflowSettings />);

    const inputs = screen.getAllByRole('textbox');

    inputs.forEach((input) => {
      expect(input).toHaveProperty('disabled', false);
      fireEvent.change(input, { target: { value: 'random text' } });
      expect(input).toHaveProperty('value', 'random text');
    });

    expect(screen.getByTestId('avatar')).toBeTruthy();
  });
});
