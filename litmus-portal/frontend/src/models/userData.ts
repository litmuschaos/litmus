export interface UpdateUser {
  selectedProjectID: string;
  selectedProjectName: string;
  selectedProjectOwner: string;
  userRole: string;
  loader: boolean;
}
export interface CurrentUserData {
  role: string;
  uid: string;
  username: string;
  email: string;
  name: string;
}
