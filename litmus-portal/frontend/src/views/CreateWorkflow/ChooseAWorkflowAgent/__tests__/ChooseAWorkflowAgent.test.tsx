import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../../../testHelpers/test-util';
import ChooseAWorkflowAgent from '../index';
import '@testing-library/jest-dom';

describe('ChooseAWorkflowAgent', () => {
  it('Renders', () => {
    render(<ChooseAWorkflowAgent />);

    const search = screen.getByRole('textbox');

    expect(search).toHaveProperty('type', 'text');
    expect(search).toHaveProperty('disabled', false);
    expect(search).toHaveProperty('value', '');

    fireEvent.change(search, { target: { value: 'random text' } });
    expect(search).toHaveProperty('value', 'random text');
  });
});
