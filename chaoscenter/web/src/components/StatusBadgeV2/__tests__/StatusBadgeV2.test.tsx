import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

    test('renders with tooltip prop and shows status text', async () => {
      render(
        <StatusBadgeV2
          status={ExperimentRunStatus.COMPLETED}
          entity={StatusBadgeEntity.ExperimentRun}
          tooltip="Test tooltip"
        />
      );
      expect(screen.getByTestId('status-badge-v2')).toBeInTheDocument();
      expect(screen.getByText('COMPLETED')).toBeInTheDocument();

      await userEvent.hover(screen.getByText('COMPLETED'));
      expect(await screen.findByText('Test tooltip')).toBeInTheDocument();
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
