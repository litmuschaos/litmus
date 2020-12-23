import { Divider, Typography } from '@material-ui/core';
import React from 'react';
import ButtonFilled from '../../../components/Button/ButtonFilled';
import ButtonOutlined from '../../../components/Button/ButtonOutline';
import Scaffold from '../../../containers/layouts/Scaffold';
import { preDefinedWorkflowData } from '../../../models/predefinedWorkflow';
import { LocationState } from '../../../models/routerModel';
import { history } from '../../../redux/configureStore';
import ExperimentDetails from './ExperimentDetails';
import Head from './Head';
import Recommendation from './Recommendation';
import useStyles from './styles';
import useActions from '../../../redux/actions';
import * as WorkflowActions from '../../../redux/actions/workflow';

interface LocationObjectProps {
  workflowData: preDefinedWorkflowData;
  testNames: string[];
  testWeights: number[];
}

interface BrowseTemplateProps {
  location: LocationState<LocationObjectProps>;
}

const BrowseAWorkflow: React.FC<BrowseTemplateProps> = ({ location }) => {
  const classes = useStyles();
  const workflowAction = useActions(WorkflowActions);
  const { workflowData, testNames, testWeights } = location.state;

  return (
    <Scaffold>
      <div className={classes.root}>
        <Typography className={classes.headerTitle}>
          Browse a workflow template
        </Typography>
        <Typography variant="subtitle1" className={classes.bodytext}>
          See details of your workflow template
        </Typography>
        <section className={classes.contentWrapper}>
          {/* Header */}
          <Head
            image={workflowData.urlToIcon}
            title={workflowData.title}
            details={workflowData.details}
          />
          <Divider className={classes.m2} />

          {/* Experiment Details */}
          <ExperimentDetails
            testNames={testNames}
            testWeights={testWeights}
            experimentinfo={workflowData.experimentinfo}
          />
          <Divider className={classes.m2} />

          {/* Recommendation */}
          <Recommendation recommendation={workflowData.recommendation} />
          <Divider className={classes.m2} />

          {/* Buttons */}
          <div className={classes.spaceBetween}>
            <ButtonOutlined
              isDisabled={false}
              handleClick={() => history.push('/workflows')}
            >
              <>Back</>
            </ButtonOutlined>
            <ButtonFilled
              isPrimary={false}
              handleClick={() => {
                workflowAction.setWorkflowDetails({
                  description: '',
                  isCustomWorkflow: false,
                  customWorkflows: [],
                });
                history.push('/create-workflow');
              }}
            >
              <>Schedule this template</>
            </ButtonFilled>
          </div>
        </section>
      </div>
    </Scaffold>
  );
};

export default BrowseAWorkflow;
