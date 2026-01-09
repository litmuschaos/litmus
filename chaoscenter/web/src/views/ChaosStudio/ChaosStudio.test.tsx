import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { Route } from 'react-router-dom';

import { TestWrapper } from 'utils/testUtils';
import { StudioMode } from '@models';
import ChaosStudioView from './ChaosStudio';

jest.mock('@components/MainNav', () => ({
  __esModule: true,
  default: function MockMainNav() {
    return null;
  }
}));

jest.mock('@components/SideNav', () => ({
  __esModule: true,
  default: function MockSideNav() {
    return null;
  }
}));

jest.mock('@components/LitmusBreadCrumbs', () => ({
  __esModule: true,
  default: function MockLitmusBreadCrumbs() {
    return null;
  }
}));

jest.mock('@views/StudioOverview', () => ({
  __esModule: true,
  default: function MockStudioOverviewView() {
    return <div>overview</div>;
  }
}));

jest.mock('@views/StudioSchedule', () => ({
  __esModule: true,
  default: function MockStudioScheduleView() {
    return <div>schedule</div>;
  }
}));

jest.mock('@views/ExperimentYAMLBuilder', () => ({
  __esModule: true,
  default: function MockExperimentYamlBuilderView() {
    return <div>yaml-builder</div>;
  }
}));

jest.mock('@views/ExperimentVisualBuilder/ExperimentVisualBuilder', () => ({
  __esModule: true,
  default: function MockExperimentVisualBuilderView() {
    return <div>visual-builder</div>;
  }
}));

jest.mock('@errors', () => ({
  __esModule: true,
  ParentComponentErrorWrapper: function MockParentComponentErrorWrapper(props: { children: React.ReactNode }) {
    return <>{props.children}</>;
  }
}));

jest.mock('./StudioActionButtons', () => ({
  __esModule: true,
  default: function MockStudioActionButtons(props: { runExperimentHandler: () => void }) {
    return (
      <button type="button" onClick={props.runExperimentHandler}>
        run
      </button>
    );
  }
}));

jest.mock('@harnessio/uicore', () => {
  const actual = jest.requireActual('@harnessio/uicore');
  return {
    ...actual,
    useToaster: () => ({
      showError: jest.fn(),
      showSuccess: jest.fn(),
      showWarning: jest.fn()
    })
  };
});

describe('ChaosStudioView', () => {
  test('prevents rapid double-click from running twice (ghost loading regression)', () => {
    window.history.pushState({}, 'Test', '/studio/exp-1?tab=OVERVIEW&unsavedChanges=false');

    const runChaosExperimentMutation = jest.fn();

    render(
      <TestWrapper>
        <Route path="/studio/:experimentKey">
          <ChaosStudioView
            saveChaosExperimentMutation={jest.fn() as never}
            runChaosExperimentMutation={runChaosExperimentMutation as never}
            loading={{ saveChaosExperiment: false, runChaosExperiment: false }}
            mode={StudioMode.EDIT}
          />
        </Route>
      </TestWrapper>
    );

    const runButton = screen.getByRole('button', { name: 'run' });

    fireEvent.click(runButton);
    fireEvent.click(runButton);

    expect(runChaosExperimentMutation).toHaveBeenCalledTimes(1);
  });
});
