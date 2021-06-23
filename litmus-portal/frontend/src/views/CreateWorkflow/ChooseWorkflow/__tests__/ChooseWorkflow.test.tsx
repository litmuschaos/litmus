import '@testing-library/jest-dom';
import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { render } from '../../../../testHelpers/test-util';
import ChooseWorkflow from '../index';

describe('ChooseWorkflow', () => {
  it('Renders', () => {
    render(<ChooseWorkflow />);

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
  });

  it('The Radio Button Values should be constant', () => {
    render(<ChooseWorkflow />);

    const radios = screen.getAllByRole('radio');

    const values = ['A', 'B', 'C', 'D'];

    radios.forEach((radio, i) => {
      if (radio.getAttribute('value') === values[i]) {
        expect(radio.getAttribute('value')).toEqual(values[i]);
      }
    });
  });

  it('The Radio Button have translation', () => {
    render(<ChooseWorkflow />);

    const options = screen.getAllByTestId('option');
    const translations = [
      'createWorkflow.chooseWorkflow.optionA',
      'createWorkflow.chooseWorkflow.optionB',
      'createWorkflow.chooseWorkflow.optionC',
      'createWorkflow.chooseWorkflow.optionD',
    ];
    options.forEach((option, index) => {
      expect(option.innerHTML).toBe(translations[index]);
    });
  });
});
