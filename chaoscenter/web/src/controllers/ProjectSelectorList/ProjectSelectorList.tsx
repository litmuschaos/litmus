import React from 'react';
import { ExpandingSearchInput } from '@harnessio/uicore';
import ProjectSelectorListView from '@views/ProjectSelectorList';
import { useListProjectsQuery } from '@api/auth';

export default function ProjectSelectorListController(): React.ReactElement {
  const [searchText, setSearchText] = React.useState<string>('');

  const { data: projectList, isLoading } = useListProjectsQuery({});

  const filteredProjectList = React.useMemo(() => {
    if (!projectList?.data) return undefined;
    return projectList.data.filter(project => project?.name?.toLowerCase().includes(searchText.toLowerCase()));
  }, [projectList, searchText]);

  const searchBar = <ExpandingSearchInput alwaysExpanded onChange={e => setSearchText(e)} />;

  return (
    <ProjectSelectorListView
      projectList={filteredProjectList}
      searchBar={searchBar}
      totalProjects={projectList?.data?.length ?? 0}
      searchTerm={searchText}
      loading={isLoading}
    />
  );
}
