import React from 'react';
import { UnconfiguredAgent } from '../../../components/UnconfiguredAgent';
import { Role } from '../../../models/graphql/user';
import { getProjectRole } from '../../../utils/getSearchParams';
import { ProjectInfoContainer } from '../ProjectInfoContainer';

const LandingHome: React.FC = () => {
  const projectRole = getProjectRole();

  return (
    <div>
      {/* Agent Deployment Container */}
      <UnconfiguredAgent />
      {/* Project Level info container */}
      {projectRole === Role.owner && <ProjectInfoContainer />}
    </div>
  );
};

export { LandingHome };
