import { Typography } from '@material-ui/core';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import { ButtonFilled, ButtonOutlined, Modal } from 'litmus-ui';
import React, { useState } from 'react';
import { MainInfoContainer } from '../MainInfoContainer';
import { ProjectInfoContainer } from '../ProjectInfoContainer';
import { AgentDeployModal } from './AgentDeployModal';

const LandingHome: React.FC = () => {
  // const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleClose = () => {
    setModalOpen(false);
  };

  const handleOpen = () => {
    setModalOpen(true);
  };

  return (
    <div>
      {/* First Agent Deployment Container */}
      <MainInfoContainer
        src="./icons/agentDeploy.svg"
        alt="Deploy Agent"
        heading="Deploy your first agent"
        description={` A Kubernetes cluster consists of a set of worker machines, called
      nodes, that run containerized applications. Every cluster has at
      least one worker node. The control plane manages the worker nodes
      and the Pods in the cluster. In production environments, the control
      plane usually runs across multiple computers and a cluster usually
      runs multiple nodes, providing fault-tolerance and high
      availability.`}
        button={
          <ButtonFilled onClick={handleOpen}>
            <ArrowUpwardIcon />
            <Typography>Deploy</Typography>
          </ButtonFilled>
        }
      />
      <Modal
        height="50%"
        width="50%"
        open={modalOpen}
        onClose={handleClose}
        modalActions={
          <ButtonOutlined onClick={handleClose}>&#x2715;</ButtonOutlined>
        }
      >
        <AgentDeployModal handleClose={handleClose} />
      </Modal>
      {/* Project Level info container */}
      <ProjectInfoContainer />
    </div>
  );
};

export { LandingHome };
