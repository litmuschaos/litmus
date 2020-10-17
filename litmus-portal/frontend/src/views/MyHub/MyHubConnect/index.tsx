import { Typography } from '@material-ui/core';
import React, { useState } from 'react';
import BackButton from '../../../components/Button/BackButton';
import ButtonFilled from '../../../components/Button/ButtonFilled';
import InputField from '../../../components/InputField';
import QuickActionCard from '../../../components/QuickActionCard';
import VideoCarousel from '../../../components/VideoCarousel';
import Scaffold from '../../../containers/layouts/Scaffold';
import Unimodal from '../../../containers/layouts/Unimodal';
import { validateStartEmptySpacing } from '../../../utils/validate';
import useStyles from './styles';
import { history } from '../../../redux/configureStore';

interface GitHub {
  GitURL: string;
  GitBranch: string;
}

const MyHub = () => {
  const classes = useStyles();
  const [gitHub, setGitHub] = useState<GitHub>({
    GitURL: '',
    GitBranch: '',
  });
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => {
    setIsOpen(false);
    history.push({ pathname: '/myhub' });
  };
  return (
    <Scaffold>
      <div className={classes.header}>
        <div style={{ marginRight: 'auto', marginBottom: 20 }}>
          <BackButton isDisabled={false} />
        </div>
        <Typography variant="h3" gutterBottom>
          Connect a new chaos hub
        </Typography>
      </div>
      <div className={classes.mainDiv}>
        <div className={classes.detailsDiv}>
          <Typography variant="h4" gutterBottom />
          <Typography style={{ fontWeight: 400, fontSize: '24px' }}>
            <strong>Enter information in the required fields</strong>
          </Typography>

          <Typography className={classes.connectText}>
            Then click on the connect button
          </Typography>
          <div className={classes.inputDiv}>
            <div className={classes.inputField}>
              <InputField
                label="Git URL"
                value={gitHub.GitURL}
                helperText={
                  validateStartEmptySpacing(gitHub.GitURL)
                    ? 'Should not start with an empty space'
                    : ''
                }
                validationError={validateStartEmptySpacing(gitHub.GitURL)}
                required
                handleChange={(e) =>
                  setGitHub({
                    GitURL: e.target.value,
                    GitBranch: gitHub.GitBranch,
                  })
                }
              />
            </div>
            <div className={classes.inputField}>
              <InputField
                label="Branch"
                value={gitHub.GitBranch}
                helperText={
                  validateStartEmptySpacing(gitHub.GitBranch)
                    ? 'Should not start with an empty space'
                    : ''
                }
                validationError={validateStartEmptySpacing(gitHub.GitBranch)}
                required
                handleChange={(e) =>
                  setGitHub({
                    GitURL: gitHub.GitURL,
                    GitBranch: e.target.value,
                  })
                }
              />
            </div>
            <div style={{ marginRight: 'auto', marginTop: 20 }}>
              <ButtonFilled
                isPrimary={false}
                handleClick={() => {
                  setIsOpen(true);
                }}
              >
                Submit Now
              </ButtonFilled>
            </div>
            <Unimodal isOpen={isOpen} handleClose={handleClose} hasCloseBtn>
              <div className={classes.modalDiv}>
                <img
                  src="/icons/checkmark.svg"
                  alt="checkmark"
                  style={{ marginBottom: 20 }}
                />
                <Typography gutterBottom className={classes.modalHeading}>
                  A new chaos hub <br /> is successfully created
                </Typography>
                <Typography className={classes.modalDesc}>
                  A new chaos hub will be added to the main page of the My hubs
                  section
                </Typography>
                <ButtonFilled isPrimary={false} handleClick={handleClose}>
                  Back to my hubs
                </ButtonFilled>
              </div>
            </Unimodal>
          </div>
        </div>
        <div className={classes.root}>
          <VideoCarousel />
          <Typography className={classes.videoDescription}>
            Get resilient and compliance scores for your Kuberenetes product
          </Typography>
          <div style={{ marginLeft: 45 }}>
            <QuickActionCard />
          </div>
        </div>
      </div>
    </Scaffold>
  );
};

export default MyHub;
