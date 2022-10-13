import { useQuery } from '@apollo/client';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import localforage from 'localforage';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GET_HUB_STATUS } from '../../../graphql/queries';
import { HubStatus } from '../../../models/graphql/chaoshub';
import { MyHubDetail } from '../../../models/graphql/user';
import { ChooseWorkflowRadio } from '../../../models/localforage/radioButton';
import { getProjectID } from '../../../utils/getSearchParams';
import useStyles, { MenuProps } from './styles';

const SelectMyHub = () => {
  const { t } = useTranslation();
  const selectedProjectID = getProjectID();
  const [selectedHub, setSelectedHub] = useState('');
  const [availableHubs, setAvailableHubs] = useState<MyHubDetail[]>([]);

  // Get all MyHubs with status
  const { data } = useQuery<HubStatus>(GET_HUB_STATUS, {
    variables: { projectID: selectedProjectID },
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
    if (data?.listHubStatus !== undefined) {
      if (data.listHubStatus.length) {
        const hubDetails: MyHubDetail[] = [];
        data.listHubStatus.forEach((hub) => {
          /**
           * Push only available hubs
           */
          if (hub.isAvailable) {
            hubDetails.push({
              id: hub.id,
              hubName: hub.hubName,
              repoBranch: hub.repoBranch,
              repoURL: hub.repoURL,
            });
          }
        });
        setAvailableHubs(hubDetails);
        data.listHubStatus.forEach((hubData) => {
          if (hubData.hubName.toLowerCase() === 'litmus chaoshub') {
            setSelectedHub('Litmus ChaosHub');
            localforage.setItem('selectedHub', 'Litmus ChaosHub');
            localforage.setItem('hasSetWorkflowData', false);
          }
        });
      }
    }
  }, [data]);

  const classes = useStyles();
  return (
    <div>
      <div className={classes.inputDiv}>
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel className={classes.label}>
            {t('createWorkflow.chooseWorkflow.selectMyHub')}
          </InputLabel>
          <Select
            data-cy="myHubDropDown"
            value={selectedHub}
            onChange={(e) => {
              handleMyHubChange(e);
            }}
            label="Select ChaosHub"
            MenuProps={MenuProps}
          >
            {availableHubs.map((hubs) => (
              <MenuItem
                key={hubs.hubName}
                data-cy="hubOption"
                value={hubs.hubName}
              >
                {hubs.hubName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </div>
  );
};

export default SelectMyHub;
