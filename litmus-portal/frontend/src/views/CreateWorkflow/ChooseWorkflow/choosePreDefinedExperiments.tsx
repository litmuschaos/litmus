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
import { HubStatus } from '../../../models/graphql/chaoshub';
import { MyHubDetail } from '../../../models/graphql/user';
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
    const [workflowList, setWorkflowlist] = useState<string[]>([]);

    // Get all MyHubs with status
    const { data } = useQuery<HubStatus>(GET_HUB_STATUS, {
      variables: { projectID: selectedProjectID },
      fetchPolicy: 'cache-and-network',
    });

    /**
     * Query to get the list of Pre-defined workflows
     */
    const [getPredefinedWorkflow] = useLazyQuery(GET_PREDEFINED_WORKFLOW_LIST, {
      fetchPolicy: 'network-only',
      onCompleted: (data) => {
        const wfList: string[] = [];
        if (data.listPredefinedWorkflows !== undefined) {
          data.listPredefinedWorkflows.forEach((workflow: any) => {
            wfList.push(workflow.workflowName);
          });
          setWorkflowlist(wfList);
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
          hubName: event.target.value as string,
          projectID: selectedProjectID,
        },
      });
      localforage.setItem('selectedHub', event.target.value as string);
    };

    /**
     * UseEffect to check if Chaos Hub exists and if exists
     * fetch the pre-defined workflows
     */
    useEffect(() => {
      if (data?.listHubStatus !== undefined) {
        if (data.listHubStatus.length) {
          const hubDetails: MyHubDetail[] = [];
          data.listHubStatus.forEach((hub) => {
            /**
             * Push only available hub
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
        }
        data.listHubStatus.forEach((hubData) => {
          if (hubData.hubName.toLowerCase() === 'litmus chaoshub') {
            setSelectedHub('Litmus ChaosHub');
            localforage.setItem('selectedHub', 'Litmus ChaosHub');
            getPredefinedWorkflow({
              variables: {
                hubName: 'Litmus ChaosHub',
                projectID: selectedProjectID,
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
                  label="Select ChaosHub"
                  MenuProps={MenuProps}
                >
                  {availableHubs.map((hubs) => (
                    <MenuItem key={hubs.hubName} value={hubs.hubName}>
                      <Typography data-cy="PreDefinedHubOption">
                        {hubs.hubName}
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
            <div className={classes.morePredefined}>
              <Typography className={classes.morePredefinedText}>
                {t('createWorkflow.chooseWorkflow.morePredefined')}{' '}
                <a
                  href="https://github.com/chaoscarnival/bootcamps/tree/main/workflows"
                  target="_blank"
                  rel="noreferrer"
                >
                  here
                </a>
                .
              </Typography>
            </div>
          </div>
          {/* Bottom Blur */}
          <div className={classes.blur} />
        </div>
      </AccordionDetails>
    );
  };

export default ChoosePreDefinedExperiments;
