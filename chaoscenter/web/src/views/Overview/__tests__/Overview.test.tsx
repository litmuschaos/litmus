import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { TestWrapper } from 'utils/testUtils';
import OverviewView from '../Overview';

const NoExperimentProps = {
  chaosHubStats: undefined,
  experimentDashboardTableData: { content: [] },
  experimentStats: undefined,
  infraStats: undefined,
  loading: {
    chaosHubStats: false,
    experimentStats: false,
    infraStats: false,
    recentExperimentsTable: false
  },
  refetchExperiments: Promise.resolve
};

const props = {
  chaosHubStats: undefined,
  experimentStats: undefined,
  experimentDashboardTableData: undefined,
  infraStats: undefined,
  loading: {
    chaosHubStats: true,
    experimentStats: true,
    infraStats: true,
    recentExperimentsTable: true
  },

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
