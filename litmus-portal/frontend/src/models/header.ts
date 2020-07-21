export interface NotificationIds {
  id: string;
  sequenceID: string;
}

export interface Project {
  projectName: string;
  statusActive: string;
  id: string;
}

export interface Message {
  sequenceID: string;
  id: string;
  workflowName: string;
  date: number;
  text: string;
  picUrl: string;
}

export interface NotificationsCallBackType {
  (notificationIDs: NotificationIds): void;
}

export interface ProjectsCallBackType {
  (selectedProjectID: string): void;
}
