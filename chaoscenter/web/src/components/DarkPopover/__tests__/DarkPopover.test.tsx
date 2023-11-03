import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render } from '@testing-library/react';
import { PopoverInteractionKind } from '@blueprintjs/core';
import userEvent from '@testing-library/user-event';
import DarkPopover from '../DarkPopover';

describe('Default Layout Tests', () => {
  test('should have the correct props', async () => {
    const user = userEvent.setup();
    const { getByTestId, findByText } = render(
      <DarkPopover position="top" content={<div>Hover Content</div>} interactionKind={PopoverInteractionKind.HOVER}>
        <div data-testid="popover" />
      </DarkPopover>
    );

    await user.hover(getByTestId('popover'));

    expect(await findByText('Hover Content')).toBeInTheDocument();
  });
});
