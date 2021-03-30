import { Divider, IconButton, Typography } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import cronstrue from 'cronstrue';
import { ButtonFilled, ButtonOutlined, EditableText, Modal } from 'litmus-ui';
import localforage from 'localforage';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import AdjustedWeights from '../../../components/AdjustedWeights';
import YamlEditor from '../../../components/YamlEditor/Editor';
import { parseYamlValidations } from '../../../components/YamlEditor/Validations';
import { WorkflowDetailsProps } from '../../../models/localforage/workflow';
import { experimentMap, WorkflowData } from '../../../models/redux/workflow';
import useActions from '../../../redux/actions';
import * as WorkflowActions from '../../../redux/actions/workflow';
import { RootState } from '../../../redux/reducers';
import useStyles from './styles';

interface VerifyCommitProps {
  isEditable?: boolean;
}

interface WorkflowProps {
  name: string;
  description: string;
}

const VerifyCommit: React.FC<VerifyCommitProps> = ({ isEditable }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [workflowDetails, setWorkflowDetails] = useState<WorkflowProps>({
    name: '',
    description: '',
  });
  const [CRDLink, setCRDLink] = useState<string>('');
  const [weights, setWeights] = useState<experimentMap[]>([
    {
      experimentName: '',
      weight: 0,
    },
    {
      experimentName: '',
      weight: 0,
    },
  ]);

  const workflow = useActions(WorkflowActions);

  const workflowData: WorkflowData = useSelector(
    (state: RootState) => state.workflowData
  );

  const { id, cronSyntax, isDisabled, clustername } = workflowData;

  const manifest = useSelector(
    (state: RootState) => state.workflowManifest.manifest
  );

  // Index DB Fetching for extracting selected Button and Workflow Details
  const getSelectedWorkflowDetails = () => {
    localforage.getItem('workflow').then((workflow) =>
      setWorkflowDetails({
        ...workflowDetails,
        name: (workflow as WorkflowDetailsProps).name,
        description: (workflow as WorkflowDetailsProps).description,
      })
    );
    localforage
      .getItem('workflowCRDLink')
      .then((crd) => setCRDLink(crd as string));
    localforage
      .getItem('weights')
      .then((weight) => setWeights(weight as experimentMap[]));
  };

  useEffect(() => {
    getSelectedWorkflowDetails();
  }, []);

  const [open, setOpen] = React.useState(false);

  const [yamlStatus, setYamlStatus] = React.useState(
    'Your code is fine. You can move on!'
  );

  const [modified, setModified] = React.useState(false);

  const handleOpen = () => {
    setModified(false);
    setOpen(true);
  };

  const handleClose = () => {
    setModified(true);
    setOpen(false);
  };

  const handleNameChange = ({ changedName }: { changedName: string }) => {
    const parsedYaml = YAML.parse(manifest);
    parsedYaml.metadata.name = changedName;
    const nameMappedYaml = YAML.stringify(parsedYaml);
    workflow.setWorkflowDetails({
      name: changedName,
      yaml: nameMappedYaml,
    });
  };

  const handleDescChange = ({ changedDesc }: { changedDesc: string }) => {
    workflow.setWorkflowDetails({
      description: changedDesc,
    });
  };

  const WorkflowTestData: experimentMap[] = weights as any;

  useEffect(() => {
    const editorValidations = parseYamlValidations(manifest, classes);
    const stateObject = {
      markers: editorValidations.markers,
      annotations: editorValidations.annotations,
    };
    if (stateObject.annotations.length > 0) {
      setYamlStatus(`${t('createWorkflow.verifyCommit.errYaml')}`);
    } else {
      setYamlStatus(`${t('createWorkflow.verifyCommit.codeIsFine')}`);
    }
  }, [modified]);

  // const preventDefault = (event: React.SyntheticEvent) =>
  //  event.preventDefault();
  return (
    <div>
      <div className={classes.root}>
        <div className={classes.suHeader}>
          <div className={classes.suBody}>
            <Typography className={classes.headerText}>
              <strong> {t('createWorkflow.verifyCommit.header')}</strong>
            </Typography>
            <Typography className={classes.description}>
              {t('createWorkflow.verifyCommit.info')}
            </Typography>
          </div>
          <img
            src="/icons/b-finance.png"
            alt="bfinance"
            className={classes.bfinIcon}
          />
        </div>
        <Divider />

        <Typography className={classes.sumText}>
          <strong>{t('createWorkflow.verifyCommit.summary.header')}</strong>
        </Typography>

        <div className={classes.outerSum}>
          <div className={classes.summaryDiv}>
            <div className={classes.innerSumDiv}>
              <Typography className={classes.col1}>
                {t('createWorkflow.verifyCommit.summary.workflowName')}:
              </Typography>
            </div>
            <div className={classes.col2} data-cy="WorkflowName">
              <EditableText
                value={workflowDetails.name}
                id="name"
                fullWidth
                onChange={(e) =>
                  handleNameChange({ changedName: e.target.value })
                }
                disabled={workflowData.isRecurring}
              />
            </div>
          </div>

          <div className={classes.summaryDiv}>
            <div className={classes.innerSumDiv}>
              <Typography className={classes.col1}>
                {t('createWorkflow.verifyCommit.summary.clustername')}:
              </Typography>
            </div>
            <Typography className={classes.clusterName}>
              {clustername}
            </Typography>
          </div>

          <div className={classes.summaryDiv}>
            <div className={classes.innerSumDiv}>
              <Typography className={classes.col1}>
                {t('createWorkflow.verifyCommit.summary.desc')}:
              </Typography>
            </div>
            <div className={classes.col2}>
              <EditableText
                value={workflowDetails.description}
                id="desc"
                fullWidth
                onChange={(e) =>
                  handleDescChange({ changedDesc: e.target.value })
                }
                disabled={!isEditable}
              />
            </div>
          </div>
          <div className={classes.summaryDiv}>
            <div className={classes.innerSumDiv}>
              <Typography className={classes.col1}>
                {t('createWorkflow.verifyCommit.summary.schedule')}:
              </Typography>
            </div>
            <div className={classes.schCol2}>
              {/* <CustomDate disabled={edit} />
              <CustomTime
                handleDateChange={handleDateChange}
                value={selectedDate}
                ampm
                disabled={edit}
              /> */}
              {isDisabled ? (
                <Typography className={classes.schedule}>
                  {t('createWorkflow.verifyCommit.summary.disabled')}
                </Typography>
              ) : cronSyntax === '' ? (
                <Typography className={classes.schedule}>
                  {t('createWorkflow.verifyCommit.summary.schedulingNow')}
                </Typography>
              ) : (
                <Typography className={classes.schedule}>
                  {cronstrue.toString(cronSyntax)}
                </Typography>
              )}

              <div className={classes.editButton1}>
                <IconButton>
                  <EditIcon className={classes.editbtn} data-cy="edit" />
                </IconButton>
              </div>
            </div>
          </div>
          <div className={classes.summaryDiv}>
            <div className={classes.innerSumDiv}>
              <Typography className={classes.col1}>
                {t('createWorkflow.verifyCommit.summary.adjustedWeights')}:
              </Typography>
            </div>
            {weights.length === 0 ? (
              <div>
                <Typography className={classes.errorText}>
                  <strong>{t('createWorkflow.verifyCommit.error')}</strong>
                </Typography>
              </div>
            ) : (
              <div className={classes.adjWeights}>
                <div className={classes.progress} style={{ flexWrap: 'wrap' }}>
                  {WorkflowTestData.map((Test) => (
                    <AdjustedWeights
                      key={Test.weight}
                      testName={`${Test.experimentName} test`}
                      testValue={Test.weight}
                      spacing={false}
                      icon={false}
                    />
                  ))}
                </div>
                {/* <div className={classes.editButton2}> */}
                <ButtonOutlined
                  disabled={workflowData.isRecurring}
                  data-cy="testRunButton"
                >
                  <Typography className={classes.buttonOutlineText}>
                    {t('createWorkflow.verifyCommit.button.edit')}
                  </Typography>
                </ButtonOutlined>
                {/* </div> */}
              </div>
            )}
          </div>
          <div className={classes.summaryDiv}>
            <div className={classes.innerSumDiv}>
              <Typography className={classes.col1}>YAML:</Typography>
            </div>
            <div className={classes.yamlFlex}>
              {weights.length === 0 ? (
                <Typography>
                  {' '}
                  {t('createWorkflow.verifyCommit.errYaml')}{' '}
                </Typography>
              ) : (
                <Typography>{yamlStatus}</Typography>
              )}
              <div className={classes.yamlButton}>
                <ButtonFilled onClick={handleOpen}>
                  <div>{t('createWorkflow.verifyCommit.button.viewYaml')}</div>
                </ButtonFilled>
              </div>
            </div>
          </div>
        </div>
        <Divider />
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        width="60%"
        modalActions={
          <ButtonOutlined onClick={handleClose} className={classes.closeBtn}>
            &#x2715;
          </ButtonOutlined>
        }
      >
        <YamlEditor
          content={manifest}
          filename={workflowDetails.name}
          yamlLink={CRDLink}
          id={id}
          description={workflowDetails.description}
          readOnly
        />
      </Modal>
    </div>
  );
};

export default VerifyCommit;
