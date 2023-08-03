import React, { useContext } from 'react';
import { AvatarGroup, Card, Container, Text } from '@harnessio/uicore';
import { FontVariation, Color } from '@harnessio/design-system';
import { AppStoreContext } from '@context';
import { useStrings } from '@strings';
import type { Project } from '@api/auth/index.ts';
import styles from './ProjectCard.module.scss';

interface ProjectCardProps {
  data: Project;
}

export default function ProjectCard({ data }: ProjectCardProps): React.ReactElement {
  const { getString } = useStrings();
  const { projectID, updateAppStore } = useContext(AppStoreContext);

  const isSelected = projectID === data.projectID;
  const collaborators = data.members?.map(member => {
    return {
      name: member.username,
      email: member.email
    };
  });

  const handleProjectSelect = (): void => {
    updateAppStore({ projectID: data.projectID });
  };

  return (
    <Card selected={isSelected} onClick={handleProjectSelect} className={styles.projectCard}>
      <Container padding="small">
        <Text font={{ variation: FontVariation.CARD_TITLE }} lineClamp={1} color={Color.BLACK}>
          {data?.name}
        </Text>
        <Text font={{ variation: FontVariation.TINY }} lineClamp={1} color={Color.GREY_700}>
          {getString('id')}: {data?.projectID}
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
