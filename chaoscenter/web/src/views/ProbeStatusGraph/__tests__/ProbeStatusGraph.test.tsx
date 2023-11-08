import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ProbeStatusGraph from '../ProbeStatusGraph';

jest.mock('@strings', () => ({
  useStrings: () => ({
    getString: jest.fn().mockImplementation(id => {
      if (id === 'probes') return 'Probes';
      if (id === 'runs') return 'Runs';
      return id;
    })
  })
}));

describe('ProbeStatusGraph', () => {
  const correctData: [number[], number[]] = [
    [1, 2, 3],
    [4, 5, 6]
  ];

  test('renders without crashing', () => {
    render(<ProbeStatusGraph data={correctData} />);
    expect(screen.getByText('Created with Highcharts 9.2.0')).toBeInTheDocument();
  });
});
