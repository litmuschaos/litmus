import Typography from '@material-ui/core/Typography';
import React, { useState } from 'react';
import CustomSlider from '../CustomSlider';
import CustomResultModal from '../ResultModal';
import useStyles from './styles';
import ButtonOutlineIcon from '../ButtonOutlineIcon';
import InfoTooltip from '../InfoTooltip';

const ReliablityScore = () => {
  // Setting default value of Node Add Test to 0
  const [nodeAddTestValue, setnodeAddTestValue] = useState<
    number | Array<number>
  >([0]);

  // Setting default value of Config Map Multi Volume Test to 0
  const [
    configMapMultiVolumeTestValue,
    setconfigMapMultiVolumeTestValue,
  ] = useState<number | Array<number>>([0]);

  // Setting default value of Networking Pod Test to 0
  const [networkingPodTestValue, setnetworkingPodTestValue] = useState<
    number | Array<number>
  >([0]);

  // Setting default value of Proxy Server Test to 0
  const [proxyServerTestValue, setproxyServerTestValue] = useState<
    number | Array<number>
  >([0]);

  // Handlers to set pervious Test Value to new values
  const handleChange = (
    event: React.ChangeEvent<{}>,
    newValue: number | number[]
  ) => {
    setnodeAddTestValue(newValue);
  };
  const handleChange1 = (
    event: React.ChangeEvent<{}>,
    newValue: number | number[]
  ) => {
    setconfigMapMultiVolumeTestValue(newValue);
  };
  const handleChange2 = (
    event: React.ChangeEvent<{}>,
    newValue: number | number[]
  ) => {
    setnetworkingPodTestValue(newValue);
  };
  const handleChange3 = (
    event: React.ChangeEvent<{}>,
    newValue: number | number[]
  ) => {
    setproxyServerTestValue(newValue);
  };

  // Storing Test Values to Compare
  const testValue = [
    nodeAddTestValue,
    configMapMultiVolumeTestValue,
    networkingPodTestValue,
    proxyServerTestValue,
  ];

  const classes = useStyles();
  const [open, setOpen] = React.useState<boolean>(false);
  const totalTest = React.useState<number>(12);
  const handleModal = () => {
    setOpen(true);
  };
  return (
    <form className={classes.root}>
      <div className={classes.mainDiv}>
        {/* Header and Description */}
        <div>
          <Typography className={classes.headerText}>
            <strong>
              Adjust the weights of the experiments in the workflow
            </strong>
          </Typography>
          <Typography className={classes.description}>
            You have selected {totalTest} tests in the “Kubernetes conformance
            test” workflow. Successful outcome of each test carries a certain
            weight. We have pre-selected weights for each test for you. However,
            you may review and modify the weigtage against.{' '}
            <strong>The weights are relative to each other.</strong>
          </Typography>
        </div>
        <hr className={classes.horizontalLine} />
        {/* Kubernetes Conformation Test */}
        <div className={classes.flexRowDisplay}>
          <Typography className={classes.testHeading}>
            <strong>Kubernetes conformance test</strong>
          </Typography>
        </div>
        <div>
          <div>
            <CustomSlider
              value={
                typeof nodeAddTestValue === 'number' ? nodeAddTestValue : 0
              }
              testName="Node add test"
              onChangeCommitted={handleChange}
            />
          </div>
          <div>
            <CustomSlider
              value={
                typeof configMapMultiVolumeTestValue === 'number'
                  ? configMapMultiVolumeTestValue
                  : 0
              }
              testName="Config map multi volume test"
              onChangeCommitted={handleChange1}
            />
          </div>
          <div>
            <CustomSlider
              value={
                typeof networkingPodTestValue === 'number'
                  ? networkingPodTestValue
                  : 0
              }
              testName="Networking pod test"
              onChangeCommitted={handleChange2}
            />
          </div>
          <div>
            <CustomSlider
              value={
                typeof proxyServerTestValue === 'number'
                  ? proxyServerTestValue
                  : 0
              }
              testName="Proxy-service-test"
              onChangeCommitted={handleChange3}
            />
          </div>
        </div>
        <hr className={classes.horizontalLine} />
        {/* Demo Launch Modal */}
        <div className={classes.modalDiv}>
          <div className={classes.flexRowDisplay}>
            <ButtonOutlineIcon
              isDisabled={false}
              handleClick={handleModal}
              data-cy="testRunButton"
            >
              <div className={classes.flexRowDisplay}>
                <img src="icons/video.png" alt="Play icon" />
                <Typography className={classes.buttonOutlineText}>
                  Demo Launch
                </Typography>
              </div>
            </ButtonOutlineIcon>
            <div style={{ marginLeft: 10 }}>
              <InfoTooltip value="Text Default" />
            </div>
            {open === true ? (
              <CustomResultModal
                isOpen={() => setOpen(false)}
                testValue={testValue}
              />
            ) : (
              <div />
            )}
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
  );
};

export default ReliablityScore;
