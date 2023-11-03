import { Button, ButtonSize, ButtonVariation, Layout, Text } from '@harnessio/uicore';
import React from 'react';
import { Color } from '@harnessio/design-system';
import { useStrings } from '@strings';
import { useSearchParams } from '@hooks';
import { ExperimentType } from '@api/entities';
import RbacButton from '@components/RbacButton';
import { PermissionGroup } from '@models';
import css from './ChaosStudio.module.scss';

interface StudioActionButtonsProps {
  disabled: boolean;
  loading: boolean;
  handleDiscard: () => void;
  saveExperimentHandler: () => Promise<void>;
  runExperimentHandler: () => void;
}

export default function StudioActionButtons({
  disabled,
  loading,
  handleDiscard,
  saveExperimentHandler,
  runExperimentHandler
}: StudioActionButtonsProps): React.ReactElement {
  const { getString } = useStrings();
  const searchParams = useSearchParams();
  const hasUnsavedChangesInURL = searchParams.get('unsavedChanges') === 'true';
  const experimentType = (searchParams.get('experimentType') as ExperimentType | undefined) ?? ExperimentType.NON_CRON;

  return (
    <Layout.Horizontal spacing={'small'} flex={{ alignItems: 'center' }}>
      {hasUnsavedChangesInURL && (
        <Text color={Color.ORANGE_600} font={{ size: 'small' }} className={css.tagRender}>
          Unsaved Changes
        </Text>
      )}
      <RbacButton
        permission={PermissionGroup.EDITOR}
        icon="upload-box"
        variation={ButtonVariation.PRIMARY}
        size={ButtonSize.SMALL}
        text={getString('save')}
        disabled={disabled || loading || !hasUnsavedChangesInURL}
        onClick={saveExperimentHandler}
      />
      <Button
        className={css.discardBtn}
        variation={ButtonVariation.SECONDARY}
        text={getString('discard')}
        onClick={handleDiscard}
        size={ButtonSize.SMALL}
      />
      <RbacButton
        permission={PermissionGroup.EDITOR}
        icon="run-pipeline"
        intent="success"
        variation={ButtonVariation.PRIMARY}
        size={ButtonSize.SMALL}
        text={experimentType === ExperimentType.NON_CRON ? getString('run') : getString('schedule')}
        onClick={runExperimentHandler}
        disabled={disabled || loading || hasUnsavedChangesInURL}
        tooltip={disabled ? getString('pleaseComplete') : undefined}
      />
    </Layout.Horizontal>
  );
}
