import React from 'react';
import { ButtonVariation } from '@harnessio/uicore';
import { useHistory } from 'react-router-dom';
import { ParentComponentErrorWrapper } from '@errors';
import { useRouteWithBaseUrl } from '@hooks';
import { getHash } from '@utils';
import { useStrings } from '@strings';
import { PermissionGroup } from '@models';
import RbacButton from '@components/RbacButton';

export default function NewExperimentButton({ disabled }: { disabled?: boolean }): React.ReactElement {
  // const scope = getScope();
  const { getString } = useStrings();
  const history = useHistory();
  const paths = useRouteWithBaseUrl();

  return (
    <ParentComponentErrorWrapper>
      <RbacButton
        disabled={disabled}
        permission={PermissionGroup.EDITOR}
        variation={ButtonVariation.PRIMARY}
        text={getString('newExperiment')}
        icon="plus"
        onClick={() => history.push(paths.toNewExperiment({ experimentKey: getHash() }))}
      />
    </ParentComponentErrorWrapper>
  );
}
