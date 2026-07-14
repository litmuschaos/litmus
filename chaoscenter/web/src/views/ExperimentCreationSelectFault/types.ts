import type { FaultList } from '@api/entities';

export interface ChaosFaultData {
  category: string;
  fault: FaultList;
  faultCSV: string | undefined;
}
