import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import React, { useEffect, useState, useCallback } from 'react';
import { Divider, Box } from '@material-ui/core';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useStyles from './styles';
import CustomBreadCrumbs from '../CustomBreadCrumbs';
import NotificationsDropdown from './NotificationDropdown';
import ProfileDropdownSection from './ProfileDropdownSection';
import { UserData } from '../../models/user';
import { RootState } from '../../redux/reducers';
import { NotificationIds, Project, Message } from '../../models/header';

const Header: React.FC = () => {
  const classes = useStyles();

  const userData: UserData = useSelector((state: RootState) => state.userData);

  const { name, email, username } = userData;

  // Fetch and Set Projects from backend.

  const [projects, setProjects] = useState<Project[]>([]);

  // set selectedProject from backend via redux using #setSelectedProject
  // depending on user's last active project or use cookie.
  const [selectedProject, setSelectedProject] = useState('1');

  const setSelectedProjectID = (selectedProjectID: string) => {
    setSelectedProject(selectedProjectID);
    // send POST request with #selectedProjectID to update active
    // project on db or persist it in redux or cookie.
    // window.location.reload(false);
  };

  const fetchRandomProjects = useCallback(() => {
    const projects = [];

    const projectsList = [
      {
        projectName: 'FlashProjectCL1',
        statusActive: 'false',
        id: '0',
      },
      {
        projectName: 'ProjectExample2',
        statusActive: 'true',
        id: '1',
      },
    ];

    const iterations = projectsList.length;

    for (let i = 0; i < iterations; i += 1) {
      const projectItem = projectsList[i];
      const project = {
        id: projectItem.id,
        projectName: projectItem.projectName,
        statusActive: projectItem.statusActive,
      };
      projects.push(project);
    }
    projects.reverse();
    setProjects(projects);
  }, [setProjects]);

  // Fetch and Set Notifications from backend.

  const [messages, setMessages] = useState<Message[]>([]);

  const [countOfMessages, setCountOfMessages] = useState(0);

  const fetchRandomMessages = useCallback(() => {
    const messages = [];

    const notificationsList = [
      {
        id: '1',
        workflowName: 'Pod Delete',
        status: 'complete',
        workflowPic:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Kubernetes_logo_without_workmark.svg/1200px-Kubernetes_logo_without_workmark.svg.png',
        generatedTime: '',
      },
      {
        id: '2',
        workflowName: 'Argo Chaos',
        status: 'started started',
        workflowPic:
          'https://pbs.twimg.com/profile_images/1272548541827649536/P4-0iQen_400x400.jpg',
        generatedTime: '',
      },
      {
        id: '3',
        workflowName: 'New',
        status: 'crashed',
        workflowPic:
          'https://res.cloudinary.com/practicaldev/image/fetch/s--jZgtY8cn--/c_imagga_scale,f_auto,fl_progressive,h_1080,q_auto,w_1080/https://res.cloudinary.com/practicaldev/image/fetch/s--x3KZoo7u--/c_imagga_scale%2Cf_auto%2Cfl_progressive%2Ch_420%2Cq_auto%2Cw_1000/https://dev-to-uploads.s3.amazonaws.com/i/0v6zstfufm96e09isqo6.png',
        generatedTime: '',
      },
    ];

    const iterations = notificationsList.length;

    const oneDaySeconds = 60 * 60 * 24;

    let curUnix = Math.round(
      new Date().getTime() / 1000 - iterations * oneDaySeconds
    );

    for (let i = 0; i < iterations; i += 1) {
      const notificationItem = notificationsList[i];
      const message = {
        sequenceID: (i as unknown) as string,
        id: notificationItem.id,
        workflowName: notificationItem.workflowName,
        date: curUnix,
        text: `${notificationItem.workflowName} Workflow ${notificationItem.status}`,
        picUrl: notificationItem.workflowPic,
      };
      curUnix += oneDaySeconds;
      messages.push(message);
    }
    messages.reverse();
    setMessages(messages);
  }, [setMessages]);

  const deleteNotification = (notificationIDs: NotificationIds) => {
    for (let i = 0; i < messages.length; i += 1) {
      if (messages[i].sequenceID === notificationIDs.sequenceID) {
        if (i > -1) {
          messages.splice(i, 1);
        }
      }
    }
    // send POST request with #notificationIDs.id to update db with notification
    // id marked as disissed from active or persist it in redux or cookie.
    setMessages(messages);
    setCountOfMessages(messages.length);
  };

  useEffect(() => {
    fetchRandomMessages();
    fetchRandomProjects();
  }, [fetchRandomMessages, fetchRandomProjects]);

  return (
    <div>
      <AppBar position="relative" className={classes.appBar} elevation={0}>
        <Toolbar>
          <div style={{ width: '100%' }}>
            <Box display="flex" p={1} className={classes.headerFlex}>
              <Box p={1} flexGrow={8} className={classes.headerFlexExtraPadded}>
                <CustomBreadCrumbs location={useLocation().pathname} />
              </Box>
              <Box p={1} className={classes.headerFlexPadded}>
                <NotificationsDropdown
                  count={`${countOfMessages}`}
                  messages={messages}
                  CallbackToHeaderOnDeleteNotification={deleteNotification}
                />
              </Box>
              <Box p={1} flexGrow={1} className={classes.headerFlexProfile}>
                <ProfileDropdownSection
                  name={name}
                  email={email}
                  username={username}
                  projects={projects}
                  selectedProjectID={selectedProject}
                  CallbackToSetSelectedProjectID={setSelectedProjectID}
                />
              </Box>
            </Box>
          </div>
        </Toolbar>
        <Divider />
      </AppBar>
    </div>
  );
};

export default Header;
