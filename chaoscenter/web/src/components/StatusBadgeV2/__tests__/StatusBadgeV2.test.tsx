import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ExperimentRunStatus } from '@api/entities';
import { ChaosInfrastructureStatus } from '@models';
import StatusBadgeV2, { StatusBadgeEntity } from '../StatusBadgeV2';

describe('StatusBadgeV2', () => {
  describe('ExperimentRun entity', () => {
    test('renders COMPLETED status with correct text', () => {
      render(<StatusBadgeV2 status={ExperimentRunStatus.COMPLETED} entity={StatusBadgeEntity.ExperimentRun} />);
      expect(screen.getByTestId('status-badge-v2')).toBeInTheDocument();
      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    });

    test('renders RUNNING status with correct text', () => {
      render(<StatusBadgeV2 status={ExperimentRunStatus.RUNNING} entity={StatusBadgeEntity.ExperimentRun} />);
      expect(screen.getByTestId('status-badge-v2')).toBeInTheDocument();
      expect(screen.getByText('RUNNING')).toBeInTheDocument();
    });

    test('renders ERROR status with correct text', () => {
      render(<StatusBadgeV2 status={ExperimentRunStatus.ERROR} entity={StatusBadgeEntity.ExperimentRun} />);
      expect(screen.getByTestId('status-badge-v2')).toBeInTheDocument();
      expect(screen.getByText('ERROR')).toBeInTheDocument();
    });

    test('renders STOPPED status with correct text', () => {
      render(<StatusBadgeV2 status={ExperimentRunStatus.STOPPED} entity={StatusBadgeEntity.ExperimentRun} />);
      expect(screen.getByTestId('status-badge-v2')).toBeInTheDocument();
      expect(screen.getByText('STOPPED')).toBeInTheDocument();
    });

    test('renders QUEUED status with correct text', () => {
      render(<StatusBadgeV2 status={ExperimentRunStatus.QUEUED} entity={StatusBadgeEntity.ExperimentRun} />);
      expect(screen.getByTestId('status-badge-v2')).toBeInTheDocument();
      expect(screen.getByText('QUEUED')).toBeInTheDocument();
    });

    test('renders with tooltip prop and shows status text', () => {
      render(
        <StatusBadgeV2
          status={ExperimentRunStatus.COMPLETED}
          entity={StatusBadgeEntity.ExperimentRun}
          tooltip="Test tooltip"
        />
      );
      expect(screen.getByTestId('status-badge-v2')).toBeInTheDocument();
      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
      expect(screen.getByText('COMPLETED').closest('[data-testid="status-badge-v2"]')).toBeInTheDocument();
    });
  });

  describe('Infrastructure entity', () => {
    test('renders CONNECTED status with correct text', () => {
      render(<StatusBadgeV2 status={ChaosInfrastructureStatus.ACTIVE} entity={StatusBadgeEntity.Infrastructure} />);
      expect(screen.getByTestId('status-badge-v2')).toBeInTheDocument();
      expect(screen.getByText('CONNECTED')).toBeInTheDocument();
    });

    test('renders INACTIVE status with correct text', () => {
      render(<StatusBadgeV2 status={ChaosInfrastructureStatus.INACTIVE} entity={StatusBadgeEntity.Infrastructure} />);
      expect(screen.getByTestId('status-badge-v2')).toBeInTheDocument();
      expect(screen.getByText('INACTIVE')).toBeInTheDocument();
    });
  });
});
