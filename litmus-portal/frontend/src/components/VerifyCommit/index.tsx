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
import { WorkflowData } from '../../models/workflow';
import { RootState } from '../../redux/reducers';
import {
  parseYamlValidations,
  AceValidations,
} from '../YamlEditor/Validations';
import parsed from '../../utils/yamlUtils';

// refractor needed

function VerifyCommit() {
  const classes = useStyles();
  const testVal1 = 10;
  const testVal2 = 7;
  const testVal3 = 4;
  const testVal4 = 3;
  const width1 = 299;
  const width2 = 700;

  const workflowData: WorkflowData = useSelector(
    (state: RootState) => state.workflowData
  );

  const { name, link, yaml, id, description } = workflowData;

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

  const [WorkflowTestNames, setData] = useState(['']);

  useEffect(() => {
    const tests = parsed(yaml);
    setData(tests);
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
          <div className={classes.suSegments}>
            <div>
              <Typography className={classes.headerText}>
                <strong> Confirmation of Results</strong>
              </Typography>

              <div className={classes.suBody}>
                <Typography align="left" className={classes.description}>
                  Before committing the workflow changes to your, verify and if
                  needed go back to a corresponding section of the wizard to
                  modify.
                </Typography>
              </div>
            </div>
            <img src={bfinance} alt="bfinance" className={classes.bfinIcon} />
          </div>
          <Divider className={classes.divider} />

          <div className={classes.innerDiv2}>
            <Typography align="left" className={classes.sumText}>
              <strong>Summary</strong>
            </Typography>

            <div className={classes.outerSum}>
              <div className={classes.summaryDiv}>
                <div className={classes.innerSumDiv}>
                  <Typography className={classes.col1}>
                    Workflow name:
                  </Typography>
                </div>
                <div className={classes.col2}>
                  <CustomText value={name} id="name" width={width1} />
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
                  <CustomText value={description} id="desc" width={width2} />
                </div>
              </div>
              <div className={classes.summaryDiv}>
                <div
                  style={{
                    width: '9.375rem',
                  }}
                >
                  <div className={classes.innerSumDiv}>
                    <Typography className={classes.col1}>Schedule:</Typography>
                  </div>
                </div>

                <div className={classes.schCol2}>
                  <CustomDate disabled />
                  <CustomTime ampm disabled />
                  <div className={classes.editButton1}>
                    <ButtonOutline
                      isDisabled={false}
                      handleClick={() => {}}
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
                <div
                  className={classes.innerSumDiv}
                  style={{
                    width: '8.375rem',
                  }}
                >
                  <Typography className={classes.col1}>
                    Adjusted Weights:
                  </Typography>
                </div>
                {WorkflowTestNames[0] === 'Invalid CRD' ||
                WorkflowTestNames[0] === 'Yaml Error' ? (
                  <div>
                    {' '}
                    <Typography className={classes.errorText}>
                      <strong>
                        {' '}
                        &nbsp; &nbsp; &nbsp; Invalid Workflow CRD found ! Please
                        correct the errors.
                      </strong>
                    </Typography>
                  </div>
                ) : (
                  <div className={classes.adjWeights}>
                    <div className={classes.progress}>
                      <AdjustedWeights
                        testName={`${WorkflowTestNames[0]} test`}
                        testValue={testVal1}
                      />
                      <AdjustedWeights
                        testName=" Networking pod test "
                        testValue={testVal2}
                      />
                      <div className={classes.editButton2}>
                        <ButtonOutline
                          isDisabled={false}
                          handleClick={() => {}}
                          data-cy="testRunButton"
                        >
                          <Typography className={classes.buttonOutlineText}>
                            Edit
                          </Typography>
                        </ButtonOutline>
                      </div>
                    </div>
                    <div className={classes.progress}>
                      <AdjustedWeights
                        testName="Config map multi volume test"
                        testValue={testVal3}
                      />
                      <AdjustedWeights
                        testName="Proxy-service-test"
                        testValue={testVal4}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className={classes.summaryDiv}>
                <div className={classes.innerSumDiv}>
                  <Typography className={classes.col1}>YAML:</Typography>
                </div>
                <div className={classes.yamlCol2}>
                  {WorkflowTestNames[0] === 'Invalid CRD' ||
                  WorkflowTestNames[0] === 'Yaml Error' ? (
                    <Typography> Error in CRD Yaml. </Typography>
                  ) : (
                    <Typography>{yamlStatus}</Typography>
                  )}
                </div>
                <div className={classes.yamlButton}>
                  <ButtonFilled handleClick={handleOpen} isPrimary>
                    <div>View YAML</div>
                  </ButtonFilled>
                </div>
              </div>
            </div>

            <Divider className={classes.divider} />
          </div>

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
          />
        </div>
      </Modal>
    </div>
  );
}

export default VerifyCommit;
