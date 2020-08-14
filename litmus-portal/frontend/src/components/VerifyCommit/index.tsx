import { Button, Divider, Link, Modal, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import bfinance from '../../assets/icons/b-finance.png';
import AdjustedWeights from '../AdjustedWeights';
import ButtonFilled from '../Button/ButtonFilled';
import ButtonOutline from '../Button/ButtonOutline/index';
import CustomText from '../CustomText';
import CustomDate from '../DateTime/CustomDate';
import CustomTime from '../DateTime/CustomTime';
import useStyles from './styles';
import YamlEditor from '../YamlEditor/Editor';
import { WorkflowData, experimentMap } from '../../models/workflow';
import { RootState } from '../../redux/reducers';
import {
  parseYamlValidations,
  AceValidations,
} from '../YamlEditor/Validations';
import useActions from '../../redux/actions';
import * as WorkflowActions from '../../redux/actions/workflow';

interface VerifyCommitProps {
  goto: () => void;
}

const VerifyCommit: React.FC<VerifyCommitProps> = ({ goto }) => {
  const classes = useStyles();
  const width1 = 700;
  const width2 = 700;

  const workflow = useActions(WorkflowActions);
  const [edit, setEdit] = useState(true);

  const workflowData: WorkflowData = useSelector(
    (state: RootState) => state.workflowData
  );

  const { name, link, yaml, id, description, weights } = workflowData;

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
    workflow.setWorkflowDetails({
      name: changedName,
    });
  };

  const handleDescChange = ({ changedDesc }: { changedDesc: string }) => {
    workflow.setWorkflowDetails({
      description: changedDesc,
    });
  };

  const WorkflowTestData: experimentMap[] = weights as any;

  useEffect(() => {
    let editorValidations: AceValidations = {
      markers: [],
      annotations: [],
    };
    editorValidations = parseYamlValidations(yaml, classes);
    const stateObject = {
      markers: editorValidations.markers,
      annotations: editorValidations.annotations,
    };
    if (stateObject.annotations.length > 0) {
      setYamlStatus('Error in CRD Yaml.');
    } else {
      setYamlStatus('Your code is fine. You can move on !');
    }
  }, [modified]);

  const preventDefault = (event: React.SyntheticEvent) =>
    event.preventDefault();
  return (
    <div>
      <div className={classes.root}>
        <div className={classes.suHeader}>
          <div className={classes.suBody}>
            <Typography className={classes.headerText}>
              <strong> Confirmation of Results</strong>
            </Typography>
            <Typography className={classes.description}>
              Before committing the workflow changes to your, verify and if
              needed go back to a corresponding section of the wizard to modify.
            </Typography>
          </div>
          <img src={bfinance} alt="bfinance" className={classes.bfinIcon} />
        </div>
        <Divider />

        <Typography className={classes.sumText}>
          <strong>Summary</strong>
        </Typography>

        <div className={classes.outerSum}>
          <div className={classes.summaryDiv}>
            <div className={classes.innerSumDiv}>
              <Typography className={classes.col1}>Workflow name:</Typography>
            </div>
            <div className={classes.col2}>
              <CustomText
                value={name}
                id="name"
                width={width1}
                onchange={(changedName: string) =>
                  handleNameChange({ changedName })
                }
              />
            </div>
          </div>
          <div className={classes.summaryDiv}>
            <div className={classes.innerSumDiv}>
              <Typography className={classes.col1}>Description:</Typography>
            </div>
            <div
              className={classes.col2}
              style={{
                width: 724,
              }}
            >
              <CustomText
                value={description}
                id="desc"
                width={width2}
                onchange={(changedDesc: string) =>
                  handleDescChange({ changedDesc })
                }
              />
            </div>
          </div>
          <div className={classes.summaryDiv}>
            <div className={classes.innerSumDiv}>
              <Typography className={classes.col1}>Schedule:</Typography>
            </div>
            <div className={classes.schCol2}>
              <CustomDate disabled={edit} />
              <CustomTime ampm disabled={edit} />
              <div className={classes.editButton1}>
                <ButtonOutline
                  isDisabled={false}
                  handleClick={() => setEdit(!edit)}
                  data-cy="testRunButton"
                >
                  <Typography className={classes.buttonOutlineText}>
                    Edit
                  </Typography>
                </ButtonOutline>
              </div>
            </div>
          </div>
          <div className={classes.summaryDiv}>
            <div className={classes.innerSumDiv}>
              <Typography className={classes.col1}>
                Adjusted Weights:
              </Typography>
            </div>
            {WorkflowTestData[0].experimentName === 'Invalid CRD' ||
            WorkflowTestData[0].experimentName === 'Yaml Error' ? (
              <div>
                {' '}
                <Typography className={classes.errorText}>
                  <strong>
                    {' '}
                    Invalid Workflow CRD found ! Please correct the errors.
                  </strong>
                </Typography>
              </div>
            ) : (
              <div className={classes.adjWeights}>
                <div className={classes.progress} style={{ flexWrap: 'wrap' }}>
                  {WorkflowTestData.map((Test) => (
                    <AdjustedWeights
                      testName={`${Test.experimentName} test`}
                      testValue={Test.weight}
                    />
                  ))}
                </div>
                {/* <div className={classes.editButton2}> */}
                <ButtonOutline
                  isDisabled={false}
                  handleClick={() => goto()}
                  data-cy="testRunButton"
                >
                  <Typography className={classes.buttonOutlineText}>
                    Edit
                  </Typography>
                </ButtonOutline>
                {/* </div> */}
              </div>
            )}
          </div>
          <div className={classes.summaryDiv}>
            <div className={classes.innerSumDiv}>
              <Typography className={classes.col1}>YAML:</Typography>
            </div>
            <div className={classes.yamlFlex}>
              {WorkflowTestData[0].experimentName === 'Invalid CRD' ||
              WorkflowTestData[0].experimentName === 'Yaml Error' ? (
                <Typography> Error in CRD Yaml. </Typography>
              ) : (
                <Typography>{yamlStatus}</Typography>
              )}
              <div className={classes.yamlButton}>
                <ButtonFilled handleClick={handleOpen} isPrimary>
                  <div>View YAML</div>
                </ButtonFilled>
              </div>
            </div>
          </div>
        </div>
        <Divider />
        <div>
          <Typography className={classes.config}>
            The configuration details of this workflow will be committed to:{' '}
            <span>
              <Link
                href="https://github.com/abcorn-org/reputeops/sandbox-repute.yaml"
                onClick={preventDefault}
                className={classes.link}
              >
                https://github.com/abcorn-org/reputeops/sandbox-repute.yaml
              </Link>
            </span>
          </Typography>
        </div>
      </div>

      <Modal open={open} onClose={handleClose}>
        <div className={classes.modalContainer}>
          <div className={classes.modalContainerClose}>
            <Button
              variant="outlined"
              color="secondary"
              className={classes.closeButtonStyle}
              onClick={handleClose}
            >
              &#x2715;
            </Button>
          </div>
          <YamlEditor
            content={yaml}
            filename={name}
            yamlLink={link}
            id={id}
            description={description}
            readOnly
            optionsDisplay={false}
          />
        </div>
      </Modal>
    </div>
  );
};

export default VerifyCommit;
