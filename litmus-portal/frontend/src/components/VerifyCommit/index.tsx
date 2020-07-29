import { Divider, Link, Typography } from '@material-ui/core';
import React from 'react';
import bfinance from '../../assets/icons/b-finance.png';
import AdjustedWeights from '../AdjustedWeights';
import ButtonFilled from '../Button/ButtonFilled';
import ButtonOutline from '../Button/ButtonOutline/index';
import CustomText from '../CustomText';
import CustomDate from '../DateTime/CustomDate';
import CustomTime from '../DateTime/CustomTime';
import useStyles from './styles';

function VerifyCommit() {
  const classes = useStyles();
  const testVal1 = 10;
  const testVal2 = 7;
  const testVal3 = 4;
  const testVal4 = 3;
  const width1 = 299;
  const width2 = 700;

  const preventDefault = (event: React.SyntheticEvent) =>
    event.preventDefault();
  return (
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
                <Typography className={classes.col1}>Workflow name</Typography>
              </div>
              <div className={classes.col2}>
                <CustomText
                  value="Kubernetes-conformance-workflow-3849"
                  id="name"
                  width={width1}
                />
              </div>
            </div>
            <div className={classes.summaryDiv}>
              <div className={classes.innerSumDiv}>
                <Typography className={classes.col1}>Test cluster</Typography>
              </div>
              <div
                className={classes.col2}
                style={{
                  width: 724,
                }}
              >
                <CustomText
                  value="Lorem ipsum dolor sit amet, consectetur adipiscing elit.Curabitur bibendum quis nisi nec interdum. Vestibulum fringilla bibendum mollis. Sed eget metus enim. Etiam vitae purus in est finibus facilisis.Donec sed est lacus. Pellentesque accumsan dolor sollicitudin lobortis viverra. Donec ullamcorper urna vitae maximus gravida. Nam posuere quis enim in."
                  id="desc"
                  width={width2}
                />
              </div>
            </div>
            <div className={classes.summaryDiv}>
              <div
                style={{
                  width: '9.375rem',
                }}
              >
                <div className={classes.innerSumDiv}>
                  <Typography className={classes.col1}>Schedule</Typography>
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
                  Adjusted Weights
                </Typography>
              </div>
              <div className={classes.adjWeights}>
                <div className={classes.progress}>
                  <AdjustedWeights
                    testName="Node add test"
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
            </div>
            <div className={classes.summaryDiv}>
              <div className={classes.innerSumDiv}>
                <Typography className={classes.col1}>YAML</Typography>
              </div>
              <div className={classes.yamlCol2}>
                <Typography>Your code is fine. You can move on!</Typography>
              </div>
              <div className={classes.yamlButton}>
                <ButtonFilled handleClick={() => {}} isPrimary>
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
  );
}

export default VerifyCommit;
