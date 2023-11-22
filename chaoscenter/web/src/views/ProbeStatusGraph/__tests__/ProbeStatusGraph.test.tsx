import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { TestWrapper } from 'utils/testUtils';
import ProbeStatusGraph from '../ProbeStatusGraph';

describe('ProbeStatusGraph', () => {
  const correctData: [number[], number[]] = [
    [1, 2, 3],
    [4, 5, 6]
  ];

  test('renders without crashing', () => {
    render(
      <TestWrapper>
        <ProbeStatusGraph data={correctData} />
      </TestWrapper>
    );
    expect(screen.getByText('Created with Highcharts 9.2.0')).toBeInTheDocument();
  });
});
