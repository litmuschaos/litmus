import React from 'react';
import {
  Button,
  DateRangePickerButton,
  ButtonVariation,
  ButtonSize,
  ExpandingSearchInputHandle,
  ExpandingSearchInput,
  SelectOption,
  DropDown,
  MultiSelectDropDown,
  MultiSelectOption,
  useToaster
} from '@harnessio/uicore';
import { useStrings } from '@strings';
import { ExperimentFilterActionKind, ExperimentFilter, ExperimentFilterAction } from '@hooks';
import { ExperimentListType, InfrastructureType } from '@api/entities';
import { listChaosInfraMinimal } from '@api/core';
import { getScope } from '@utils';

export interface FilterProps {
  state: ExperimentFilter;
  resetPage: () => void;
  dispatch: React.Dispatch<ExperimentFilterAction>;
}

export const ScheduleDropDown = ({ state, dispatch, resetPage }: FilterProps): React.ReactElement => {
  const { getString } = useStrings();

  const statusFilterItems: SelectOption[] = [
    { value: ExperimentListType.CRON, label: getString('cronSelectOption'), icon: { name: 'repeat' } },
    {
      value: ExperimentListType.NON_CRON,
      label: getString('nonCronSelectOption'),
      icon: { name: 'yaml-builder-trigger' }
    }
  ];
  return (
    <DropDown
      addClearBtn
      width={195}
      placeholder={getString('scheduleType')}
      items={statusFilterItems}
      value={state.schedule}
      onChange={selectedItem => {
        resetPage();
        dispatch({
          type: ExperimentFilterActionKind.CHANGE_SCHEDULE_TYPE,
          payload: {
            schedule: selectedItem.value === '' ? undefined : (selectedItem.value as ExperimentListType)
          }
        });
      }}
    />
  );
};

export const InfraTypeDropdown = ({ state, dispatch, resetPage }: FilterProps): React.ReactElement => {
  const { getString } = useStrings();

  const infraTypeItems: MultiSelectOption[] = [
    { label: InfrastructureType.KUBERNETES, value: InfrastructureType.KUBERNETES }
  ];

  return (
    <MultiSelectDropDown
      width={190}
      placeholder={getString('infrastructureType')}
      items={infraTypeItems}
      value={
        state.infraType !== undefined
          ? state.infraType.map(infra => ({ label: infra, value: infra } as MultiSelectOption))
          : []
      }
      onChange={selectedItem => {
        resetPage();
        dispatch({
          type: ExperimentFilterActionKind.CHANGE_INFRA_TYPE,
          payload: {
            infraType: selectedItem.map(item => item.value as InfrastructureType)
          }
        });
      }}
    />
  );
};

// <!-- unused for now, since it only lists k8s infra -->
export const InfraIdDropdown = ({ state, dispatch, resetPage }: FilterProps): React.ReactElement => {
  const scope = getScope();
  const { getString } = useStrings();
  const { showError } = useToaster();

  const { data: listChaosDelegateData } = listChaosInfraMinimal({
    ...scope,
    options: {
      onError: err => {
        showError(err.message);
      }
    }
  });

  const infrastructureList: MultiSelectOption[] =
    listChaosDelegateData?.listInfras?.infras?.map(infrastructure => ({
      label: infrastructure.name,
      value: infrastructure.infraID
    })) ?? [];

  return (
    <DropDown
      addClearBtn
      width={190}
      placeholder={getString('infrastructure')}
      items={infrastructureList}
      value={state.infraID}
      onChange={selectedItem => {
        resetPage();
        dispatch({
          type: ExperimentFilterActionKind.CHANGE_INFRA_ID,
          payload: {
            infraID: selectedItem.value as string
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
          type: ExperimentFilterActionKind.CHANGE_DATE_RANGE,
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

export const ExperimentSearchBar = ({ state, dispatch, resetPage }: FilterProps): React.ReactElement => {
  const { getString } = useStrings();
  const ref = React.useRef<ExpandingSearchInputHandle | undefined>();
  React.useEffect(() => {
    if (state.experimentName === '' && ref.current) {
      ref.current.clear();
    }
  }, [state.experimentName]);
  return (
    <ExpandingSearchInput
      ref={ref}
      width={250}
      alwaysExpanded
      placeholder={getString('search')}
      throttle={500}
      autoFocus={false}
      onChange={workflowName => {
        if (!(state.experimentName === workflowName)) {
          resetPage();
          dispatch({
            type: ExperimentFilterActionKind.CHANGE_EXPERIMENT_NAME,
            payload: {
              experimentName: workflowName
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
          type: ExperimentFilterActionKind.RESET_FILTERS,
          payload: {}
        });
      }}
      text={getString('resetFilters')}
    />
  );
};
