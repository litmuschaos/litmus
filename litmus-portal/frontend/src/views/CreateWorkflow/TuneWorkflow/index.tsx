import { Typography } from '@material-ui/core';
import { ButtonOutlined } from 'litmus-ui';
import localforage from 'localforage';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Row from '../../../containers/layouts/Row';
import Width from '../../../containers/layouts/Width';
import { WorkflowDetailsProps } from '../../../models/localforage/workflow';
import capitalize from '../../../utils/capitalize';
import useStyles from './styles';
import WorkflowTable from './WorkflowTable';

interface WorkflowProps {
  name: string;
  crd: string;
}

const TuneWorkflow: React.FC = () => {
  const classes = useStyles();

  const [workflow, setWorkflow] = useState<WorkflowProps>({
    name: '',
    crd: '',
  });
  const { t } = useTranslation();

  const getSelectedWorkflowName = () => {
    localforage.getItem('workflow').then((workflow) =>
      setWorkflow({
        name: (workflow as WorkflowDetailsProps).name,
        crd: (workflow as WorkflowDetailsProps).CRD,
      })
    );
  };

  useEffect(() => {
    getSelectedWorkflowName();
  }, []);

  return (
    <div className={classes.root}>
      {/* Header */}
      <div className={classes.headerWrapper}>
        <Typography className={classes.heading}>
          {t('createWorkflow.tuneWorkflow.header')}
        </Typography>
        <Row className={classes.descriptionWrapper}>
          <Typography className={classes.description}>
            {t('createWorkflow.tuneWorkflow.selectedWorkflowInfo')}{' '}
            <i>
              <strong>
                {workflow.name.split('-').map((text) => `${capitalize(text)} `)}
              </strong>
            </i>
            <br />
            {t('createWorkflow.tuneWorkflow.description')}
          </Typography>
          <div className={classes.headerBtn}>
            <ButtonOutlined className={classes.btn1}>
              <img src="./icons/viewYAMLicon.svg" alt="view YAML" />{' '}
              <Width width="0.5rem" /> View YAML
            </ButtonOutlined>
            <ButtonOutlined>Add a new experiment</ButtonOutlined>
          </div>
        </Row>
      </div>
      {/* Experiment Details */}
      <div className={classes.experimentWrapper}>
        {/* Edit Button */}
        <ButtonOutlined>
          <img src="./icons/editsequence.svg" alt="Edit Sequence" />{' '}
          <Width width="0.5rem" />
          Edit Sequence
        </ButtonOutlined>
        {/* Details Section -> Graph on the Left and Table on the Right */}
        <Row>
          {/* Argo Workflow Graph */}
          <Width width="30%">Argo Graph</Width>
          {/* Workflow Table */}
          <Width width="70%">
            <WorkflowTable crd={workflow.crd} />
          </Width>
        </Row>
      </div>
    </div>
  );
};

export default TuneWorkflow;
