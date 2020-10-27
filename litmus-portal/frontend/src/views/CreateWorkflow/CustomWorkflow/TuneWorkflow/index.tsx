import { Typography } from '@material-ui/core';
import React from 'react';
import BackButton from '../../../../components/Button/BackButton';
import ButtonFilled from '../../../../components/Button/ButtonFilled';
import InputField from '../../../../components/InputField';
import useStyles from './styles';
import Scaffold from '../../../../containers/layouts/Scaffold';
import { CustomTextField } from '../CreateWorkflow/styles';
import { history } from '../../../../redux/configureStore';

interface EnvValues {
  name: string;
  value: string;
}

const TuneCustomWorkflow = () => {
  // const userData = useSelector((state: RootState) => state.userData);

  // const hubData = useSelector((state: RootState) => state.publicHubDetails);

  // const workflowDetails = useSelector((state: RootState) => state.workflowData);

  // const workflowAction = useActions(WorkflowActions);

  const classes = useStyles();

  // console.log(workflowDetails.customWorkflow.yamlLink);

  // const [env, setEnv] = useState<EnvValues[]>([]);
  const env: EnvValues[] = [];
  // useEffect(() => {
  // fetch(workflowDetails.customWorkflow.yamlLink)
  //   .then((data) => {
  //     data.text().then((yamlText) => {
  //       const parsedYaml = YAML.parse(yamlText);
  //       setEnv(parsedYaml.spec.definition.env);
  //       console.log(parsedYaml);
  //     });
  //   })
  //   .catch((error) => {
  //     console.error('Error', error);
  //   });
  // }, [workflowDetails.customWorkflow.yamlLink]);

  return (
    <Scaffold>
      <div className={classes.root}>
        <div className={classes.headerDiv}>
          <BackButton isDisabled={false} />
          <Typography variant="h3" gutterBottom>
            Tune the chaos engine
          </Typography>
          <Typography className={classes.headerDesc}>
            Add keys for add experiments
          </Typography>
        </div>
        <div className={classes.workflowDiv}>
          <Typography variant="h4">
            <strong>Experiment information</strong>
          </Typography>
          <div className={classes.workflowInfo}>
            <div className={classes.inputDiv}>
              <Typography variant="h6" style={{ width: 180 }}>
                Experiment name:
              </Typography>
              <InputField
                label="Workflow Name"
                styles={{
                  width: '100%',
                }}
                data-cy="inputWorkflow"
                validationError={false}
                handleChange={() => {}}
                value=""
              />
            </div>
            <div className={classes.inputDiv}>
              <Typography variant="h6" style={{ width: 180 }}>
                Description:
              </Typography>
              <CustomTextField
                label="Description"
                data-cy="inputWorkflow"
                InputProps={{
                  disableUnderline: true,
                  classes: {
                    input: classes.resize,
                  },
                }}
                onChange={() => {}}
                value=""
                multiline
                rows={14}
              />
              {/* </div> */}
            </div>
            <hr />
            <div className={classes.inputDiv}>
              <Typography variant="h6" style={{ maxWidth: 180 }}>
                Sequence:
              </Typography>
              <InputField
                label="Workflow Name"
                styles={{
                  width: '100%',
                }}
                data-cy="inputWorkflow"
                validationError={false}
                handleChange={() => {}}
                value=""
              />
            </div>
          </div>
        </div>
        <hr />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2">
            We have created a chaos engine specification for this experiment.
            You can tune the following variables for the chaos engine.
          </Typography>
          {env.map((data) => (
            <div className={classes.inputDiv}>
              <Typography variant="h6" style={{ minWidth: 180 }}>
                {data.name}
              </Typography>
              <InputField
                label="Value"
                styles={{
                  width: '100%',
                }}
                data-cy="inputWorkflow"
                validationError={false}
                handleChange={() => {}}
                value={data.value}
              />
            </div>
          ))}
        </div>
        <div
          style={{
            width: 200,
            marginLeft: 'auto',
            marginTop: 30,
            marginBottom: 30,
          }}
        >
          <ButtonFilled
            handleClick={() => {
              history.push('/create-workflow/custom/tune');
            }}
            isPrimary
          >
            <div>
              Next
              <img
                alt="next"
                src="/icons/nextArrow.svg"
                className={classes.nextArrow}
              />
            </div>
          </ButtonFilled>
        </div>
      </div>
    </Scaffold>
  );
};

export default TuneCustomWorkflow;
