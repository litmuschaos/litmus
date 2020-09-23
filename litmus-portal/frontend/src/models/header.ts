export interface NotificationIds {
  id: string;
  sequenceID: string;
}

export interface Message {
  sequenceID: string;
  id: string;
  messageType: string;
  date: number;
  text: string;
}

export interface NotificationsCallBackType {
  (notificationIDs: NotificationIds): void;
}

export interface ProjectsCallBackType {
  (selectedProjectID: string): void;
}
