import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import ExperimentAndRunCard, { ExperimentAndRunCardType } from '../ExperimentAndRunCard';

describe('Experiment And Run Card', () => {
  test('should render the component', () => {
    const { getByTestId } = render(
      <ExperimentAndRunCard value={10} title="Total Experiments" type={ExperimentAndRunCardType.EXPERIMENT} />
    );
    expect(getByTestId('experimentAndRunCardContainer')).toBeInTheDocument();
  });
  test('should render correct container classnames', () => {
    const { getByTestId } = render(
      <ExperimentAndRunCard value={10} title="Total Experiments" type={ExperimentAndRunCardType.EXPERIMENT} fullWidth />
    );
    expect(getByTestId('experimentAndRunCardContainer')).toHaveClass('fullWidth');
    expect(getByTestId('experimentAndRunCardContainer')).toHaveClass('experiment');
    expect(getByTestId('experimentAndRunCardContainer')).not.toHaveClass('undefined');
    expect(getByTestId('experimentAndRunCardContainer')).not.toHaveClass('run');
  });
  test('should render correct values', () => {
    const { getByTestId } = render(
      <ExperimentAndRunCard title="test title" type={ExperimentAndRunCardType.RUN} value={20} />
    );
    expect(getByTestId('experimentAndRunCardTitle')).toHaveTextContent('test title');
    expect(getByTestId('experimentAndRunCardValue')).toHaveTextContent('20');
    expect(getByTestId('experimentAndRunCardContainer')).not.toHaveClass('undefined');
  });
  test('should render undefined values', () => {
    const { getByTestId } = render(
      <ExperimentAndRunCard title="test title" value={undefined} type={ExperimentAndRunCardType.EXPERIMENT} />
    );
    expect(getByTestId('experimentAndRunCardTitle')).toHaveTextContent('test title');
    expect(getByTestId('experimentAndRunCardValue')).toHaveTextContent('--');
    expect(getByTestId('experimentAndRunCardContainer')).toHaveClass('undefined');
  });
  test('should render correct svg', () => {
    const { getByTestId } = render(
      <ExperimentAndRunCard title="test title" type={ExperimentAndRunCardType.RUN} value={20} />
    );
    expect(getByTestId('experimentAndRunCardImage')).toHaveAttribute('alt', 'run');
  });
});
