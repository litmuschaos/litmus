import React from 'react';
import { ExpandingSearchInput } from '@harness/uicore';
import ProjectSelectorListView from '@views/ProjectSelectorList';
import type { ListProject } from '@models';
import config from '@config';
import useRequest from '@api/useRequest';

interface ListProjectResponse {
  data: ListProject[];
}

export default function ProjectSelectorListController(): React.ReactElement {
  const [searchText, setSearchText] = React.useState<string>('');

  const { data: projectList, loading } = useRequest<ListProjectResponse>({
    baseURL: config.restEndpoints?.authUri,
    url: `/list_projects`,
    method: 'GET'
  });

  const filteredProjectList = React.useMemo(() => {
    if (!projectList) return undefined;
    return projectList.data.filter(project => project.Name.toLowerCase().includes(searchText.toLowerCase()));
  }, [projectList, searchText]);

  const searchBar = <ExpandingSearchInput alwaysExpanded onChange={e => setSearchText(e)} />;

  return (
    <ProjectSelectorListView
      projectList={filteredProjectList}
      searchBar={searchBar}
      totalProjects={projectList?.data.length ?? 0}
      searchTerm={searchText}
      loading={loading}
    />
  );
}
