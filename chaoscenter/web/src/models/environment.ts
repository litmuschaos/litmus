export interface EnvironmentResponseDTO {
  projectID: string;
  color?: string;
  deleted?: boolean;
  description?: string;
  identifier?: string;
  name?: string;
  tags?: {
    [key: string]: string;
  };
  type?: 'PreProduction' | 'Production';
  yaml?: string;
}
