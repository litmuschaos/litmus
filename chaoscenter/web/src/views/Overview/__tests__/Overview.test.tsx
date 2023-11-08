import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TestWrapper } from 'utils/testUtils';
import OverviewView from '../Overview';

const NoExperimentProps = {
  experimentDashboardTableData: { content: [] },
  chaosHubStats: undefined,
  infraStats: undefined,
  experimentStats: undefined,
  loading: {
    chaosHubStats: false,
    infraStats: false,
    experimentStats: false,
    recentExperimentsTable: false
  },
  refetchExperiments: Promise.resolve
};

const props = {
  loading: {
    chaosHubStats: true,
    infraStats: true,
    experimentStats: true,
    recentExperimentsTable: true
  },
  chaosHubStats: undefined,
  infraStats: undefined,
  experimentStats: undefined,
  experimentDashboardTableData: undefined,
  refetchExperiments: Promise.resolve
};
describe('OverviewView Component', () => {
  test('shows loading state', async () => {
    render(
      <TestWrapper>
        <OverviewView {...props} />
      </TestWrapper>
    );
    const loadingText = await screen.findByText('litmus');
    expect(loadingText).toBeVisible();
  });

  test('renders NewUserLanding if no experiment data is present', async () => {
    render(
      <TestWrapper>
        <OverviewView {...NoExperimentProps} />
      </TestWrapper>
    );
    const loadingText = await screen.findByText('litmus');
    expect(loadingText).toBeVisible();
  });
});
