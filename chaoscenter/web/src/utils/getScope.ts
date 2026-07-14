import type { Identifiers } from '@api/entities';
import { useAppStore } from '@hooks';

export function getScope(): Identifiers {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { projectID } = useAppStore();
  return {
    projectID: projectID ?? ''
  };
}
