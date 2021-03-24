/* eslint-disable react/no-danger */
import { useMutation } from '@apollo/client';
import { TextField, Typography } from '@material-ui/core';
import { ButtonFilled } from 'litmus-ui';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../../components/Loader';
import config from '../../../config';
import { CREATE_PROJECT, CREATE_USER } from '../../../graphql';
import {
  CreateUserData,
  Project,
  UserRole,
} from '../../../models/graphql/user';
import {
  getToken,
  getUserEmail,
  getUserName,
  getUsername,
  getUserRole,
} from '../../../utils/auth';
import { validateStartEmptySpacing } from '../../../utils/validate';
import useStyles from './styles';

interface ProjectSetProps {
  currentStep: number;
  totalStep: number;
  password: string;
}
const ProjectSet: React.FC<ProjectSetProps> = ({
  currentStep,
  totalStep,
  password,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [projectName, setProjectName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isError = useRef(true);

  if (projectName.length && !validateStartEmptySpacing(projectName)) {
    isError.current = false;
  } else {
    isError.current = true;
  }

  const [CreateProject] = useMutation<Project>(CREATE_PROJECT, {
    onCompleted: () => {
      setIsLoading(false);
      window.location.assign('/home');
    },
  });

  const [CreateUser] = useMutation<CreateUserData>(CREATE_USER, {
    onCompleted: () => {
      CreateProject({
        variables: {
          projectName,
        },
      });
    },
  });

  // Submit entered data to /update endpoint
  const handleSubmit = () => {
    setIsLoading(true);
    fetch(`${config.auth.url}/update/details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        username: getUsername(),
        email: getUserEmail(),
        name: getUserName(),
        password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if ('error' in data) {
          isError.current = true;
        } else if (getUserRole() === UserRole.admin) {
          CreateUser({
            variables: {
              user: {
                username: getUsername(),
                email: getUserEmail(),
                name: getUserName(),
                role: 'admin',
                userID: data._id,
              },
            },
          });
        } else {
          CreateProject({
            variables: {
              projectName,
            },
          });
        }
      })
      .catch((err) => {
        isError.current = true;
        console.error(err);
      });
  };

  const loaderSize = 20;

  return (
    <div className={classes.rootDiv}>
      <div className={classes.rootLitmusText}>
        <img src="icons/LitmusLogoLight.svg" alt="litmus logo" />
        <Typography className={classes.HeaderText}>
          You’re almost there! Set your project named
        </Typography>
        <Typography className={classes.litmusText}>
          The project will be yours with owner access where you can create
          workflows, view analytics and also invite others to your project.
        </Typography>
      </div>
      <div
        // id="login-form"
        // onSubmit={handleSubmit}
        className={classes.inputDiv}
      >
        <TextField
          className={classes.inputValue}
          label={t('welcomeModal.case-0.label')}
          value={projectName}
          helperText={
            validateStartEmptySpacing(projectName)
              ? 'Should not start with an empty space'
              : ''
          }
          variant="filled"
          required
          onChange={(e) => setProjectName(e.target.value)}
        />
        <div className={classes.buttonGroup}>
          <ButtonFilled
            type="submit"
            className={classes.submitButton}
            disabled={isError.current}
            onClick={handleSubmit}
          >
            {isLoading ? (
              <Loader size={loaderSize} />
            ) : (
              <Typography>Continue to Portal</Typography>
            )}
          </ButtonFilled>
          <Typography>
            Step {currentStep} of {totalStep}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default ProjectSet;
