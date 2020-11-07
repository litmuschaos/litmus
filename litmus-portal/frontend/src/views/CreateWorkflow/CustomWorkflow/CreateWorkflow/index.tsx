import { useLazyQuery, useQuery } from '@apollo/client';
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  MenuList,
  OutlinedInput,
  Paper,
  Select,
  Typography,
  ClickAwayListener,
} from '@material-ui/core';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import YAML from 'yaml';
import ButtonFilled from '../../../../components/Button/ButtonFilled';
import InputField from '../../../../components/InputField';
import Loader from '../../../../components/Loader';
import { GET_CHARTS_DATA, GET_HUB_STATUS } from '../../../../graphql';
import { MyHubDetail } from '../../../../models/graphql/user';
import { Charts, HubStatus } from '../../../../models/redux/myhub';
import * as WorkflowActions from '../../../../redux/actions/workflow';
import useActions from '../../../../redux/actions';
import { RootState } from '../../../../redux/reducers';
import useStyles, { CustomTextField, MenuProps } from './styles';
import WorkflowDetails from '../../../../pages/WorkflowDetails';
import { GET_EXPERIMENT_YAML } from '../../../../graphql/quries';
import BackButton from '../BackButton';

interface WorkflowDetails {
  workflow_name: string;
  workflow_desc: string;
}

interface ChartName {
  ChaosName: string;
  ExperimentName: string;
}

interface VerifyCommitProps {
  gotoStep: (page: number) => void;
}

const CreateWorkflow: React.FC<VerifyCommitProps> = ({ gotoStep }) => {
  const workflowDetails = useSelector((state: RootState) => state.workflowData);
  const workflowAction = useActions(WorkflowActions);

  const { selectedProjectOwner } = useSelector(
    (state: RootState) => state.userData
  );

  const [workflowData, setWorkflowData] = useState<WorkflowDetails>({
    workflow_name: workflowDetails.name,
    workflow_desc: workflowDetails.description,
  });

  const { t } = useTranslation();
  const classes = useStyles();

  const [allExperiments, setAllExperiments] = useState<ChartName[]>([]);
  const [selectedHub, setSelectedHub] = useState('');
  const [selectedExp, setSelectedExp] = useState(
    t('customWorkflow.createWorkflow.selectAnExp') as string
  );

  const [availableHubs, setAvailableHubs] = useState<MyHubDetail[]>([]);
  const [selectedHubDetails, setSelectedHubDetails] = useState<MyHubDetail>();

  const [getExperimentYaml] = useLazyQuery(GET_EXPERIMENT_YAML, {
    variables: {
      experimentInput: {
        UserName: selectedProjectOwner, // It should be name of project owner
        HubName: selectedHub,
        ChartName: selectedExp.split('/')[0],
        ExperimentName: selectedExp.split('/')[1],
        FileType: 'experiment',
      },
    },
    onCompleted: (data) => {
      const parsedYaml = YAML.parse(data.getYAMLData);
      workflowAction.setWorkflowDetails({
        customWorkflow: {
          ...workflowDetails.customWorkflow,
          description: parsedYaml.description.message,
        },
      });
      gotoStep(1);
    },
  });

  // Graphql query to get charts
  const [getCharts, { loading: chartsLoading }] = useLazyQuery<Charts>(
    GET_CHARTS_DATA,
    {
      onCompleted: (data) => {
        const allExp: ChartName[] = [];
        data.getCharts.forEach((data) => {
          return data.Spec.Experiments?.forEach((experiment) => {
            allExp.push({
              ChaosName: data.Metadata.Name,
              ExperimentName: experiment,
            });
          });
        });
        setAllExperiments([...allExp]);
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  // Get all MyHubs with status
  const { data } = useQuery<HubStatus>(GET_HUB_STATUS, {
    variables: { data: selectedProjectOwner },
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      setSelectedHub(data.getHubStatus[0].HubName);
      setAvailableHubs([...data.getHubStatus]);
      getCharts({
        variables: {
          data: {
            UserName: selectedProjectOwner,
            RepoURL: data.getHubStatus[0].RepoURL,
            RepoBranch: data.getHubStatus[0].RepoBranch,
            HubName: data.getHubStatus[0].HubName,
          },
        },
      });
      setSelectedHubDetails(data.getHubStatus[0]);
    },
  });

  // Function to get charts of a particular hub
  const findChart = (hubname: string) => {
    const myHubData = data?.getHubStatus.filter((myHub) => {
      return hubname === myHub.HubName;
    })[0];
    getCharts({
      variables: {
        data: {
          UserName: selectedProjectOwner,
          RepoURL: myHubData?.RepoURL,
          RepoBranch: myHubData?.RepoBranch,
          HubName: hubname,
        },
      },
    });
    setSelectedHubDetails(myHubData);
  };

  const [open, setOpen] = useState(false);

  const filteredExperiment = allExperiments.filter((exp) => {
    const name = `${exp.ChaosName}/${exp.ExperimentName}`;
    if (selectedExp === 'Select an experiment') {
      return true;
    }
    return name.includes(selectedExp);
  });

  return (
    <div className={classes.root}>
      <div className={classes.headerDiv}>
        <BackButton
          isDisabled={false}
          onClick={() => {
            workflowAction.setWorkflowDetails({
              isCustomWorkflow: false,
            });
            window.history.back();
          }}
        />
        <Typography variant="h3" className={classes.headerText} gutterBottom>
          {t('customWorkflow.createWorkflow.create')}
        </Typography>
        <Typography className={classes.headerDesc}>
          {t('customWorkflow.createWorkflow.createDesc')}
        </Typography>
      </div>
      <div className={classes.workflowDiv}>
        <Typography variant="h4">
          <strong> {t('customWorkflow.createWorkflow.workflowInfo')}</strong>
        </Typography>
        <div>
          <div className={classes.inputDiv}>
            <Typography variant="h6" className={classes.titleText}>
              {t('customWorkflow.createWorkflow.workflowName')}:
            </Typography>
            <InputField
              label="Workflow Name"
              styles={{
                width: '100%',
              }}
              data-cy="inputWorkflowName"
              validationError={false}
              handleChange={(e) => {
                setWorkflowData({
                  workflow_name: e.target.value,
                  workflow_desc: workflowData.workflow_desc,
                });
              }}
              value={workflowData.workflow_name}
            />
          </div>
          <div className={classes.inputDiv}>
            <Typography variant="h6" className={classes.titleText}>
              {t('customWorkflow.createWorkflow.workflowDesc')}:
            </Typography>
            <CustomTextField
              label="Description"
              data-cy="inputWorkflowDesc"
              InputProps={{
                disableUnderline: true,
                classes: {
                  input: classes.resize,
                },
              }}
              onChange={(e) => {
                setWorkflowData({
                  workflow_name: workflowData.workflow_name,
                  workflow_desc: e.target.value,
                });
              }}
              value={workflowData.workflow_desc}
              multiline
              rows={14}
            />
          </div>
          <hr />
          <div className={classes.inputDiv}>
            <Typography variant="h6" className={classes.titleText}>
              {t('customWorkflow.createWorkflow.firstChaos')}
            </Typography>
            <FormControl
              variant="outlined"
              className={classes.formControl}
              color="secondary"
              focused
            >
              <InputLabel className={classes.selectText}>
                {t('customWorkflow.createWorkflow.selectHub')}
              </InputLabel>
              <Select
                value={selectedHub}
                onChange={(e) => {
                  setSelectedHub(e.target.value as string);
                  findChart(e.target.value as string);
                }}
                label="Cluster Status"
                MenuProps={MenuProps}
                className={classes.selectText}
              >
                {availableHubs.map((hubs) => (
                  <MenuItem key={hubs.HubName} value={hubs.HubName}>
                    {hubs.HubName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className={classes.inputDiv}>
            <Typography variant="h6" className={classes.titleText}>
              {t('customWorkflow.createWorkflow.chooseExp')}
            </Typography>
            {chartsLoading ? (
              <div className={classes.chooseExpDiv}>
                <Loader />
                <Typography variant="body2">
                  {t('customWorkflow.createWorkflow.loadingExp')}
                </Typography>
              </div>
            ) : (
              <FormControl
                variant="outlined"
                color="secondary"
                focused
                component="button"
                className={classes.formControl}
              >
                <InputLabel className={classes.selectText1}>
                  {t('customWorkflow.createWorkflow.selectExp')}
                </InputLabel>
                <OutlinedInput
                  value={selectedExp}
                  onChange={(e) => {
                    setSelectedExp(e.target.value);
                    setOpen(true);
                  }}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => {
                          setOpen(!open);
                        }}
                        edge="end"
                      >
                        <ArrowDropDownIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                  className={classes.inputExpDiv}
                  labelWidth={150}
                />
                {open ? (
                  <ClickAwayListener onClickAway={() => setOpen(!open)}>
                    <Paper elevation={3}>
                      <MenuList className={classes.expMenu}>
                        {filteredExperiment.length > 0 ? (
                          filteredExperiment.map((exp) => (
                            <MenuItem
                              key={`${exp.ChaosName}/${exp.ExperimentName}`}
                              value={`${exp.ChaosName}/${exp.ExperimentName}`}
                              onClick={() => {
                                setSelectedExp(
                                  `${exp.ChaosName}/${exp.ExperimentName}`
                                );
                                setOpen(false);
                                workflowAction.setWorkflowDetails({
                                  customWorkflow: {
                                    ...workflowDetails.customWorkflow,
                                    experiment_name: `${exp.ChaosName}/${exp.ExperimentName}`,
                                    yamlLink: `${selectedHubDetails?.RepoURL}/raw/${selectedHubDetails?.RepoBranch}/charts/${exp.ChaosName}/${exp.ExperimentName}/engine.yaml`,
                                  },
                                });
                              }}
                            >
                              {exp.ExperimentName}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem value="Select an experiment">
                            {t('customWorkflow.createWorkflow.noExp')}
                          </MenuItem>
                        )}
                      </MenuList>
                    </Paper>
                  </ClickAwayListener>
                ) : null}
              </FormControl>
            )}
          </div>
        </div>
      </div>
      <div className={classes.nextButtonDiv}>
        <ButtonFilled
          handleClick={() => {
            workflowAction.setWorkflowDetails({
              name: workflowData.workflow_name,
              description: workflowData.workflow_desc,
              customWorkflow: {
                ...workflowDetails.customWorkflow,
                hubName: selectedHub,
                repoUrl: selectedHubDetails?.RepoURL,
                repoBranch: selectedHubDetails?.RepoBranch,
                yaml: '',
                index: -1,
              },
            });
            getExperimentYaml();
          }}
          isPrimary
          isDisabled={
            selectedExp === 'Select an experiment' ||
            filteredExperiment.length !== 1
          }
        >
          <div>
            {t('customWorkflow.createWorkflow.nextBtn')}
            <img
              alt="next"
              src="/icons/nextArrow.svg"
              className={classes.nextArrow}
            />
          </div>
        </ButtonFilled>
      </div>
    </div>
  );
};
export default CreateWorkflow;
