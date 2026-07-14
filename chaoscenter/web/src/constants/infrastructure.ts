import type { IconName } from '@harnessio/icons';
import { InfrastructureType } from '@api/entities';
import type { InfrastructurePlatform } from '@models';

export const KUBERNETES_INFRASTRUCTURE_PLATFORM: InfrastructurePlatform = {
  value: InfrastructureType.KUBERNETES,
  name: InfrastructureType.KUBERNETES,
  image: 'service-kubernetes' as IconName,
  count: undefined,
  isActive: true,
  supportedFaults: []
};
