import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '../../../../testHelpers/test-util';
import ReliabilityScore from '../index';
import '@testing-library/jest-dom';

describe('ReliabilityScore', () => {
  it('Renders', () => {
    render(<ReliabilityScore />);

    const sliders = screen.getAllByRole('slider');
    sliders.forEach((slider) => {
      expect(slider).toHaveTextContent('10');
    });
  });
});
