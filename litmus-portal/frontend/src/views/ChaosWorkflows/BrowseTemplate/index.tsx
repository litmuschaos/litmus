import { Divider, Typography } from '@material-ui/core';
import { ButtonFilled, ButtonOutlined } from 'litmus-ui';
import localforage from 'localforage';
import React from 'react';
import { useTranslation } from 'react-i18next';
import BackButton from '../../../components/Button/BackButton';
import data from '../../../components/PredifinedWorkflows/data';
import Scaffold from '../../../containers/layouts/Scaffold';
import { ChooseWorkflowRadio } from '../../../models/localforage/radioButton';
import { preDefinedWorkflowData } from '../../../models/predefinedWorkflow';
import { LocationState } from '../../../models/routerModel';
import useActions from '../../../redux/actions';
import * as WorkflowActions from '../../../redux/actions/workflow';
import { history } from '../../../redux/configureStore';
import { getProjectID, getProjectRole } from '../../../utils/getSearchParams';
import ExperimentDetails from './ExperimentDetails';
import Head from './Head';
import Recommendation from './Recommendation';
import useStyles from './styles';

interface LocationObjectProps {
  workflowData: preDefinedWorkflowData;
  testNames: string[];
  testWeights: number[];
}

interface BrowseTemplateProps {
  location: LocationState<LocationObjectProps>;
}

const BrowseAWorkflow: React.FC<BrowseTemplateProps> = ({ location }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const projectID = getProjectID();
  const userRole = getProjectRole();
  const workflowAction = useActions(WorkflowActions);
  const { workflowData, testNames, testWeights } = location.state;

  const preSelectWorkflow = () => {
    data.map((w) => {
      if (w.title === workflowData.title) {
        const selection: ChooseWorkflowRadio = {
          selected: 'A',
          id: w.workflowID.toString(),
        };
        localforage.setItem('selectedScheduleOption', selection);
      }
      return null;
    });
    workflowAction.setWorkflowDetails({
      isCustomWorkflow: false,
    });
    history.push({
      pathname: '/create-workflow',
      search: `?projectID=${projectID}&projectRole=${userRole}`,
    });
  };

  return (
    <Scaffold>
      <div className={classes.back}>
        <BackButton />
      </div>
      <div className={classes.root}>
        <Typography className={classes.headerTitle}>
          {t('browseTemplate.browseAWorkflow')}
        </Typography>
        <Typography variant="subtitle1" className={classes.bodytext}>
          {t('browseTemplate.seeDetails')}
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
            <ButtonOutlined onClick={() => history.goBack()}>
              {t('browseTemplate.back')}
            </ButtonOutlined>
            <ButtonFilled variant="success" onClick={() => preSelectWorkflow()}>
              {t('browseTemplate.scheduleThisTemplate')}
            </ButtonFilled>
          </div>
        </section>
      </div>
    </Scaffold>
  );
};

export default BrowseAWorkflow;
