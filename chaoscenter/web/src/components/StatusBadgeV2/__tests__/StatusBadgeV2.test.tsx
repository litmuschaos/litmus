import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ExperimentRunStatus } from '@api/entities';
import StatusBadgeV2, { StatusBadgeEntity } from '../StatusBadgeV2';

describe('StatusBadgeV2', () => {
  test('renders with ExperimentRun entity', () => {
    render(<StatusBadgeV2 status={ExperimentRunStatus.COMPLETED} entity={StatusBadgeEntity.ExperimentRun} />);
    expect(screen.getByTestId('status-badge-v2')).toBeInTheDocument();
  });

  test('renders correct status text', () => {
    render(<StatusBadgeV2 status={ExperimentRunStatus.RUNNING} entity={StatusBadgeEntity.ExperimentRun} />);
    expect(screen.getByTestId('status-badge-v2')).toBeInTheDocument();
  });

  test('renders with tooltip', () => {
    render(
      <StatusBadgeV2
        status={ExperimentRunStatus.COMPLETED}
        entity={StatusBadgeEntity.ExperimentRun}
        tooltip="Test tooltip"
      />
    );
    expect(screen.getByTestId('status-badge-v2')).toBeInTheDocument();
  });

  test('renders error status', () => {
    render(<StatusBadgeV2 status={ExperimentRunStatus.ERROR} entity={StatusBadgeEntity.ExperimentRun} />);
    expect(screen.getByTestId('status-badge-v2')).toBeInTheDocument();
  });
});
