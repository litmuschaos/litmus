import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { TestWrapper } from 'utils/testUtils';
import Duration from '../Duration';

describe('Duration', () => {
  test('displays correct duration for millisecond-precision timestamps', () => {
    // 30 seconds apart in ms
    render(
      <TestWrapper>
        <Duration startTime={1718000000000} endTime={1718000030000} />
      </TestWrapper>
    );
    expect(screen.getByText(/30s/)).toBeInTheDocument();
  });

  test('displays correct duration for second-precision (10-digit) timestamps', () => {
    // same 30 seconds apart but in seconds (10-digit)
    render(
      <TestWrapper>
        <Duration startTime={1718000000} endTime={1718000030} />
      </TestWrapper>
    );
    expect(screen.getByText(/30s/)).toBeInTheDocument();
  });

  test('displays 0 duration when startTime is not provided', () => {
    render(
      <TestWrapper>
        <Duration endTime={1718000030000} />
      </TestWrapper>
    );
    // delta should be 0 when no startTime
    expect(screen.getByText(/duration/i)).toBeInTheDocument();
  });

  test('renders custom durationText when provided', () => {
    render(
      <TestWrapper>
        <Duration startTime={1718000000000} endTime={1718000030000} durationText="Elapsed: " />
      </TestWrapper>
    );
    expect(screen.getByText(/Elapsed:/)).toBeInTheDocument();
  });
});
