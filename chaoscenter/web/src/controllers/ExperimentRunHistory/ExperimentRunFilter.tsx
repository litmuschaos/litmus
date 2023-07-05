import React from 'react';
import {
  type SelectOption,
  DropDown,
  Button,
  DateRangePickerButton,
  ButtonVariation,
  ButtonSize,
  ExpandingSearchInputHandle,
  ExpandingSearchInput
} from '@harnessio/uicore';
import { useStrings } from '@strings';
import { ExperimentRunFaultStatus, ExperimentRunStatus } from '@api/entities';
import { ExperimentRunFilter, ExperimentRunFilterAction, ExperimentRunFilterActionKind } from '@hooks';

export interface FilterProps {
  state: ExperimentRunFilter;
  resetPage: () => void;
  dispatch: React.Dispatch<ExperimentRunFilterAction>;
}

export const statusFilterItems: SelectOption[] = [
  { label: ExperimentRunStatus.COMPLETED, value: ExperimentRunStatus.COMPLETED },
  { label: ExperimentRunStatus.RUNNING, value: ExperimentRunStatus.RUNNING },
  { label: ExperimentRunStatus.ERROR, value: ExperimentRunStatus.ERROR },
  { label: ExperimentRunStatus.STOPPED, value: ExperimentRunStatus.STOPPED },
  { label: ExperimentRunStatus.TIMEOUT, value: ExperimentRunStatus.TIMEOUT },
  { label: ExperimentRunStatus.QUEUED, value: ExperimentRunStatus.QUEUED },
  { label: ExperimentRunStatus.NA, value: ExperimentRunStatus.NA }
];

export const StatusDropDown = ({ state, dispatch, resetPage }: FilterProps): React.ReactElement => {
  const { getString } = useStrings();
  return (
    <DropDown
      addClearBtn
      width={150}
      placeholder={getString('status')}
      items={statusFilterItems}
      value={state.experimentRunStatus?.[0] ?? null}
      onChange={selectedItem => {
        resetPage();
        dispatch({
          type: ExperimentRunFilterActionKind.CHANGE_RUN_STATUS,
          payload: {
            experimentRunStatus:
              selectedItem.value === '' ? undefined : [selectedItem.value as ExperimentRunFaultStatus]
          }
        });
      }}
    />
  );
};

export const DateRangePicker = ({ state, dispatch, resetPage }: FilterProps): React.ReactElement => {
  const { getString } = useStrings();
  // <!-- force rerender is required since date picker button has no hooks/calls to reset it's state on resetting filters, problem with blueprintjs component itself -->
  const [render, forceRerender] = React.useState<number>(0);

  React.useEffect(() => {
    if (state.dateRange === undefined) forceRerender(oldState => oldState + 1);
  }, [state]);
  return (
    <DateRangePickerButton
      key={render}
      variation={ButtonVariation.SECONDARY}
      icon="calendar"
      rightIcon="main-chevron-down"
      size={ButtonSize.MEDIUM}
      initialButtonText={getString('selectTimeframe')}
      renderButtonText={(selectedDates: [Date, Date]) => {
        return `${selectedDates[0].toLocaleDateString()} - ${selectedDates[1].toLocaleDateString()}`;
      }}
      onChange={(selectedDates: [Date, Date]) => {
        resetPage();
        dispatch({
          type: ExperimentRunFilterActionKind.CHANGE_DATE_RANGE,
          payload: {
            dateRange: {
              startDate: selectedDates[0].setHours(0, 0, 0).valueOf().toString(),
              endDate: selectedDates[1].setHours(23, 59, 59).valueOf().toString()
            }
          }
        });
      }}
    />
  );
};

export const ExperimentRunSearchBar = ({ state, dispatch, resetPage }: FilterProps): React.ReactElement => {
  const { getString } = useStrings();
  const ref = React.useRef<ExpandingSearchInputHandle | undefined>();
  React.useEffect(() => {
    if (state.experimentRunID === '' && ref.current) {
      ref.current.clear();
    }
  }, [state.experimentRunID]);
  return (
    <ExpandingSearchInput
      ref={ref}
      width={250}
      alwaysExpanded
      placeholder={getString('searchExperimentRunID')}
      throttle={500}
      autoFocus={false}
      onChange={runID => {
        if (!(state.experimentRunID === runID)) {
          resetPage();
          dispatch({
            type: ExperimentRunFilterActionKind.CHANGE_RUN_ID,
            payload: {
              experimentRunID: runID
            }
          });
        }
      }}
    />
  );
};

export const ResetFilterButton = ({ dispatch, resetPage }: FilterProps): React.ReactElement => {
  const { getString } = useStrings();
  return (
    <Button
      icon="reset"
      variation={ButtonVariation.SECONDARY}
      onClick={() => {
        resetPage();
        dispatch({
          type: ExperimentRunFilterActionKind.RESET_FILTERS,
          payload: {}
        });
      }}
      text={getString('resetFilters')}
    />
  );
};
