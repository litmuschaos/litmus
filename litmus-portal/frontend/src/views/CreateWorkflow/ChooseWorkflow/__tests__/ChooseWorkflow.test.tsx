import React from 'react';
import { render } from '../../../../testHelpers/test-util';
import ChooseWorkflow from '../index';
import '@testing-library/jest-dom';

describe('ChooseWorkflow', () => {
  it('Renders header, <RadioGroup>, <Accordion', () => {
    const { getByTestId } = render(<ChooseWorkflow />);
    expect(getByTestId('chooseworkflow-header')).toBeTruthy();
    expect(getByTestId('chooseworkflow-radiogroup')).toBeTruthy();
    expect(getByTestId('chooseworkflow-accordion')).toBeTruthy();
  });
});
