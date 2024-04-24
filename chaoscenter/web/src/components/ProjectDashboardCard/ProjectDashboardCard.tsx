import { Button, ButtonVariation, Card, Container, Layout, Popover, Text } from '@harnessio/uicore';
import React, { useState } from 'react';
import { Color, FontVariation } from '@harnessio/design-system';
import { Classes, PopoverInteractionKind, Position, Menu, Dialog } from '@blueprintjs/core';
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import { ListProjectsOkResponse, Project } from '@api/auth';
import CustomTagsPopover from '@components/CustomTagsPopover';
import { useStrings } from '@strings';
import ProjectDashboardCardMenuController from '@controllers/ProjectDashboardCardMenu';
import css from './ProjectDashboardCard.module.scss';

interface ProjectDashboardCardProps {
  projects: Project[] | undefined;
  listProjectRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ListProjectsOkResponse, unknown>>;
}

export default function ProjectDashboardCard(props: ProjectDashboardCardProps): React.ReactElement {
  const { projects, listProjectRefetch } = props;
  const [projectId, setProjectId] = useState<string>();
  const { getString } = useStrings();

  return (
    <Container data-testid="hubContainer" className={css.pageMainContainer}>
      <Container padding={{ top: 'large', bottom: 'xxlarge' }} className={css.cardsMainContainer}>
        {projects?.map(project => {
          return (
            <Card className={css.projectDashboardCard} key={project.projectID} interactive>
              {/* ProjectMenu */}
              <Layout.Vertical flex={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                <Popover
                  className={Classes.DARK}
                  position={Position.LEFT}
                  interactionKind={PopoverInteractionKind.CLICK}
                  usePortal
                >
                  <Button variation={ButtonVariation.ICON} icon="Options" />
                  <Menu style={{ backgroundColor: 'unset' }}>
                    <Menu.Item
                      text={getString('deleteProject')}
                      icon={'delete'}
                      onClick={() => setProjectId(project.projectID)}
                    />
                  </Menu>
                </Popover>
              </Layout.Vertical>
              <Layout.Vertical width={200} className={css.card}>
                <Container>
                  <Text
                    font={{ size: 'medium', weight: 'bold' }}
                    color={Color.BLACK}
                    width="100%"
                    margin={{ top: 'xsmall', bottom: 'xsmall' }}
                  >
                    {project.name.length > 19 ? project.name.slice(0, 19) + '...' : project.name}
                  </Text>
                  <Text
                    font={{ size: 'small', weight: 'light' }}
                    color={Color.BLACK}
                    width="100%"
                    margin={{ top: 'xsmall', bottom: 'xsmall' }}
                  >
                    {/* todo */}
                    {'Project description here.'}
                  </Text>
                  <CustomTagsPopover
                    // custom tags here
                    tags={['Enterprise', 'ChaosHub']}
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
                      {getString('members')}: {project.members.length}
                    </Text>
                    <Text font={{ variation: FontVariation.SMALL, weight: 'semi-bold' }} color={Color.PRIMARY_7}>
                      {'state'}: {project.state}
                    </Text>
                  </Layout.Horizontal>
                </Container>
                <Text
                  font={{ size: 'small', weight: 'light' }}
                  color={Color.BLACK}
                  width="100%"
                  margin={{ top: 'xsmall', bottom: 'xsmall' }}
                >
                  {getString('createdBy')}: {project.createdBy?.username}
                </Text>
              </Layout.Vertical>
            </Card>
          );
        })}
      </Container>
      {projectId && (
        <Dialog
          isOpen={!!projectId}
          canOutsideClickClose={false}
          canEscapeKeyClose={false}
          usePortal
          onClose={() => setProjectId(undefined)}
          className={css.deleteProjectDialog}
        >
          <ProjectDashboardCardMenuController
            listProjectRefetch={listProjectRefetch}
            projectID={projectId}
            handleClose={() => setProjectId(undefined)}
          />
        </Dialog>
      )}
    </Container>
  );
}
