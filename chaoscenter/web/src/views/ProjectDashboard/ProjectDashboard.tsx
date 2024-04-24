import { Button, ButtonVariation, Layout, useToggleOpen, ExpandingSearchInput } from '@harnessio/uicore';
import React from 'react';
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import { Dialog } from '@blueprintjs/core';
import { ListProjectsOkResponse, Project } from '@api/auth';
import DefaultLayoutTemplate from '@components/DefaultLayout';
import Loader from '@components/Loader';
import ProjectDashboardCard from '@components/ProjectDashboardCard/ProjectDashboardCard';
import CreateProjectController from '@controllers/CreateProject/CreateProject';
import { useStrings } from '@strings';
import projectImage from '../../images/projectmanagement.svg';

interface ProjectDashboardViewProps {
  projects: Project[] | undefined;
  loading: boolean;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  listProjectRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ListProjectsOkResponse, unknown>>;
}

export default function ProjectDashboardView(props: ProjectDashboardViewProps): React.ReactElement {
  const { projects, searchTerm, setSearchTerm, listProjectRefetch } = props;
  const {
    isOpen: isCreateProjectModalOpen,
    open: openCreateProjectModal,
    close: closeCreateProjectModal
  } = useToggleOpen();
  const { getString } = useStrings();

  const filterBar = (
    <Layout.Horizontal width={'100%'} flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <Layout.Horizontal spacing={'medium'}>
        <Button
          text={getString('createProject')}
          variation={ButtonVariation.PRIMARY}
          icon="plus"
          onClick={() => openCreateProjectModal()}
        />
        <ExpandingSearchInput
          alwaysExpanded
          width={280}
          placeholder={getString('searchForHub')}
          defaultValue={searchTerm}
          throttle={500}
          onChange={textQuery => setSearchTerm(textQuery.trim())}
        />
      </Layout.Horizontal>
      <Layout.Horizontal spacing={'medium'}></Layout.Horizontal>
      {isCreateProjectModalOpen && (
        <Dialog
          isOpen={isCreateProjectModalOpen}
          canOutsideClickClose={false}
          canEscapeKeyClose={false}
          onClose={() => closeCreateProjectModal()}
        >
          <CreateProjectController listProjectRefetch={listProjectRefetch} handleClose={closeCreateProjectModal} />
        </Dialog>
      )}
    </Layout.Horizontal>
  );

  const CreateProjectButton = (
    <>
      <Button
        text={getString('createProject')}
        variation={ButtonVariation.PRIMARY}
        icon="plus"
        onClick={() => openCreateProjectModal()}
      />
      {isCreateProjectModalOpen && (
        <Dialog
          isOpen={isCreateProjectModalOpen}
          canOutsideClickClose={false}
          canEscapeKeyClose={false}
          onClose={() => closeCreateProjectModal()}
        >
          <CreateProjectController listProjectRefetch={listProjectRefetch} handleClose={closeCreateProjectModal} />
        </Dialog>
      )}
    </>
  );

  return (
    <DefaultLayoutTemplate title={'Projects'} breadcrumbs={[]} subHeader={projects?.length ? filterBar : ''}>
      <Loader
        loading={props.loading}
        noData={{
          when: () => projects?.length == 0,
          messageTitle: 'No projects',
          message: 'There are no projects.',
          image: projectImage,
          button: CreateProjectButton
        }}
      >
        <ProjectDashboardCard listProjectRefetch={listProjectRefetch} projects={projects} />
      </Loader>
    </DefaultLayoutTemplate>
  );
}
