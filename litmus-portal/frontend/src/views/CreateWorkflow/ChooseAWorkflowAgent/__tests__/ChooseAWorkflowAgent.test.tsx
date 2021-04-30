import '@testing-library/jest-dom';
import { act, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { render } from '../../../../testHelpers/test-util';
import ChooseAWorkflowAgent from '../index';

describe('ChooseAWorkflowAgent', () => {
  it('Renders', async () => {
    const ref = React.createRef();
    act(() => {
      render(<ChooseAWorkflowAgent ref={ref} />);
    });

    await act(async () => {
      const search = screen.getByRole('textbox');
      expect(search).toHaveProperty('type', 'text');
      expect(search).toHaveProperty('disabled', false);
      expect(search).toHaveProperty('value', '');

      fireEvent.change(search, { target: { value: 'random text' } });
      expect(search).toHaveProperty('value', 'random text');
    });
  });
});
