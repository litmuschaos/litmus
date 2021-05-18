/* eslint-disable */
import React from 'react';
import '@testing-library/jest-dom';
import WorkflowSettings from '../index';
import { fireEvent, screen } from '@testing-library/react';
import { render } from '../../../../testHelpers/test-util';

/**
 * Test for the workflow settings page
 */
describe('Workflow Settings', () => {
  it('Renders InputField', () => {
    const ref = React.createRef();
    const { queryByTitle } = render(<WorkflowSettings ref={ref} />);
    const workflowNameInput = queryByTitle('workflowName')!;
    const inputValue = workflowNameInput.querySelector('input')!;
    fireEvent.change(inputValue, { target: { value: 'random text' } });
    expect(inputValue).toHaveProperty('value', 'random text');
  });

  it('Displays error text if the length exceeds the threshold', () => {
    const ref = React.createRef();
    const { queryByTitle } = render(<WorkflowSettings ref={ref} />);
    const workflowNameInput = queryByTitle('workflowName')!;
    const inputValue = workflowNameInput.querySelector('input') as HTMLElement;
    fireEvent.change(inputValue, {
      target: {
        value: 'test-test-test-test-test-test-test-test-test-test-test-',
      },
    });
    expect(screen.getByText('createWorkflow.chooseWorkflow.validate'))
      .toBeVisible;
  });
});
