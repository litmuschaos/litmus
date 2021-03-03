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
  workflowID?: number;
  CallbackOnSelectWorkflow?: SelectWorkflowCallBackType;
  selectedID?: number;
  isCustom?: boolean;
  details?: string;
  recommendation?: string;
  experimentinfo?: string;
  chaosinfra?: boolean;
}

export interface workflowDetails {
  name: string;
  id: string;
  link: string;
  description: string;
}

interface SelectWorkflowCallBackType {
  (selectedWorkflow: workflowDetails): void;
}
