import React from 'react';
import { PanelGroupResponse } from '../../../models/graphql/dashboardsDetails';
import PanelGroupContainer from './PanelGroupContainer';
import PanelGroupContent from './PanelGroupContent';

const DashboardPanelGroup: React.FC<PanelGroupResponse> = ({ ...props }) => {
  return (
    <PanelGroupContainer>
      <PanelGroupContent {...props} />
    </PanelGroupContainer>
  );
};

export default DashboardPanelGroup;
