import {
  Button,
  ButtonVariation,
  DropDown,
  ExpandingSearchInput,
  ExpandingSearchInputHandle,
  SelectOption
} from '@harnessio/uicore';
import React from 'react';
import { ProjectFilter, ProjectFilterAction, ProjectFilterActionKind } from '@hooks';
import { useStrings } from '@strings';
import { ProjectFiltersList, SortListTypes } from './helper';

export interface FilterProps {
  state: ProjectFilter;
  resetPage: () => void;
  dispatch: React.Dispatch<ProjectFilterAction>;
}

export const ProjectSearchBar = ({ state, dispatch, resetPage }: FilterProps): React.ReactElement => {
  const { getString } = useStrings();
  const ref = React.useRef<ExpandingSearchInputHandle | undefined>();
  React.useEffect(() => {
    if (state.projectName === '' && ref.current) {
      ref.current.clear();
    }
  }, [state.projectName]);
  return (
    <ExpandingSearchInput
      ref={ref}
      width={250}
      alwaysExpanded
      placeholder={getString('search')}
      throttle={500}
      autoFocus={false}
      onChange={workflowName => {
        if (state.projectName !== workflowName.toLocaleLowerCase()) {
          resetPage();
          dispatch({
            type: ProjectFilterActionKind.CHANGE_PROJECT_NAME,
            payload: {
              projectName: workflowName
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
          type: ProjectFilterActionKind.RESET_FILTERS,
          payload: {}
        });
      }}
      text={getString('resetFilters')}
    />
  );
};

export const FilterDropDown = ({ state, dispatch, resetPage }: FilterProps): React.ReactElement => {
  const { getString } = useStrings();

  const statusFilterItems: SelectOption[] = [
    { value: ProjectFiltersList.CREATED_BY_USER, label: getString('createdByUser') },
    { value: ProjectFiltersList.INVITED_BY_OTHERS, label: getString('invitedByOthers') }
  ];
  return (
    <DropDown
      width={195}
      placeholder={getString('projectFilters')}
      items={statusFilterItems}
      value={state.createdByMe ? getString('createdByUser') : getString('invitedByOthers')}
      onChange={selectedItem => {
        resetPage();
        dispatch({
          type: ProjectFilterActionKind.CHANGE_CREATED_BY_ME,
          payload: {
            createdByMe: selectedItem.value === ProjectFiltersList.CREATED_BY_USER ? true : false
          }
        });
      }}
    />
  );
};

export const SortDropDown = ({ state, dispatch }: FilterProps): React.ReactElement => {
  const handleSortFieldChange = (selectedItem: SelectOption) => {
    dispatch({
      type: ProjectFilterActionKind.CHANGE_SORT_FIELD,
      payload: {
        sortField:
          (selectedItem.value as string) == SortListTypes.SortFieldName
            ? SortListTypes.SortFieldName
            : SortListTypes.SortFieldTime
      }
    });
  };

  const handleSortDirectionChange = (selectedItem: SelectOption) => {
    dispatch({
      type: ProjectFilterActionKind.CHANGE_SORT_ASCENDING,
      payload: { sortAscending: selectedItem.value === SortListTypes.SortDirectionAscending }
    });
  };

  const { getString } = useStrings();

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      {/* Outer dropdown for selecting sort field */}
      <DropDown
        width={195}
        placeholder={getString('sortField')}
        items={[
          { value: SortListTypes.SortFieldName, label: 'Name' },
          { value: SortListTypes.SortFieldTime, label: 'Time' }
        ]}
        value={state.sortField || ''}
        onChange={handleSortFieldChange}
      />

      {/* Inner dropdown for selecting ascending/descending */}
      {state.sortField && (
        <div style={{ marginLeft: '10px' }}>
          <DropDown
            width={195}
            placeholder={getString('sortDirection')}
            items={[
              { value: SortListTypes.SortDirectionAscending, label: 'Ascending' },
              { value: SortListTypes.SortDirectionDescending, label: 'Descending' }
            ]}
            value={state.sortAscending ? SortListTypes.SortDirectionAscending : SortListTypes.SortDirectionDescending}
            onChange={handleSortDirectionChange}
          />
        </div>
      )}
    </div>
  );
};
