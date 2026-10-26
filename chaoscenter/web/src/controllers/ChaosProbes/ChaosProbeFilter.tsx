import React from 'react';
import {
  Button,
  DateRangePickerButton,
  ButtonVariation,
  ButtonSize,
  ExpandingSearchInputHandle,
  ExpandingSearchInput,
  MultiSelectDropDown,
  MultiSelectOption
} from '@harnessio/uicore';
import { ProbeFilter, ProbeFilterAction, ProbeFilterActionKind } from 'hooks/useProbeFilter';
import { useStrings } from '@strings';
import { ProbeType } from '@api/entities';

export interface ChaosProbeFilterProps {
  state: ProbeFilter;
  resetPage: () => void;
  dispatch: React.Dispatch<ProbeFilterAction>;
}

export const ProbeTypeDropdown = ({ state, dispatch, resetPage }: ChaosProbeFilterProps): React.ReactElement => {
  const { getString } = useStrings();

  const probeTypeItems: MultiSelectOption[] = [
    { label: 'HTTP', value: ProbeType.HTTP },
    { label: 'CMD', value: ProbeType.CMD },
    { label: 'PROM', value: ProbeType.PROM },
    { label: 'K8S', value: ProbeType.K8S }
  ];

  return (
    <MultiSelectDropDown
      width={190}
      placeholder={getString('probeType')}
      items={probeTypeItems}
      value={
        state.probeType !== undefined
          ? state.probeType.map(type => ({ label: type, value: type } as MultiSelectOption))
          : []
      }
      onChange={selectedItem => {
        resetPage();
        dispatch({
          type: ProbeFilterActionKind.CHANGE_PROBE_TYPE,
          payload: {
            probeType: selectedItem.map(item => item.value as ProbeType)
          }
        });
      }}
    />
  );
};

export const DateRangePicker = ({ state, dispatch, resetPage }: ChaosProbeFilterProps): React.ReactElement => {
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
          type: ProbeFilterActionKind.CHANGE_DATE_RANGE,
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

export const ProbeSearchBar = ({ state, dispatch, resetPage }: ChaosProbeFilterProps): React.ReactElement => {
  const { getString } = useStrings();
  const ref = React.useRef<ExpandingSearchInputHandle | undefined>();
  React.useEffect(() => {
    if (state.probeName === '' && ref.current) {
      ref.current.clear();
    }
  }, [state.probeName]);
  return (
    <ExpandingSearchInput
      ref={ref}
      width={250}
      alwaysExpanded
      placeholder={getString('search')}
      throttle={500}
      autoFocus={false}
      onChange={probeName => {
        if (!(state.probeName === probeName)) {
          resetPage();
          dispatch({
            type: ProbeFilterActionKind.CHANGE_PROBE_NAME,
            payload: {
              probeName: probeName
            }
          });
        }
      }}
    />
  );
};

export const ResetFilterButton = ({ dispatch, resetPage }: ChaosProbeFilterProps): React.ReactElement => {
  const { getString } = useStrings();
  return (
    <Button
      icon="reset"
      variation={ButtonVariation.SECONDARY}
      onClick={() => {
        resetPage();
        dispatch({
          type: ProbeFilterActionKind.RESET_FILTERS,
          payload: {}
        });
      }}
      text={getString('resetFilters')}
    />
  );
};
