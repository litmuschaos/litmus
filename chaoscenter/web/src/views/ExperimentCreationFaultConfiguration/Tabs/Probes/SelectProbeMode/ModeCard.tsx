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
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

function ModeCard({ name, icon, description, isSelected, onClick }: ModeCardProps): React.ReactElement {
  return (
    <div className={isSelected ? css.modeCardSelected : css.modeCard} onClick={onClick}>
      <div className={css.flex}>
        <Icon name={icon} size={25} className={css.icon} />
        <div>
          <Text font={{ variation: FontVariation.BODY2 }}>{name}</Text>
          <Text font={{ variation: FontVariation.BODY }}>{description}</Text>
        </div>
      </div>
    </div>
  );
}

export default withErrorBoundary(ModeCard, { FallbackComponent: Fallback });
