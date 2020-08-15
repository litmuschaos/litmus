import { Modal, Typography } from '@material-ui/core';
import React from 'react';
import { useSelector } from 'react-redux';
import Center from '../../containers/layouts/Center';
import ButtonFilled from '../Button/ButtonFilled';
import ButtonOutline from '../Button/ButtonOutline';
import CustomSlider from '../CustomSlider';
import InfoTooltip from '../InfoTooltip';
import ResultTable from './ResultTable';
import useStyles from './styles';
import { WorkflowData, experimentMap } from '../../models/workflow';
import { RootState } from '../../redux/reducers';
import useActions from '../../redux/actions';
import * as WorkflowActions from '../../redux/actions/workflow';

const ReliablityScore = () => {
  const classes = useStyles();

  const workflowData: WorkflowData = useSelector(
    (state: RootState) => state.workflowData
  );
  const workflow = useActions(WorkflowActions);

  const { weights } = workflowData;

  const [open, setOpen] = React.useState(false);

  const testNames: string[] = [];
  const testWeights: number[] = [];
  weights.forEach((weight) => {
    testNames.push(weight.experimentName);
    testWeights.push(weight.weight);
  });

  function handleChange({
    newValue,
    index,
  }: {
    newValue: number;
    index: number;
  }) {
    (weights as any)[index].weight = newValue;
    workflow.setWorkflowDetails({
      weights,
    });
  }

  return (
    <div>
      {(weights as any)[0].experimentName === 'Invalid CRD' ||
      (weights as any)[0].experimentName === 'Yaml Error' ? (
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
                You have selected {weights?.length} tests in the “Kubernetes
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
            {(weights as any).map((Data: experimentMap, index: number) => (
              <div>
                <div>
                  <CustomSlider
                    index={index}
                    testName={Data.experimentName}
                    weight={Data.weight}
                    handleChange={(newValue, index) =>
                      handleChange({ newValue, index })
                    }
                  />
                </div>
              </div>
            ))}
            <hr className={classes.horizontalLine} />
            <div className={classes.modalDiv}>
              <div className={classes.divRow}>
                <ButtonOutline
                  isDisabled={false}
                  handleClick={() => setOpen(true)}
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
                        testValue={testWeights}
                        testNames={testNames}
                      />
                    </div>
                    <hr className={classes.horizontalLineResult} />
                    <div className={classes.gotItBtn}>
                      <Center>
                        <ButtonFilled
                          handleClick={() => setOpen(false)}
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
