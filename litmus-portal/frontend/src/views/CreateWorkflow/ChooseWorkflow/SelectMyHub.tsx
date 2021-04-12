import { useQuery } from '@apollo/client';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import localforage from 'localforage';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GET_HUB_STATUS } from '../../../graphql/queries';
import { MyHubDetail } from '../../../models/graphql/user';
import { ChooseWorkflowRadio } from '../../../models/localforage/radioButton';
import { HubStatus } from '../../../models/redux/myhub';
import { getProjectID } from '../../../utils/getSearchParams';
import useStyles, { MenuProps } from './styles';

const SelectMyHub = () => {
  const { t } = useTranslation();
  const selectedProjectID = getProjectID();
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
    const selection: ChooseWorkflowRadio = {
      selected: 'C',
    };
    localforage.setItem('selectedScheduleOption', selection);
    localforage.setItem('selectedHub', event.target.value as string);
    localforage.setItem('hasSetWorkflowData', false);
  };

  useEffect(() => {
    if (data?.getHubStatus.length) {
      setAvailableHubs([...data.getHubStatus]);
    }
  }, [loading]);

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
