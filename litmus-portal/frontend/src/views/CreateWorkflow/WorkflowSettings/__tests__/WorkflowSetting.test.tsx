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
    fireEvent.change(inputValue, {
      target: { value: 'chaos-workflow-1234567890' },
    });
    expect(inputValue).toHaveProperty('value', 'chaos-workflow-1234567890');
  });

  it('Displays error text if the length exceeds the threshold', () => {
    const ref = React.createRef();
    const { queryByTitle } = render(<WorkflowSettings ref={ref} />);
    const workflowNameInput = queryByTitle('workflowName')!;
    const inputValue = workflowNameInput.querySelector('input') as HTMLElement;
    /**
     * Workflow name is 54 chars max + generated timestamp is 10 chars
     * => Total 54 + 10 = 64 chars maximum
     * */
    fireEvent.change(inputValue, {
      target: {
        value: 'test-test-test-test-test-test-test-test-test-test-test-',
      },
    });
    /**
     * The error text is displayed if the length of name exceeds 64 charaters.
     */
    expect(screen.getByText('createWorkflow.chooseWorkflow.validate'))
      .toBeVisible;
  });
});
