import { Modal, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Center from '../../containers/layouts/Center';
import ButtonFilled from '../Button/ButtonFilled';
import ButtonOutline from '../Button/ButtonOutline';
import CustomSlider from '../CustomSlider';
import InfoTooltip from '../InfoTooltip';
import ResultTable from './ResultTable';
import useStyles from './styles';
import { WorkflowData } from '../../models/workflow';
import { RootState } from '../../redux/reducers';
import parsed from '../../utils/yamlUtils';

// refractor needed

const ReliablityScore = () => {
  const [WorkflowTestNames, setData] = useState(['']);
  const workflowData: WorkflowData = useSelector(
    (state: RootState) => state.workflowData
  );
  const { yaml } = workflowData;
  const [value, setValue] = useState<number | Array<number>>([0]);
  const [value1, setValue1] = useState<number | Array<number>>([0]);
  const [value2, setValue2] = useState<number | Array<number>>([0]);
  const [value3, setValue3] = useState<number | Array<number>>([0]);
  const handleChange = (event: any, newValue: number | number[]) => {
    setValue(newValue);
  };
  const handleChange1 = (event: any, newValue: number | number[]) => {
    setValue1(newValue);
  };
  const handleChange2 = (event: any, newValue: number | number[]) => {
    setValue2(newValue);
  };
  const handleChange3 = (event: any, newValue: number | number[]) => {
    setValue3(newValue);
  };

  const testValue = [value, value1, value2, value3];

  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [totalTest] = React.useState(12);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const tests = parsed(yaml);
    setData(tests);
  }, []);

  return (
    <div>
      {WorkflowTestNames[0] === 'Invalid CRD' ||
      WorkflowTestNames[0] === 'Yaml Error' ? (
        <div>
          {' '}
          <Typography className={classes.errorText}>
            <strong>
              Invalid Workflow CRD found ! Please go back and correct the
              errors.
            </strong>
          </Typography>
        </div>
      ) : (
        <form className={classes.root}>
          <div className={classes.mainDiv}>
            <div>
              <Typography className={classes.headerText}>
                <strong>
                  Adjust the weights of the experiments in the workflow
                </strong>
              </Typography>
              <Typography className={classes.description}>
                You have selected {totalTest} tests in the “Kubernetes
                conformance test” workflow. Successful outcome of each test
                carries a certain weight. We have pre-selected weights for each
                test for you. However, you may review and modify the weigtage
                against.{' '}
                <strong>The weights are relative to each other.</strong>
              </Typography>
            </div>
            <hr className={classes.horizontalLine} />
            <div className={classes.divRow}>
              <Typography className={classes.testHeading}>
                <strong>Kubernetes conformance test</strong>
              </Typography>
            </div>
            <div>
              <div>
                <CustomSlider
                  value={typeof value === 'number' ? value : 0}
                  testName={`${WorkflowTestNames[0]} test`}
                  onChangeCommitted={handleChange}
                />
              </div>
              <div>
                <CustomSlider
                  value={typeof value1 === 'number' ? value1 : 0}
                  testName="Config map multi volume test"
                  onChangeCommitted={handleChange1}
                />
              </div>
              <div>
                <CustomSlider
                  value={typeof value2 === 'number' ? value2 : 0}
                  testName="Networking pod test"
                  onChangeCommitted={handleChange2}
                />
              </div>
              <div>
                <CustomSlider
                  value={typeof value3 === 'number' ? value3 : 0}
                  testName="Proxy-service-test"
                  onChangeCommitted={handleChange3}
                />
              </div>
            </div>
            <hr className={classes.horizontalLine} />
            <div className={classes.modalDiv}>
              <div className={classes.divRow}>
                <ButtonOutline
                  isDisabled={false}
                  handleClick={handleOpen}
                  data-cy="testRunButton"
                >
                  <div className={classes.buttonOutlineDiv}>
                    <img src="icons/video.png" alt="Play icon" />
                    <Typography className={classes.buttonOutlineText}>
                      Demo Launch
                    </Typography>
                  </div>
                </ButtonOutline>
                <div className={classes.toolTipDiv}>
                  <InfoTooltip value="Text Default" />
                </div>
                <Modal open={open}>
                  <div className={classes.modalContainer}>
                    <div>
                      <ResultTable
                        testValue={testValue}
                        testNames={WorkflowTestNames}
                      />
                    </div>
                    <hr className={classes.horizontalLineResult} />
                    <div className={classes.gotItBtn}>
                      <Center>
                        <ButtonFilled
                          handleClick={handleClose}
                          data-cy="gotItButton"
                          isPrimary
                        >
                          <div>Got it</div>
                        </ButtonFilled>
                      </Center>
                    </div>
                  </div>
                </Modal>
              </div>
              <div>
                <Typography className={classes.testInfo}>
                  Compare the importance of the items above and launch a demo
                  version of Kubernetes conformance test to see how it works.
                </Typography>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default ReliablityScore;
