export interface GroupMember {
  group: string;
  displayName?: string;
  role: 'Executor' | 'Owner' | 'Viewer';
  assignedAt: number;
}
