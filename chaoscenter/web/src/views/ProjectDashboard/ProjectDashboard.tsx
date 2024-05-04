import { Button, ButtonVariation, Layout, useToggleOpen, Container } from '@harnessio/uicore';
import React from 'react';
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import { Dialog } from '@blueprintjs/core';
import { ListProjectsOkResponse, Project } from '@api/auth';
import DefaultLayoutTemplate from '@components/DefaultLayout';
import Loader from '@components/Loader';
import ProjectDashboardCardContainer from '@components/ProjectDashboardCardContainer/ProjectDashboardCardContainer';
import CreateProjectController from '@controllers/CreateProject/CreateProject';
import { useStrings } from '@strings';
import NoFilteredData from '@components/NoFilteredData';
import projectImage from '../../images/projectmanagement.svg';

interface ProjectDashboardViewProps {
  projects: Project[] | undefined;
  loading: boolean;
  listProjectRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ListProjectsOkResponse, unknown>>;
  pagination: React.ReactElement;
  filterDropDown: React.ReactElement;
  projectSearchBar: React.ReactElement;
  resetFilterButton: React.ReactElement;
  sortDropDown: React.ReactElement;
}

export default function ProjectDashboardView(props: ProjectDashboardViewProps): React.ReactElement {
  const {
    projects,
    listProjectRefetch,
    pagination,
    filterDropDown,
    projectSearchBar,
    resetFilterButton,
    sortDropDown
  } = props;
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
        {filterDropDown}
        {sortDropDown}
        {resetFilterButton}
      </Layout.Horizontal>
      <Layout.Horizontal spacing={'medium'}>{projectSearchBar}</Layout.Horizontal>
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
    <DefaultLayoutTemplate title={getString('project')} breadcrumbs={[]} subHeader={filterBar}>
      <Loader
        loading={props.loading}
        noData={{
          when: () => projects?.length == 0,
          messageTitle: getString('projectDashboard.noProjectText'),
          message: getString('projectDashboard.noProjectDescription'),
          image: projectImage,
          button: CreateProjectButton
        }}
      >
        <Layout.Vertical
          flex={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
          style={{ gap: '1rem' }}
          height="100%"
        >
          {projects ? (
            <ProjectDashboardCardContainer listProjectRefetch={listProjectRefetch} projects={projects} />
          ) : (
            <NoFilteredData resetButton={resetFilterButton} />
          )}
          <Container width="100%">{pagination}</Container>
        </Layout.Vertical>
      </Loader>
    </DefaultLayoutTemplate>
  );
}
