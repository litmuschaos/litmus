import React from 'react';
import { PanelResponse } from '../../../models/graphql/dashboardsDetails';
import PanelContainer from './PanelContainer';
import PanelContent from './PanelContent';

const GraphPanel: React.FC<PanelResponse> = ({ ...props }) => {
  return (
    <PanelContainer>
      <PanelContent {...props} />
    </PanelContainer>
  );
};

export default GraphPanel;
