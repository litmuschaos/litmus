import { Button, Layout, Popover, Text } from '@harness/uicore';
import { Color } from '@harness/design-system';
import React, { useContext } from 'react';
import { PopoverInteractionKind, Position } from '@blueprintjs/core';
import cx from 'classnames';
import { useStrings } from '@strings';
import { AppStoreContext } from '@context';
import type { Project } from '@models';
import ProjectSelectorListController from '@controllers/ProjectSelectorList';
import styles from './ProjectSelector.module.scss';

interface ProjectSelectorProps {
  currentProjectDetails: Project | undefined;
}

export default function ProjectSelectorView({ currentProjectDetails }: ProjectSelectorProps): React.ReactElement {
  const { getString } = useStrings();
  const { projectID } = useContext(AppStoreContext);

  return (
    <Layout.Vertical padding={{ left: 'medium', right: 'medium', top: 'large', bottom: 'small' }}>
      <Text margin={{ bottom: 'xsmall' }} font={{ size: 'small' }} color={Color.GREY_500}>
        {getString('project')}
      </Text>
      <Popover
        interactionKind={PopoverInteractionKind.CLICK}
        position={Position.RIGHT}
        modifiers={{ offset: { offset: -50 } }}
        hasBackdrop={true}
        lazy={true}
        minimal
        fill={true}
        popoverClassName={styles.popover}
      >
        <Button
          minimal
          rightIcon="chevron-right"
          data-testid="project-select-button"
          className={cx(styles.popoverTarget, styles.selectButton)}
          aria-label={getString('selectProject')}
          tooltipProps={{
            isDark: true,
            usePortal: true,
            fill: true
          }}
          tooltip={
            projectID ? (
              <Text padding="small" color={Color.WHITE}>
                {getString('selectProject')}
              </Text>
            ) : undefined
          }
          text={
            projectID ? (
              <Text color={Color.WHITE} font={{ size: 'small' }} padding="xsmall" className={styles.projectText}>
                {currentProjectDetails?.Name ?? projectID}
              </Text>
            ) : (
              <Text color={Color.GREY_400} font={{ size: 'small' }} padding="xsmall">
                {getString('selectProject')}
              </Text>
            )
          }
        />
        <ProjectSelectorListController />
      </Popover>
    </Layout.Vertical>
  );
}
