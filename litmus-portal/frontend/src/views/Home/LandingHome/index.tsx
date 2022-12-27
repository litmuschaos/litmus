import React, { lazy } from 'react';
import { UnconfiguredAgent } from '../../../components/UnconfiguredAgent';
import { Role } from '../../../models/graphql/user';
import { getProjectRole } from '../../../utils/getSearchParams';

const ProjectInfoContainer = lazy(() => import('../ProjectInfoContainer'));

const LandingHome: React.FC = () => {
  const projectRole = getProjectRole();

  return (
    <div>
      {/* Agent Deployment Container */}
      <UnconfiguredAgent />
      {/* Project Level info container */}
      {projectRole === Role.OWNER && <ProjectInfoContainer />}
    </div>
  );
};

export default LandingHome;
