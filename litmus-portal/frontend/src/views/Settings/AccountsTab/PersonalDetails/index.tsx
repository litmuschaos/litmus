import { useMutation, useQuery } from '@apollo/client';
import { Button, Typography } from '@material-ui/core';
import React from 'react';
import { useSelector } from 'react-redux';
import Unimodal from '../../../../containers/layouts/Unimodal';
import { GET_USER, UPDATE_DETAILS } from '../../../../graphql';
import {
  CurrentUserDedtailsVars,
  CurrentUserDetails,
} from '../../../../models/graphql/user';
import { UpdateUser } from '../../../../models/redux/user';
import { RootState } from '../../../../redux/reducers';
import UserDetails from '../../UserManagementTab/CreateUser/UserDetails';
import useStyles from './styles';

interface personaData {
  email: string;
  userName: string;
  fullName: string;
}

// Displays the personals details on the "accounts" tab
const PersonalDetails: React.FC = () => {
  const classes = useStyles();
  const username = useSelector((state: RootState) => state.userData.username);

  // Query to get user details
  const { data } = useQuery<CurrentUserDetails, CurrentUserDedtailsVars>(
    GET_USER,
    { variables: { username } }
  );

  const name: string = data?.getUser.name ?? '';
  const email: string = data?.getUser.email ?? '';

  const [personaData, setPersonaData] = React.useState<personaData>({
    email,
    userName: username,
    fullName: name,
  });

  // For closing and opening of the modal
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleUserChange = (e: any) => {
    setPersonaData({
      fullName: personaData.fullName,
      userName: e.target.value,
      email: personaData.email,
    });
  };

  const handleNameChange = (e: any) => {
    setPersonaData({
      fullName: e.target.value,
      userName: personaData.userName,
      email: personaData.email,
    });
  };

  const handleEmailChange = (e: any) => {
    setPersonaData({
      fullName: personaData.fullName,
      userName: personaData.userName,
      email: e.target.value,
    });
  };

  const [updateDetails] = useMutation<UpdateUser>(UPDATE_DETAILS, {
    onCompleted: () => {
      setOpen(true);
    },
    refetchQueries: [{ query: GET_USER, variables: { username } }],
  });

  return (
    <div>
      <form>
        <UserDetails
          emailIsDisabled={false}
          nameIsDisabled={false}
          nameValue={personaData.fullName}
          usernameIsDisabled
          handleNameChange={handleNameChange}
          emailValue={personaData.email}
          handleEmailChange={handleEmailChange}
          userValue={personaData.userName}
          handleUserChange={handleUserChange}
        />

        <div className={classes.saveButton}>
          <Button
            className={classes.submitButton}
            data-cy="loginButton"
            onClick={() => {
              // checks if Full name field is empty
              if (personaData.fullName.length > 0) {
                updateDetails({
                  variables: {
                    user: {
                      id: data?.getUser.id,
                      name: personaData.fullName,
                      email: personaData.email,
                    },
                  },
                });
              }
            }}
          >
            Save Changes
          </Button>

          {/* Displays the modal after details are successfully edited */}
          <Unimodal isOpen={open} handleClose={handleClose} hasCloseBtn={false}>
            <div className={classes.body}>
              <img src="./icons/userLarge.svg" alt="user" />
              <div className={classes.text}>
                <Typography className={classes.typo} align="center">
                  Your personal information <strong>has been changed!</strong>
                </Typography>
              </div>
              <div className={classes.text1}>
                <Typography align="center" className={classes.typo1}>
                  Changes took effect
                </Typography>
              </div>
              <Button
                data-cy="closeButton"
                variant="contained"
                className={classes.button}
                onClick={handleClose}
              >
                Done
              </Button>
            </div>
          </Unimodal>
        </div>
      </form>
    </div>
  );
};

export default PersonalDetails;
