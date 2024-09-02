import { Button, ButtonVariation, Card, Container, Layout, Popover, Text } from '@harnessio/uicore';
import React, { useState } from 'react';
import { Color, FontVariation } from '@harnessio/design-system';
import { Classes, PopoverInteractionKind, Position, Menu, Dialog } from '@blueprintjs/core';
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import { useHistory } from 'react-router-dom';
import { ListProjectsOkResponse, Project } from '@api/auth';
import CustomTagsPopover from '@components/CustomTagsPopover';
import { useStrings } from '@strings';
import ProjectDashboardCardMenuController from '@controllers/ProjectDashboardCardMenu';
import { setUserDetails, toSentenceCase } from '@utils';
import { useAppStore } from '@context';
import css from './ProjectDashboardCardContainer.module.scss';

interface ProjectDashboardCardProps {
  projects: Project[] | undefined;
  listProjectRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ListProjectsOkResponse, unknown>>;
}

export default function ProjectDashboardCardContainer(props: ProjectDashboardCardProps): React.ReactElement {
  const { projects, listProjectRefetch } = props;
  const [projectIdToDelete, setProjectIdToDelete] = useState<string>();
  const { getString } = useStrings();
  const history = useHistory();
  const { updateAppStore, currentUserInfo } = useAppStore();

  const handleProjectSelect = (project: Project): void => {
    const projectRole = project.members?.find(member => member.userID === currentUserInfo?.ID)?.role;
    updateAppStore({ projectID: project.projectID, projectName: project.name });
    setUserDetails({
      projectRole,
      projectID: project.projectID
    });
    history.replace(`/`);
  };

  return (
    <Container width="100%">
      <Container padding={{ top: 'large', bottom: 'xxlarge' }} className={css.cardsMainContainer}>
        {projects?.map(project => {
          return (
            <Card
              onClick={() => handleProjectSelect(project)}
              className={css.projectDashboardCard}
              key={project.projectID}
              interactive
            >
              {/* ProjectMenu */}
              <Layout.Vertical
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                flex={{ justifyContent: 'center', alignItems: 'flex-end' }}
              >
                <Popover
                  className={Classes.DARK}
                  position={Position.RIGHT}
                  interactionKind={PopoverInteractionKind.HOVER}
                  usePortal
                >
                  <Button variation={ButtonVariation.ICON} icon="Options" />
                  <Menu style={{ backgroundColor: 'unset' }}>
                    <Menu.Item
                      text={getString('deleteProject')}
                      icon={'delete'}
                      onClick={() => setProjectIdToDelete(project.projectID)}
                    />
                  </Menu>
                </Popover>
              </Layout.Vertical>
              <Layout.Vertical width={200} className={css.card}>
                <Container>
                  <Text
                    font={{ size: 'medium', weight: 'bold' }}
                    color={Color.BLACK}
                    width="70%"
                    lineClamp={1}
                    margin={{ top: 'xsmall', bottom: 'xsmall' }}
                  >
                    {project.name}
                  </Text>
                  <Text
                    font={{ size: 'small', weight: 'light' }}
                    color={Color.BLACK}
                    width="70%"
                    lineClamp={2}
                    margin={{ top: 'xsmall', bottom: 'xsmall' }}
                  >
                    {project.description}
                  </Text>
                  <CustomTagsPopover
                    // custom tags here
                    tags={project.tags ? project.tags : ['Project', 'ChaosExperiment']}
                    title={getString('nameIdDescriptionTags.tagsLabel')}
                  />
                </Container>
                <Container
                  margin={{ top: 'medium' }}
                  padding={{ top: 'medium', bottom: 'large' }}
                  border={{ top: true }}
                  width="100%"
                >
                  <Layout.Horizontal data-testid="details" margin={{ top: 'small' }} spacing="medium">
                    <Text font={{ variation: FontVariation.SMALL, weight: 'semi-bold' }} color={Color.PRIMARY_7}>
                      {getString('members')}: {project.members ? project.members.length : 0}
                    </Text>
                    <Text font={{ variation: FontVariation.SMALL, weight: 'semi-bold' }} color={Color.PRIMARY_7}>
                      {getString('state')}: {toSentenceCase(project.state ?? '')}
                    </Text>
                  </Layout.Horizontal>
                </Container>
                <Text
                  font={{ size: 'small', weight: 'light' }}
                  color={Color.BLACK}
                  width="70%"
                  lineClamp={1}
                  margin={{ top: 'xsmall', bottom: 'xsmall' }}
                >
                  {getString('createdBy')}: {project.createdBy?.username}
                </Text>
              </Layout.Vertical>
            </Card>
          );
        })}
      </Container>
      {projectIdToDelete && (
        <Dialog
          isOpen={!!projectIdToDelete}
          canOutsideClickClose={false}
          canEscapeKeyClose={false}
          usePortal
          onClose={() => setProjectIdToDelete(undefined)}
          className={css.deleteProjectDialog}
        >
          <ProjectDashboardCardMenuController
            listProjectRefetch={listProjectRefetch}
            projectID={projectIdToDelete}
            handleClose={() => setProjectIdToDelete(undefined)}
          />
        </Dialog>
      )}
    </Container>
  );
}
