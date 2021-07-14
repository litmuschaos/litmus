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
import { LitmusCard, Search } from 'litmus-ui';
import localforage from 'localforage';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import config from '../../../config';
import { GET_HUB_STATUS, GET_PREDEFINED_WORKFLOW_LIST } from '../../../graphql';
import { MyHubDetail } from '../../../models/graphql/user';
import { HubStatus } from '../../../models/redux/myhub';
import { getProjectID } from '../../../utils/getSearchParams';
import PreDefinedRadio from './PreDefinedRadio';
import useStyles, { MenuProps } from './styles';

interface ChooseWorkflowRadio {
  selected: string;
  id: string;
}

interface ChoosePreDefinedExperimentsProps {
  selectedExp: (expID: string) => void;
}

const ChoosePreDefinedExperiments: React.FC<ChoosePreDefinedExperimentsProps> =
  ({ selectedExp }) => {
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
    const { data } = useQuery<HubStatus>(GET_HUB_STATUS, {
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
      selectedExp(selection.id);
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

    /**
     * UseEffect to check if Chaos Hub exists and if exists
     * fetch the pre-defined workflows
     */
    useEffect(() => {
      if (data?.getHubStatus !== undefined) {
        if (data.getHubStatus.length) {
          const hubDetails: MyHubDetail[] = [];
          data.getHubStatus.forEach((hub) => {
            /**
             * Push only available hub
             */
            if (hub.IsAvailable) {
              hubDetails.push({
                id: hub.id,
                HubName: hub.HubName,
                RepoBranch: hub.RepoBranch,
                RepoURL: hub.RepoURL,
              });
            }
          });
          setAvailableHubs(hubDetails);
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
    }, [data]);

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
                  data-cy="selectPreDefinedMyHub"
                  value={selectedHub}
                  onChange={(e) => {
                    handleMyHubChange(e);
                  }}
                  label="Select MyHub"
                  MenuProps={MenuProps}
                >
                  {availableHubs.map((hubs) => (
                    <MenuItem key={hubs.HubName} value={hubs.HubName}>
                      <Typography data-cy="PreDefinedHubOption">
                        {hubs.HubName}
                      </Typography>
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
                {filteredPreDefinedWorkflows?.length > 0 ? (
                  filteredPreDefinedWorkflows?.map((wfData) => (
                    <LitmusCard
                      width="100%"
                      height="5rem"
                      key={wfData}
                      borderColor={palette.border.main}
                      className={classes.predefinedWorkflowCard}
                    >
                      <PreDefinedRadio
                        workflowName={wfData}
                        iconURL={`${config.grahqlEndpoint}/icon/${selectedProjectID}/${selectedHub}/predefined/${wfData}.png`}
                      />
                    </LitmusCard>
                  ))
                ) : (
                  <div className={classes.noTemplatesDiv}>
                    <Typography className={classes.noTemplatesText}>
                      <strong>
                        {t('createWorkflow.chooseWorkflow.noPredefined')}
                      </strong>
                    </Typography>
                    <Typography className={classes.noTemplatesDesc}>
                      {t('createWorkflow.chooseWorkflow.searchTerm')}
                    </Typography>
                  </div>
                )}
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
