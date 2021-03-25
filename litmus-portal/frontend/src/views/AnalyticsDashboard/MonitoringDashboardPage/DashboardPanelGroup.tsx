import React from 'react';
import { PanelGroupResponse } from '../../../models/graphql/dashboardsDetails';
import PanelGroupContent from './PanelGroupContent';

const DashboardPanelGroup: React.FC<PanelGroupResponse> = ({ ...props }) => {
  return <PanelGroupContent {...props} />;
};

export default DashboardPanelGroup;
