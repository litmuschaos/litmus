declare interface Window {
  apiUrl: string;
  getApiBaseUrl: (str: string) => string;
  helpPanelAccessToken: string;
  helpPanelSpace: string;
  helpPanelEnvironment: 'QA' | 'master';
  deploymentType: 'SAAS' | 'ON_PREM' | 'COMMUNITY';
}

declare const __DEV__: boolean;

declare module 'strings/strings.en.yaml' {
  import { StringsMap } from './strings/types';
  export default StringsMap;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}
declare module '*.svg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}
