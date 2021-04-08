import { useQuery } from '@apollo/client';
import { IconButton, Paper, Typography } from '@material-ui/core';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import PlayArrowOutlinedIcon from '@material-ui/icons/PlayArrowOutlined';
import { ButtonFilled, ButtonOutlined } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { LIST_PROJECTS } from '../../../graphql';
import { Member, Project, Projects } from '../../../models/graphql/user';
import useActions from '../../../redux/actions';
import * as TabActions from '../../../redux/actions/tabs';
import { history } from '../../../redux/configureStore';
import { getUserId } from '../../../utils/auth';
import { getProjectID, getProjectRole } from '../../../utils/getSearchParams';
import useStyles from './styles';

const LandingHome: React.FC = () => {
  const classes = useStyles();
  // const { t } = useTranslation();
  const tabs = useActions(TabActions);

  const userID = getUserId();

  const projectID = getProjectID();
  const projectRole = getProjectRole();

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const [projectOwnerCount, setProjectOwnerCount] = useState<number>(0);
  const [projectOtherCount, setProjectOtherCount] = useState<number>(0);
  const [invitationsCount, setInvitationCount] = useState<number>(0);
  const [projects, setProjects] = useState<Project[]>([]);

  const { data: dataProject } = useQuery<Projects>(LIST_PROJECTS, {
    onCompleted: () => {
      if (dataProject?.listProjects) {
        setProjects(dataProject?.listProjects);
      }
    },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    let projectOwner = 0;
    let projectInvitation = 0;
    let projectOther = 0;
    projects.forEach((project) => {
      project.members.forEach((member: Member) => {
        if (member.user_id === userID && member.role === 'Owner') {
          projectOwner++;
        } else if (
          member.user_id === userID &&
          member.invitation === 'Pending'
        ) {
          projectInvitation++;
        } else if (
          member.user_id === userID &&
          member.role !== 'Owner' &&
          member.invitation === 'Accepted'
        ) {
          projectOther++;
        }
      });
    });
    setProjectOwnerCount(projectOwner);
    setInvitationCount(projectInvitation);
    setProjectOtherCount(projectOther);
  }, [projects, dataProject]);

  const modalClose = () => {
    setModalOpen(false);
  };

  const projectCount = projectOwnerCount + projectOtherCount;

  return (
    <div>
      {/* {modalOpen && <AgentConnectModal modalClose={modalClose} />} */}
      {/* First Agent Deployment Container */}
      <Paper className={classes.firstAgentContainer}>
        <img src="./icons/agentDeploy.svg" alt="Deploy Agent" />
        <div className={classes.agentDeployDesc}>
          <Typography>Deploy your first agent</Typography>
          {/* TODO: Rewrite */}
          <Typography>
            A Kubernetes cluster consists of a set of worker machines, called
            nodes, that run containerized applications. Every cluster has at
            least one worker node. The control plane manages the worker nodes
            and the Pods in the cluster. In production environments, the control
            plane usually runs across multiple computers and a cluster usually
            runs multiple nodes, providing fault-tolerance and high
            availability.
          </Typography>
          <div className={classes.buttonGroup}>
            <ButtonFilled
              onClick={() => {
                setModalOpen(true);
              }}
            >
              <ArrowUpwardIcon />
              <Typography>Deploy</Typography>
            </ButtonFilled>
            <IconButton onClick={() => {}}>
              <PlayArrowOutlinedIcon />
              <Typography>View a tutorial</Typography>
            </IconButton>
          </div>
        </div>
      </Paper>
      {/* Project Level info container */}
      <Paper className={classes.projectInfoContainer}>
        <div className={classes.projectInfoBlock}>
          <div className={classes.projectInfoData}>
            <div>
              <Typography id="projectCount">{projectCount}</Typography>
              {projectCount === 1 ? (
                <Typography>Project</Typography>
              ) : (
                <Typography>Projects</Typography>
              )}
            </div>
            <div>
              <Typography id="invitationCount">{invitationsCount}</Typography>
              {invitationsCount === 1 ? (
                <Typography>Invitation</Typography>
              ) : (
                <Typography>Invitations</Typography>
              )}
            </div>
          </div>
        </div>
        <ButtonOutlined
          onClick={() => {
            tabs.changeSettingsTabs(1);
            history.push({
              pathname: '/settings',
              search: `?projectID=${projectID}&projectRole=${projectRole}`,
            });
          }}
        >
          <Typography>View all projects</Typography>
        </ButtonOutlined>
      </Paper>
    </div>
  );
};

export { LandingHome };
