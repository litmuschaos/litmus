import React, { useCallback, useEffect, useState } from 'react';
import { Typography, Modal } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import useStyles, { CssTextField, ColorButton } from './styles';
import useActions from '../../redux/actions';
import * as WorkflowActions from '../../redux/actions/workflow';
import PredifinedWorkflows from '../PredifinedWorkflows';
import {
  preDefinedWorkflowData,
  workflowDetails,
} from '../../models/predefinedWorkflow';
// import { getWkfRunCount } from "../../utils";

const ChooseWorkflow: React.FC = () => {
  const classes = useStyles();

  const workflow = useActions(WorkflowActions);

  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [selectedWorkflowName, setSelectedWorkflowName] = useState(
    'Personal Workflow 1'
  );

  const [selectedWorkflowDesc, setSelectedWorkflowDesc] = useState(
    'Personal Workflow 1 Description'
  );

  const [WorkflowName, setName] = useState(' ');

  const [WorkflowDescriptionforTF, setDescriptionTF] = useState(' ');

  const WorkflowNameChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setName((event.target as HTMLInputElement).value);
  };

  const WorkflowDescriptionChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDescriptionTF((event.target as HTMLInputElement).value);
  };

  const handleSave = () => {
    setSelectedWorkflowName(WorkflowName);
    setSelectedWorkflowDesc(WorkflowDescriptionforTF);
    workflow.setWorkflowDetails({
      name: WorkflowName,
      description: WorkflowDescriptionforTF,
    });
  };

  /*
	const { analyticsData } = useSelector(
		(state: RootState) => state
	);
  */

  // Fetch and Set preDefWorkflows from backend via GQL.

  const [preDefWorkflows, setPreDefWorkflows] = useState<
    preDefinedWorkflowData[]
  >([]);

  const [totalWorkflows, setTotalWorkflows] = useState(0);

  const fetchWorkflows = useCallback(() => {
    workflow.setWorkflowDetails({
      name: selectedWorkflowName,
      yaml: '# Argo workflow CRD for chaos injection using LitmusChaos',
      description: selectedWorkflowDesc,
    });

    const workflows = [];

    const workflowsList = [
      {
        workflowID: '1',
        title: 'Native Pod Delete',
        urlToIcon: 'https://hub.litmuschaos.io/api/icon/generic/pod-delete.png',
        chaosWkfCRDLink:
          'https://raw.githubusercontent.com/litmuschaos/chaos-workflows/master/Argo/argowf-native-pod-delete.yaml',

        gitLink:
          'https://github.com/litmuschaos/chaos-workflows/blob/master/Argo/argowf-native-pod-delete.yaml',
        provider: 'MayaData',
        description: 'Injects native chaos on pods',
      },
      {
        workflowID: '2',
        title: 'Chaos Admin',
        urlToIcon:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Kubernetes_logo_without_workmark.svg/1200px-Kubernetes_logo_without_workmark.svg.png',
        chaosWkfCRDLink:
          'https://raw.githubusercontent.com/litmuschaos/chaos-workflows/master/Argo/argowf-chaos-admin.yaml',

        gitLink:
          'https://github.com/litmuschaos/chaos-workflows/blob/master/Argo/argowf-chaos-admin.yaml',
        provider: 'MayaData',
        description: 'Injects native chaos on k8s pods',
      },
    ];

    const iterations = workflowsList.length;

    for (let i = 0; i < iterations; i += 1) {
      const workflowItem = workflowsList[i];
      const workflow = {
        workflowID: workflowItem.workflowID,
        title: workflowItem.title,
        urlToIcon: workflowItem.urlToIcon,
        chaosWkfCRDLink: workflowItem.chaosWkfCRDLink,
        gitLink: workflowItem.gitLink,
        provider: workflowItem.provider,
        description: workflowItem.description,
        // totalRuns=(getWkfRunCount(w.name, analyticsData.wkfAnalytics)) or mongoDB
        totalRuns: 5300,
      };
      workflows.push(workflow);
    }
    workflows.push({
      workflowID: 'Custom',
      customWorkflow: true,
    });
    setPreDefWorkflows(workflows);
    setTotalWorkflows(workflows.length - 1);
  }, [setPreDefWorkflows, setTotalWorkflows]);

  const selectWorkflow = (selectedWorkflow: workflowDetails) => {
    workflow.setWorkflowDetails({
      name: selectedWorkflow.name,
      link: selectedWorkflow.link,
      id: selectedWorkflow.id,
      yaml: 'none',
      description: selectedWorkflow.description,
    });
    setName(selectedWorkflow.name);
    setDescriptionTF(selectedWorkflow.description);
    setSelectedWorkflowName(selectedWorkflow.name);
    setSelectedWorkflowDesc(selectedWorkflow.description);
  };

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  return (
    <div>
      <div className={classes.root}>
        <Typography className={classes.heading}>
          <strong>Select or design workflow</strong>
        </Typography>
        <Typography className={classes.description}>
          Select one of the pre-defined chaos workflows or design your own
          workflow.
        </Typography>
        <Divider variant="middle" className={classes.horizontalLine} />
        <div className={classes.cards}>
          <Typography className={classes.totalWorkflows}>
            {totalWorkflows} pre-defined workflows
          </Typography>
          <PredifinedWorkflows
            CallbackOnSelectWorkflow={selectWorkflow}
            workflows={preDefWorkflows}
          />
          <div className={classes.paddedTop}>
            <ColorButton
              variant="contained"
              color="primary"
              className={classes.colorButton}
              onClick={handleOpen}
            >
              Create workflow name
            </ColorButton>
            <Typography className={classes.saved} display="inline">
              <strong>
                <span> &nbsp; &nbsp; &#10003;</span> &nbsp; Name saved as &quot;
                <Typography
                  id="SetName"
                  className={classes.selectionName}
                  display="inline"
                >
                  <strong>{selectedWorkflowName}</strong>
                </Typography>
                &quot;
              </strong>
            </Typography>
          </div>
        </div>
      </div>

      <Modal open={open} onClose={handleClose}>
        <div className={classes.modalContainer}>
          <div className={classes.modalContainerClose}>
            <Button
              variant="outlined"
              color="secondary"
              className={classes.closeButton}
              onClick={handleClose}
            >
              &#x2715;
            </Button>
          </div>
          <div className={classes.modalContainerName}>
            <Typography className={classes.modalHeading} display="inline">
              Create your <strong>workflow name</strong>
            </Typography>
          </div>
          <div className={classes.modalContainerBody}>
            <div className={classes.inputDiv}>
              <div className={classes.inputArea}>
                <CssTextField
                  id="filled-workflowname-input"
                  label="Workflow name"
                  InputProps={{
                    disableUnderline: true,
                    classes: {
                      input: classes.resizeName,
                    },
                  }}
                  data-cy="inputWorkflow"
                  className={classes.textfieldworkflowname}
                  onChange={WorkflowNameChangeHandler}
                  value={WorkflowName}
                  autoFocus
                />
              </div>
              <div className={classes.inputAreaDescription}>
                <CssTextField
                  id="filled-workflowdescription-input"
                  label="Description"
                  InputProps={{
                    disableUnderline: true,
                    classes: {
                      input: classes.resize,
                    },
                  }}
                  data-cy="inputWorkflowDescription"
                  className={classes.textfieldworkflowdescription}
                  value={WorkflowDescriptionforTF}
                  onChange={WorkflowDescriptionChangeHandler}
                  multiline
                  rows={12}
                />
              </div>
            </div>
            <div className={classes.buttons}>
              <Button
                variant="outlined"
                color="secondary"
                className={classes.buttonCancel}
                onClick={handleClose}
              >
                Cancel
              </Button>

              <ColorButton
                variant="contained"
                color="primary"
                className={classes.buttonSave}
                onClick={handleSave}
              >
                Save
              </ColorButton>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChooseWorkflow;
