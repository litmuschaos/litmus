export interface GroupMember {
  group: string;
  role: 'Executor' | 'Owner' | 'Viewer';
  assignedAt: number;
}
