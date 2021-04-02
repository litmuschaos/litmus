import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../../../testHelpers/test-util';
import ChooseWorkflow from '../index';
import '@testing-library/jest-dom';

describe('ChooseWorkflow', () => {
  it('Renders header, <RadioGroup>, <Accordion', () => {
    const { getByTestId } = render(<ChooseWorkflow />);

    // get all radio byRole
    const radios = screen.getAllByRole('radio');
    radios.forEach((radio: HTMLElement) => {
      // check type
      expect(radio).toHaveProperty('type', 'radio');
      // check checked attribute
      expect(radio).toHaveProperty('checked', false);
      // change checked value
      fireEvent.change(radio, { target: { checked: true } });
      // check checked changed value
      expect(radio).toHaveProperty('checked', true);
      // give text value
      fireEvent.change(radio, { target: { value: 'radio button text' } });
      // check given value
      expect(radio).toHaveProperty('value', 'radio button text');
    });

    expect(getByTestId('chooseworkflow-header')).toBeTruthy();
    expect(getByTestId('chooseworkflow-radiogroup')).toBeTruthy();
    expect(getByTestId('chooseworkflow-accordion')).toBeTruthy();
  });
});
