import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import React from 'react';
import { render } from '../../../../testHelpers/test-util';
import WeightSlider from '../index';

describe('Weight Slider', () => {
  it('should have maximum and minimum values', () => {
    render(
      <WeightSlider
        testName="experiment1"
        weight={8}
        index={0}
        handleChange={() => {}}
      />
    );

    const slider = screen.getByRole('slider');
    expect(slider.getAttribute('aria-valuemax')).toBe('10');
    expect(slider.getAttribute('aria-valuemin')).toBe('0');
    expect(slider.getAttribute('aria-valuenow')).toBe('8');
  });

  it('should have the correct value and styles', () => {
    render(
      <WeightSlider
        testName="experiment1"
        weight={8}
        index={0}
        handleChange={() => {}}
      />
    );

    const slider = screen.getByRole('slider');
    expect(slider.getAttribute('aria-valuenow')).toBe('8');
    expect(slider.className).toBe(
      'MuiSlider-thumb WithStyles(ForwardRef(Slider))-thumb-25 MuiSlider-thumbColorPrimary PrivateValueLabel-thumb-32'
    );
  });
});
