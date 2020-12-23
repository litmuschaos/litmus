import React from 'react';
import Scaffold from '../../containers/layouts/Scaffold';
import CreateWorkflow from '../../views/CreateWorkflow/CustomWorkflow/CreateWorkflow';
import ScheduleCustomWorkflow from '../../views/CreateWorkflow/CustomWorkflow/ScheduleWorkflow';
import TuneCustomWorkflow from '../../views/CreateWorkflow/CustomWorkflow/TuneWorkflow';
import ExperimentEditor from '../../views/CreateWorkflow/CustomWorkflow/YamlEditor';
import useStyles from './styles';

function getStepContent(
  stepIndex: number,
  gotoStep: (page: number) => void
): React.ReactNode {
  switch (stepIndex) {
    case 0:
      return <CreateWorkflow gotoStep={gotoStep} />;
    case 1:
      return <TuneCustomWorkflow gotoStep={gotoStep} />;
    case 2:
      return <ScheduleCustomWorkflow gotoStep={gotoStep} />;
    case 3:
      return <ExperimentEditor gotoStep={gotoStep} />;
    default:
      return <CreateWorkflow gotoStep={gotoStep} />;
  }
}
const CreateCustomWorkflow = () => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const gotoStep = (page: number) => {
    setActiveStep(page);
  };
  return (
    <Scaffold>
      <div className={classes.root}>{getStepContent(activeStep, gotoStep)}</div>
    </Scaffold>
  );
};
export default CreateCustomWorkflow;
