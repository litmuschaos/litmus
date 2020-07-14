import React from 'react';
import clsx from 'clsx';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { StepIconProps } from '@material-ui/core/StepIcon';
import GeoChart from './countryMap';
import CityMap from './cityMap';
import Center from '../../containers/layouts/Center';
function QontoStepIcon(props: StepIconProps) {
  const { active, completed } = props;

  return (
    <div>
      {completed ? (
        <div />
      ) : (
        <div />
      )}
    </div>
  );
}

function getSteps() {
  return ['', ''];
}

function getStepContent(step: number) {
  switch (step) {
    case 0:
      return <CityMap />; 
    case 1:
      return <GeoChart />;
    default:
      return (
        <Center>
          <span style={{ height: '100px' }}>hello I&#39;m centered</span>
        </Center>
      );
  }
}

const GeoMap=()=> {
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };
  /* Reset is used to reset the steps and further can be used */
  /* to route but keep handlereset */
  return (
    <div>
      <div>
        {activeStep === steps.length - 1 ? (
          <div>
            <Typography>{getStepContent(activeStep)}</Typography>
            <div>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleReset}
                data-cy="selectProjectFinish"
              >
                City Wise Users
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <Typography>{getStepContent(activeStep)}</Typography>
            <div>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleNext}
                data-cy="Welcome-continue"
              >
                {activeStep === steps.length ? "City Wise Users" : 'Country Wise Users'}
              </Button>
            </div>
          </div>
        )}
      </div>
      <div >
        <Stepper
          alternativeLabel
          activeStep={activeStep}
          data-cy="Welcome-stepper"
        >
        </Stepper>
      </div>
    </div>
  );
}
export default GeoMap;
