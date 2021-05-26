import { Paper, Typography } from '@material-ui/core';
import { ButtonFilled } from 'litmus-ui';
import React from 'react';
import { history } from '../../redux/configureStore';
import { getProjectID, getProjectRole } from '../../utils/getSearchParams';
import useStyles from './styles';

interface RecentOverviewContainerProps {
  heading: string;
  link?: React.ReactNode;
  buttonLink: string;
  buttonImgSrc: string;
  buttonImgAlt: string;
  buttonText: string;
}

const RecentOverviewContainer: React.FC<RecentOverviewContainerProps> = ({
  heading,
  link,
  buttonLink,
  buttonImgSrc,
  buttonImgAlt,
  buttonText,
  children,
}) => {
  const classes = useStyles();
  const projectID = getProjectID();
  const projectRole = getProjectRole();

  return (
    <Paper className={classes.workflowRunContainer}>
      {/* Heading section of the container */}
      <div className={classes.containerHeading}>
        <Typography className={classes.heading}>{heading}</Typography>
        {link}
        <ButtonFilled
          onClick={() => {
            history.push({
              pathname: `${buttonLink}`,
              search: `?projectID=${projectID}&projectRole=${projectRole}`,
            });
          }}
        >
          <img src={buttonImgSrc} alt={buttonImgAlt} />
          <Typography className={classes.buttonText}>{buttonText}</Typography>
        </ButtonFilled>
      </div>

      {/* Data Cards */}
      {children}
    </Paper>
  );
};

export { RecentOverviewContainer };
