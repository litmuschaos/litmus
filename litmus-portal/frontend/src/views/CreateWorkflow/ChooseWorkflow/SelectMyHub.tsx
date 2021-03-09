import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useSelector } from 'react-redux';
import localforage from 'localforage';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { HubStatus } from '../../../models/redux/myhub';
import { GET_HUB_STATUS } from '../../../graphql/queries';
import { RootState } from '../../../redux/reducers';
import useStyles, { MenuProps } from './styles';
import { MyHubDetail } from '../../../models/graphql/user';

const SelectMyHub = () => {
  const { t } = useTranslation();
  const { selectedProjectID } = useSelector(
    (state: RootState) => state.userData
  );
  const [selectedHub, setSelectedHub] = useState('');
  const [availableHubs, setAvailableHubs] = useState<MyHubDetail[]>([]);

  // Get all MyHubs with status
  const { data, loading } = useQuery<HubStatus>(GET_HUB_STATUS, {
    variables: { data: selectedProjectID },
    fetchPolicy: 'cache-and-network',
  });

  const handleMyHubChange = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    setSelectedHub(event.target.value as string);
    localforage.setItem('selectedScheduleOption', { selected: 'C' });
    localforage.setItem('selectedHub', event.target.value as string);
  };

  useEffect(() => {
    if (data?.getHubStatus.length) {
      setAvailableHubs([...data.getHubStatus]);
    }
  }, [loading]);

  // Retrieving saved data from index DB,
  useEffect(() => {
    localforage.getItem('selectedHub').then((value) => {
      if (value !== null) {
        setSelectedHub(value as string);
      }
    });
  }, []);

  const classes = useStyles();
  return (
    <div>
      <div className={classes.inputDiv}>
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel className={classes.label}>
            {t('createWorkflow.chooseWorkflow.selectMyHub')}
          </InputLabel>
          <Select
            value={selectedHub}
            onChange={(e) => {
              handleMyHubChange(e);
            }}
            label="Cluster Status"
            MenuProps={MenuProps}
          >
            {availableHubs.map((hubs) => (
              <MenuItem key={hubs.HubName} value={hubs.HubName}>
                {hubs.HubName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </div>
  );
};

export default SelectMyHub;
