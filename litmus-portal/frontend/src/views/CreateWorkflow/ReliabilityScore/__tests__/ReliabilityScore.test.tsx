import '@testing-library/jest-dom';
import { act, screen } from '@testing-library/react';
import React from 'react';
import { render } from '../../../../testHelpers/test-util';
import ReliabilityScore from '../index';

describe('Reliability Score', () => {
  it('has the right slider properties', async () => {
    const ref = React.createRef();
    act(() => {
      render(<ReliabilityScore ref={ref} />);
    });

    await act(async () => {
      await expect(screen.getByRole('slider').className).toBe(
        'MuiSlider-thumb WithStyles(ForwardRef(Slider))-thumb-46 MuiSlider-thumbColorPrimary PrivateValueLabel-thumb-53'
      );
      await expect(screen.getByRole('slider').getAttribute('aria-label')).toBe(
        'pretto slider'
      );
    });
  });
});
