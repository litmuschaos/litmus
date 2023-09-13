import React from 'react';
import { AvatarGroup, Card, Container, Text } from '@harnessio/uicore';
import { FontVariation, Color } from '@harnessio/design-system';
import { useHistory } from 'react-router-dom';
import { useAppStore } from '@context';
import { useStrings } from '@strings';
import type { Project } from '@api/auth';
import { setUserDetails } from '@utils';
import styles from './ProjectCard.module.scss';

interface ProjectCardProps {
  data: Project;
}

export default function ProjectCard({ data }: ProjectCardProps): React.ReactElement {
  const { getString } = useStrings();
  const history = useHistory();
  const { projectID, currentUserInfo, updateAppStore } = useAppStore();

  const isSelected = projectID === data.projectID;
  const collaborators = data.members?.map(member => {
    return {
      name: member.username,
      email: member.email
    };
  });

  const handleProjectSelect = (): void => {
    const projectRole = data.members?.find(member => member.userID === currentUserInfo?.ID)?.role;
    updateAppStore({ projectID: data.projectID, projectName: data.name });
    setUserDetails({
      projectRole,
      projectID: data.projectID
    });
    history.replace(`/`);
  };

  return (
    <Card selected={isSelected} onClick={handleProjectSelect} className={styles.projectCard}>
      <Container padding="small">
        <Text font={{ variation: FontVariation.CARD_TITLE }} lineClamp={1} color={Color.BLACK}>
          {data?.name}
        </Text>
        <Text font={{ variation: FontVariation.TINY }} lineClamp={1} color={Color.GREY_700}>
          {getString('id')}: {data.projectID ?? getString('NASlash')}
        </Text>
        <Container margin={{ top: 'small' }}>
          <Text
            font={{ variation: FontVariation.SMALL, weight: 'light' }}
            color={Color.BLACK}
            margin={{ bottom: 'xsmall' }}
          >
            {getString('collaborators')} ({collaborators?.length ?? 0})
          </Text>
          <AvatarGroup
            avatarGroupProps={{ hoverCard: false }}
            size="small"
            restrictLengthTo={5}
            avatars={collaborators ?? [{}]}
          />
        </Container>
      </Container>
    </Card>
  );
}
