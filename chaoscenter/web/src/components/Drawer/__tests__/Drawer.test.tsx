import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Drawer, { DrawerTypes } from '../Drawer';
// import { getTriggerListDefaultProps } from './mockConstants';

function WrapperComponentWithoutUseModalHook(): JSX.Element {
  const [isOpen, setIsOpen] = React.useState<boolean>(true);

  return (
    <Drawer
      title="Test Drawer"
      isOpen={isOpen}
      isCloseButtonShown={true}
      type={DrawerTypes.ChaosHub}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      handleClose={() => {
        setIsOpen(false);
      }}
      leftPanel={<></>}
    />
  );
}

describe('Drawer Tests', () => {
  describe('Validate', () => {
    test('Check if metadata is valid', async () => {
      render(
        <Drawer
          title="Test Drawer"
          isOpen={true}
          type={DrawerTypes.ChaosHub}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          handleClose={() => {}}
          leftPanel={
            <div data-testid="left-panel">
              <p>Left Panel body</p>
            </div>
          }
          rightPanel={
            <div data-testid="right-panel">
              <p>Right Panel body</p>
            </div>
          }
        />
      );

      // Title value is correct
      await waitFor(() => {
        expect(screen.getByTestId(`title`).innerHTML).toBe('Test Drawer');
      });

      // Close button is rendered
      await waitFor(() => {
        expect(screen.getByText(`cross`).innerHTML).toBe('cross');
      });

      // Left panel is rendered
      await waitFor(() => {
        expect(screen.getByTestId(`left-panel`).innerHTML).toBe('<p>Left Panel body</p>');
      });

      // Right panel is rendered
      await waitFor(() => {
        expect(screen.getByTestId(`right-panel`).innerHTML).toBe('<p>Right Panel body</p>');
      });
    });
  });

  test('Close button should close the drawer', async () => {
    render(<WrapperComponentWithoutUseModalHook />);

    await waitFor(() => expect(screen.getByRole(`button`)).not.toBeNull());

    const button = screen.getByRole(`button`);
    fireEvent.click(button);

    await waitFor(() => expect(document.body.querySelector(`.root`)).toBeNull());
  });
});
