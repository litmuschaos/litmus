import React from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import { Icon, IconName } from '@harnessio/icons';
import { FontVariation } from '@harnessio/design-system';
import { Text } from '@harnessio/uicore';
import { Fallback } from '@errors';
import css from './SelectProbeMode.module.scss';

interface ModeCardProps {
  name: string;
  icon: IconName;
  isSelected: boolean;
  onClick: () => void;
}

function ModeCard({ name, icon, isSelected, onClick }: ModeCardProps): React.ReactElement {
  return (
    <div className={isSelected ? css.modeCardSelected : css.modeCard} onClick={onClick}>
      <div className={css.center}>
        <Icon name={icon} size={25} className={css.icon} />
        <Text font={{ variation: FontVariation.BODY2 }}>{name}</Text>
      </div>
    </div>
  );
}

export default withErrorBoundary(ModeCard, { FallbackComponent: Fallback });
