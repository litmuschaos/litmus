import { useLazyQuery, useQuery } from '@apollo/client';
import {
  AccordionDetails,
  FormControl,
  InputLabel,
  MenuItem,
  RadioGroup,
  Select,
  Typography,
  useTheme,
} from '@material-ui/core';
import { LitmusCard, RadioButton, Search } from 'litmus-ui';
import localforage from 'localforage';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import config from '../../../config';
import { GET_HUB_STATUS, GET_PREDEFINED_WORKFLOW_LIST } from '../../../graphql';
import { MyHubDetail } from '../../../models/graphql/user';
import { HubStatus } from '../../../models/redux/myhub';
import { getProjectID } from '../../../utils/getSearchParams';
import useStyles, { MenuProps } from './styles';

interface ChooseWorkflowRadio {
  selected: string;
  id: string;
}

const ChoosePreDefinedExperiments = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { palette } = useTheme();

  // Local States
  const [search, setSearch] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>('');

  const selectedProjectID = getProjectID();
  const [selectedHub, setSelectedHub] = useState('');
  const [availableHubs, setAvailableHubs] = useState<MyHubDetail[]>([]);
  const [workflowList, setWorkflowlist] = useState([]);

  // Get all MyHubs with status
  const { data, loading } = useQuery<HubStatus>(GET_HUB_STATUS, {
    variables: { data: selectedProjectID },
    fetchPolicy: 'cache-and-network',
  });

  /**
   * Query to get the list of Pre-defined workflows
   */
  const [getPredefinedWorkflow] = useLazyQuery(GET_PREDEFINED_WORKFLOW_LIST, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data.GetPredefinedWorkflowList !== undefined) {
        setWorkflowlist(data.GetPredefinedWorkflowList);
      }
    },
    onError: () => {
      setWorkflowlist([]);
    },
  });

  /**
   * Function to handle changes in Radio Buttons
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(event.target.value);
    const selection: ChooseWorkflowRadio = {
      selected: 'A',
      id: event.target.value,
    };
    localforage.setItem('selectedScheduleOption', selection);
    localforage.setItem('hasSetWorkflowData', false);
  };

  const filteredPreDefinedWorkflows = workflowList.filter((w: string) => {
    if (search === null) return w;
    if (w.toLowerCase().includes(search.toLowerCase())) return w;
    return null;
  });

  /**
   * Function to handle change in MyHub dropdown
   */
  const handleMyHubChange = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    setSelectedHub(event.target.value as string);
    getPredefinedWorkflow({
      variables: {
        hubname: event.target.value as string,
        projectid: selectedProjectID,
      },
    });
    localforage.setItem('selectedHub', event.target.value as string);
  };

  // Selects Option A -> Sub Experiment Options which was already selected by the user
  useEffect(() => {
    localforage
      .getItem('selectedScheduleOption')
      .then((value) =>
        value !== null
          ? setSelected((value as ChooseWorkflowRadio).id)
          : setSelected('')
      );
  }, []);

  /**
   * UseEffect to check if Chaos Hub exists and if exists
   * fetch the pre-defined workflows
   */
  useEffect(() => {
    if (data?.getHubStatus !== undefined) {
      if (data.getHubStatus.length) {
        setAvailableHubs([...data.getHubStatus]);
      }
      data.getHubStatus.forEach((hubData) => {
        if (hubData.HubName.toLowerCase() === 'chaos hub') {
          setSelectedHub('Chaos Hub');
          localforage.setItem('selectedHub', 'Chaos Hub');
          getPredefinedWorkflow({
            variables: {
              hubname: 'Chaos Hub',
              projectid: selectedProjectID,
            },
          });
        }
      });
    }
  }, [loading]);

  return (
    <AccordionDetails>
      {/* Wrapping content inside the Accordion to take full width */}
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex' }}>
          <div className={classes.inputMyHubDiv}>
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
                label="Select MyHub"
                MenuProps={MenuProps}
              >
                {availableHubs.map((hubs) => (
                  <MenuItem
                    key={hubs.HubName}
                    data-cy="hubOption"
                    value={hubs.HubName}
                  >
                    {hubs.HubName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className={classes.searchDiv}>
            <Search
              data-cy="agentSearch"
              id="input-with-icon-textfield"
              placeholder="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {/* Leaving some space between the search and pre-defined workflow cards */}
        <br />

        {/* List of Pre-defined workflows */}
        <div className={classes.predefinedWorkflowDiv}>
          {selectedHub === '' ? (
            <div className={classes.noTemplatesDiv}>
              <Typography className={classes.noTemplatesText}>
                <strong>{t('createWorkflow.chooseWorkflow.noMyHub')}</strong>
              </Typography>
              <Typography className={classes.noTemplatesDesc}>
                {t('createWorkflow.chooseWorkflow.selectHub')}
              </Typography>
            </div>
          ) : workflowList.length === 0 ? (
            <div className={classes.noTemplatesDiv}>
              <Typography className={classes.noTemplatesText}>
                <strong>
                  {t('createWorkflow.chooseWorkflow.noPredefined')}
                </strong>
              </Typography>
              <Typography className={classes.noTemplatesDesc}>
                {t('createWorkflow.chooseWorkflow.addPredefined')}
              </Typography>
            </div>
          ) : (
            <RadioGroup
              value={selected}
              data-cy="PredefinedWorkflowsRadioGroup"
              onChange={handleChange}
            >
              {filteredPreDefinedWorkflows?.map((wfData) => (
                <LitmusCard
                  width="100%"
                  height="5rem"
                  key={wfData}
                  borderColor={palette.border.main}
                  className={classes.predefinedWorkflowCard}
                >
                  <RadioButton value={wfData}>
                    {/* Wrap the entire body with 100% width to divide into 40-60 */}
                    <div id="body">
                      {/* Left Div => Icon + Name of Workflow */}
                      <div id="left-div">
                        <img
                          className={classes.experimentIcon}
                          src={`${config.grahqlEndpoint}/icon/${selectedProjectID}/${selectedHub}/predefined/${wfData}.png`}
                          alt="Experiment Icon"
                        />
                        <Typography className={classes.predefinedWorkflowName}>
                          {wfData}
                        </Typography>
                      </div>
                    </div>
                  </RadioButton>
                </LitmusCard>
              ))}
            </RadioGroup>
          )}
        </div>
        {/* Bottom Blur */}
        <div className={classes.blur} />
      </div>
    </AccordionDetails>
  );
};

export default ChoosePreDefinedExperiments;
