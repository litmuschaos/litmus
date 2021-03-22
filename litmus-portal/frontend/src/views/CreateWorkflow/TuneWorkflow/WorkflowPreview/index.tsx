import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/reducers';
import { extractSteps } from '../ExtractSteps';

interface WorkflowPreviewProps {
  isCustom: boolean;
}

const WorkflowPreview: React.FC<WorkflowPreviewProps> = ({ isCustom }) => {
  const manifest = useSelector(
    (state: RootState) => state.workflowManifest.manifest
  );

  if (manifest !== '') {
    extractSteps(isCustom, manifest);
  }

  return <div />;
};

export default WorkflowPreview;
