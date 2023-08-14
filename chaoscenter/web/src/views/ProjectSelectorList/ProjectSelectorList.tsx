import React from 'react';
import { Container, Layout, Text } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import { Color, FontVariation } from '@harnessio/design-system';
import cx from 'classnames';
import { useStrings } from '@strings';
import ProjectCard from '@components/ProjectCard';
import Loader from '@components/Loader';
import type { Project } from '@api/auth';
import styles from './ProjectSelectorList.module.scss';

interface ProjectSelectorListProps {
  projectList: Project[] | undefined;
  searchBar: React.ReactElement;
  totalProjects: number;
  searchTerm: string;
  loading: boolean;
}

export default function ProjectSelectorListView({
  projectList,
  searchBar,
  totalProjects,
  searchTerm,
  loading
}: ProjectSelectorListProps): React.ReactElement {
  const { getString } = useStrings();

  return (
    <Layout.Vertical width={600} height="100vh" background={Color.PRIMARY_BG} padding="medium" className={styles.gap4}>
      <Loader loading={loading}>
        <Container>
          <Text font={{ variation: FontVariation.H5 }}>{getString('selectProject')}</Text>
          <Container margin={{ top: 'small' }}>{searchBar}</Container>
        </Container>
        <Layout.Vertical width="100%" className={cx(styles.grow, styles.gap2)}>
          <Text font={{ variation: FontVariation.H6 }}>
            {getString('total')}: {projectList?.length ?? 0}
          </Text>
          {projectList && projectList.length > 0 ? (
            <Container className={cx(styles.grow, styles.cardListContainer)}>
              {projectList?.map(project => (
                <ProjectCard key={project.projectID} data={project} />
              ))}
            </Container>
          ) : (
            projectList?.length === 0 &&
            totalProjects !== 0 && (
              <Layout.Vertical
                className={cx(styles.grow, styles.gap2)}
                flex={{ justifyContent: 'center', alignItems: 'center' }}
              >
                <Icon name="nav-project" size={50} />
                <Text font={{ variation: FontVariation.BODY }}>
                  {getString('noProjectFoundMatchingSearch', { searchTerm })}
                </Text>
              </Layout.Vertical>
            )
          )}
        </Layout.Vertical>
      </Loader>
    </Layout.Vertical>
  );
}
