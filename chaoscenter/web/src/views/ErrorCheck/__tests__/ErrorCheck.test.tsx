import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ErrorCheckView from '../ErrorCheck';

describe('ErrorCheckView Component Tests', () => {
  beforeEach(() => {
    render(<ErrorCheckView />);
  });
  test('initial render of ErrorCheckView', () => {
    const counters = screen.getAllByRole('heading');
    counters.forEach(counter => {
      expect(counter).toHaveTextContent('0');
    });
  });

  test('counter throws an error when reaching 3 and ErrorBoundary renders fallback', async () => {
    const counter = screen.getAllByRole('heading')[0];

    fireEvent.click(counter);
    fireEvent.click(counter);
    fireEvent.click(counter);
    expect(await screen.findByText('Something went wrong.')).toBeInTheDocument();
  });

  test('counter throws a Set Timeout error after 2 seconds', async () => {
    jest.useFakeTimers();
    const counter = screen.getAllByRole('heading')[0];

    fireEvent.click(counter);

    jest.advanceTimersByTime(2500);

    await waitFor(() => {
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    });
    jest.useRealTimers();
  });

  test('only the crashed counter inside its own error boundary should be replaced', async () => {
    const counters = screen.getAllByRole('heading');
    const isolatedCounter1 = counters[counters.length - 2];
    const isolatedCounter2 = counters[counters.length - 1];

    fireEvent.click(isolatedCounter1);
    fireEvent.click(isolatedCounter1);
    fireEvent.click(isolatedCounter1);
    expect(await screen.findByText('Something went wrong.')).toBeInTheDocument();

    expect(isolatedCounter2).toHaveTextContent('0');
  });
});
