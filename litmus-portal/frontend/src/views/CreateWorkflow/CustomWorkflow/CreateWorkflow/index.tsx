import { useLazyQuery, useQuery } from '@apollo/client';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import BackButton from '../../../../components/Button/BackButton';
import ButtonFilled from '../../../../components/Button/ButtonFilled';
import InputField from '../../../../components/InputField';
import Loader from '../../../../components/Loader';
import Scaffold from '../../../../containers/layouts/Scaffold';
import { GET_CHARTS_DATA, GET_USER } from '../../../../graphql';
import {
  CurrentUserDetails,
  MyHubDetail,
} from '../../../../models/graphql/user';
import { Chart, Charts } from '../../../../models/redux/myhub';
import * as WorkflowActions from '../../../../redux/actions/workflow';
import useActions from '../../../../redux/actions';
import { RootState } from '../../../../redux/reducers';
import useStyles, { CustomTextField } from './styles';
import { history } from '../../../../redux/configureStore';

interface WorkflowDetails {
  workflow_name: string;
  workflow_desc: string;
}

interface ChartName {
  ChaosName: string;
  ExperimentName: string;
}

const CreateCustomWorkflow = () => {
  const userData = useSelector((state: RootState) => state.userData);

  const hubData = useSelector((state: RootState) => state.publicHubDetails);

  const workflowDetails = useSelector((state: RootState) => state.workflowData);

  const workflowAction = useActions(WorkflowActions);

  const [workflowData, setWorkflowData] = useState<WorkflowDetails>({
    workflow_name: '',
    workflow_desc: '',
  });

  const classes = useStyles();

  const [allExperiment, setAllExperiment] = useState<ChartName[]>([]);

  const [selectedHub, setSelectedHub] = useState('Public Hub');

  const [selectedExp, setSelectedExp] = useState('Select');

  const allExp: ChartName[] = [];

  const [selectedHubDetails, setSelectedHubDetails] = useState<MyHubDetail[]>(
    []
  );

  const { data } = useQuery<CurrentUserDetails>(GET_USER, {
    variables: { username: userData.username },
    fetchPolicy: 'cache-and-network',
  });

  const [getCharts, { loading: chartsLoading }] = useLazyQuery<Charts>(
    GET_CHARTS_DATA,
    {
      onCompleted: (data) => {
        data.getCharts.forEach((data) => {
          return data.Spec.Experiments?.forEach((experiment) => {
            allExp.push({
              ChaosName: data.Metadata.Name,
              ExperimentName: experiment,
            });
          });
        });
        setAllExperiment(allExp);
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  const findChart = (hubname: string) => {
    const myHubData = data?.getUser.my_hub.filter((hubDetails) => {
      return hubDetails.HubName === hubname;
    });
    getCharts({
      variables: {
        data: {
          UserName: userData.username,
          RepoURL: myHubData && myHubData[0].GitURL,
          RepoBranch: myHubData && myHubData[0].GitBranch,
          RepoName: myHubData && myHubData[0].GitURL.split('/')[3],
          HubName: hubname,
        },
      },
    });
    setSelectedHubDetails(myHubData || []);
    workflowAction.setWorkflowDetails({
      customWorkflow: {
        ...workflowDetails.customWorkflow,
        hubName: hubname,
        repoUrl: myHubData && myHubData[0].GitURL,
        repoBranch: myHubData && myHubData[0].GitBranch,
      },
    });
  };

  useEffect(() => {
    if (selectedHub === 'Public Hub') {
      const ChartsData = hubData.charts;
      ChartsData.forEach((data: Chart) => {
        data.Spec.Experiments.forEach((experiment) => {
          allExp.push({
            ChaosName: data.Metadata.Name,
            ExperimentName: experiment,
          });
        });
      });
      setAllExperiment(allExp);
      workflowAction.setWorkflowDetails({
        customWorkflow: {
          ...workflowDetails.customWorkflow,
          hubName: 'Public Hub',
          repoUrl: 'https://github.com/litmuschaos/chaos-charts',
          repoBranch: 'master',
        },
      });
    } else {
      setAllExperiment([]);
    }
  }, [selectedHub]);

  const availableHubs: MyHubDetail[] = data ? data.getUser.my_hub : [];

  return (
    <Scaffold>
      <div className={classes.root}>
        <div className={classes.headerDiv}>
          <BackButton isDisabled={false} />
          <Typography variant="h3" gutterBottom>
            Creating a new chaos workflow
          </Typography>
          <Typography className={classes.headerDesc}>
            Add new experiments from your chaoshubs defined at myhubs section
          </Typography>
        </div>
        <div className={classes.workflowDiv}>
          <Typography variant="h4">
            <strong>Workflow information</strong>
          </Typography>
          <div className={classes.workflowInfo}>
            <div className={classes.inputDiv}>
              <Typography variant="h6" style={{ width: 180 }}>
                Workflow Name:
              </Typography>
              <InputField
                label="Workflow Name"
                styles={{
                  width: '100%',
                }}
                data-cy="inputWorkflow"
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
              <Typography variant="h6" style={{ width: 180 }}>
                Description:
              </Typography>
              <CustomTextField
                label="Description"
                data-cy="inputWorkflow"
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
              {/* </div> */}
            </div>
            <hr />
            <div className={classes.inputDiv}>
              <Typography variant="h6" style={{ maxWidth: 180 }}>
                First Chaos Experiment:
              </Typography>
              <FormControl
                variant="outlined"
                className={classes.formControl}
                color="secondary"
                focused
              >
                <InputLabel className={classes.selectText}>
                  Select the hub
                </InputLabel>
                <Select
                  value={selectedHub}
                  onChange={(e) => {
                    setSelectedHub(e.target.value as string);
                    if (e.target.value !== 'Public Hub') {
                      findChart(e.target.value as string);
                    }
                  }}
                  label="Cluster Status"
                  className={classes.selectText}
                >
                  <MenuItem value="Public Hub">Public Hub</MenuItem>
                  {availableHubs.map((hubs) => (
                    <MenuItem value={hubs.HubName}>{hubs.HubName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className={classes.inputDiv}>
              <Typography variant="h6" style={{ maxWidth: 180 }}>
                Choose the experiment:
              </Typography>
              {chartsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <Loader />
                  <Typography variant="body2">
                    Loading Experiments, please wait...
                  </Typography>
                </div>
              ) : (
                <FormControl
                  variant="outlined"
                  className={classes.formControl}
                  color="secondary"
                  focused
                >
                  <InputLabel className={classes.selectText1}>
                    Select the experiment
                  </InputLabel>
                  <Select
                    value={selectedExp}
                    onChange={(e) => {
                      setSelectedExp(e.target.value as string);
                      if (selectedHub === 'Public Hub') {
                        workflowAction.setWorkflowDetails({
                          customWorkflow: {
                            ...workflowDetails.customWorkflow,
                            experiment_name: e.target.value,
                            yamlLink: `${workflowDetails.customWorkflow.repoUrl}/raw/${workflowDetails.customWorkflow.repoBranch}/charts/${e.target.value}/experiment.yaml`,
                          },
                        });
                      } else {
                        workflowAction.setWorkflowDetails({
                          customWorkflow: {
                            ...workflowDetails.customWorkflow,
                            experiment_name: e.target.value,
                            yamlLink: `${selectedHubDetails[0].GitURL}/raw/${selectedHubDetails[0].GitBranch}/charts/${e.target.value}/experiment.yaml`,
                          },
                        });
                      }
                    }}
                    label="Cluster Status"
                    className={classes.selectText}
                  >
                    <MenuItem value="Select">Select an Experiment</MenuItem>
                    {allExperiment.map((exp) => (
                      <MenuItem
                        value={`${exp.ChaosName}/${exp.ExperimentName}`}
                      >
                        {exp.ExperimentName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </div>
          </div>
        </div>
        <div
          style={{
            width: 200,
            marginLeft: 'auto',
            marginTop: 30,
            marginBottom: 30,
          }}
        >
          <ButtonFilled
            handleClick={() => {
              history.push('/create-workflow/custom/tune');
            }}
            isPrimary
          >
            <div>
              Next
              <img
                alt="next"
                src="/icons/nextArrow.svg"
                className={classes.nextArrow}
              />
            </div>
          </ButtonFilled>
        </div>
      </div>
    </Scaffold>
  );
};

export default CreateCustomWorkflow;
