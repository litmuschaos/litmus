import React from 'react';

export interface preDefinedWorkflowData {
  chaosWkfCRDLink?: string;
  title?: string;
  urlToIcon?: string;
  gitLink?: string;
  handleClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  experimentCount?: number;
  provider?: string;
  description?: string;
  totalRuns?: number;
  workflowID?: string;
  CallbackOnSelectWorkflow?: SelectWorkflowCallBackType;
  selectedID?: string;
  customWorkflow?: boolean;
}

export interface workflowDetails {
  name: string;
  id: string;
  link: string;
  description: string;
}

export interface SelectWorkflowCallBackType {
  (selectedWorkflow: workflowDetails): void;
}
