import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CopyButton from '../CopyButton';

const testString = 'Copy this';

beforeEach(() => {
  render(<CopyButton stringToCopy={testString} />);
});

describe('Clipboard', () => {
  test('should call clipboard.writeText', async () => {
    const user = userEvent.setup();

    const btnElement = screen.getByTestId('copy-button');

    await user.click(btnElement);
    //assert
    const clipboardText = await navigator.clipboard.readText();

    expect(clipboardText).toBe('Copy this');
  });
});

describe('Copy Button Tests', () => {
  test('if fallback icon exists', () => {
    expect(screen.getByTestId('copy-button').getAttribute('icon')).toEqual('duplicate');
  });

  test('copy operation renders a toaster on success', async () => {
    const user = userEvent.setup();
    const copy = screen.getByTestId('copy-button');
    // assert tick icon is not in the document
    expect(screen.queryByTestId('success-tick')).not.toBeInTheDocument();

    expect(copy).toBeInTheDocument();

    // if assertion is successful, click the button
    copy && (await user.click(copy));

    //assert
    await navigator.clipboard.readText();
    const successIcon = screen.queryByTestId('success-tick');
    // assert success tick is on the screen
    expect(successIcon).toBeInTheDocument();
  });
});
