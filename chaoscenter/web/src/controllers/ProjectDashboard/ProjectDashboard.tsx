import React from 'react';
import { Pagination, PaginationProps } from '@harnessio/uicore';
import { useListProjectsQuery } from '@api/auth';
import ProjectDashboardView from '@views/ProjectDashboard';
import { useProjectFilter, useSearchParams, useUpdateSearchParams } from '@hooks';
import { FilterDropDown, FilterProps, ProjectSearchBar, ResetFilterButton, SortDropDown } from './ProjectFilters';

export interface ProjectPaginationProps extends PaginationProps {
  page: number;
  limit: number;
}

export default function ProjectDashboardController(): React.ReactElement {
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();
  const { state, dispatch } = useProjectFilter();

  // State for pagination
  const page = parseInt(searchParams.get('page') ?? '0');
  const limit = parseInt(searchParams.get('limit') ?? '10');

  const setPage = (newPage: number): void => {
    updateSearchParams({ page: newPage.toString() });
  };

  const setLimit = (newLimit: number): void => {
    updateSearchParams({ limit: newLimit.toString() });
  };

  const resetPage = (): void => {
    page !== 0 && updateSearchParams({ page: '0' });
  };

  const {
    data: projectData,
    isLoading,
    refetch
  } = useListProjectsQuery({
    queryParams: {
      page: page,
      limit: limit,
      sortField: state.sortField,
      sortAscending: state.sortAscending,
      projectName: state.projectName,
      createdByMe: state.createdByMe
    }
  });

  const projects = projectData?.data?.projects;
  const totalNumberOfProjects = projectData?.data?.totalNumberOfProjects || 0;

  const PaginationComponent = (): React.ReactElement => {
    return (
      <Pagination
        itemCount={totalNumberOfProjects}
        pageSize={limit}
        pageCount={Math.ceil(totalNumberOfProjects / limit)}
        pageIndex={page}
        gotoPage={pageNumber => setPage(pageNumber)}
        showPagination={true}
        pageSizeOptions={[5, 10, 20]}
        onPageSizeChange={newLimit => setLimit(newLimit)}
      />
    );
  };

  const filterProps: FilterProps = {
    state,
    dispatch,
    resetPage
  };

  return (
    <ProjectDashboardView
      projects={projects}
      loading={isLoading}
      projectSearchBar={<ProjectSearchBar {...filterProps} />}
      resetFilterButton={<ResetFilterButton {...filterProps} />}
      filterDropDown={<FilterDropDown {...filterProps} />}
      sortDropDown={<SortDropDown {...filterProps} />}
      listProjectRefetch={refetch}
      pagination={<PaginationComponent />}
    />
  );
}
