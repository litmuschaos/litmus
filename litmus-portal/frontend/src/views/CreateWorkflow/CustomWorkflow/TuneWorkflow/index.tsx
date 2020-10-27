import { Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import YAML from 'yaml';
import BackButton from '../../../../components/Button/BackButton';
import ButtonFilled from '../../../../components/Button/ButtonFilled';
import InputField from '../../../../components/InputField';
import useStyles from './styles';
import Scaffold from '../../../../containers/layouts/Scaffold';
import { CustomTextField } from '../CreateWorkflow/styles';

interface EnvValues {
  name: string;
  value: string;
}

// interface experimentDetails{
//   HubName:string,
//   ExperimentName:string;
//   yamlLink:string;
//   yaml?:string;
// }

// interface WorkflowDataType {
//   WorkflowName: string;
//   WorkflowDesc: string,
//   experimentDetails: experimentDetails[];
// }

const TuneCustomWorkflow = () => {
  const classes = useStyles();

  const [overrideEnvs, setOverrideEnvs] = useState<EnvValues[]>([
    { name: '', value: '' },
  ]);

  const [yaml, setYaml] = useState<string>('');

  const changeKey = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    overrideEnvs[index].name = event.target.value;
    setOverrideEnvs([...overrideEnvs]);
  };

  const changeValue = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    overrideEnvs[index].value = event.target.value;
    setOverrideEnvs([...overrideEnvs]);
  };

  const AddEnvPair = () => {
    setOverrideEnvs([...overrideEnvs, { name: '', value: '' }]);
  };

  const [env, setEnv] = useState<EnvValues[]>([]);

  const handleEnvModification = () => {
    const newEnvs: EnvValues[] = [];
    const hashEnv = new Map();
    env.forEach((envPair, index) => {
      if (env[index + 1]) {
        hashEnv.set(envPair.name, envPair.value);
      }
    });
    overrideEnvs.forEach((envPair) => {
      if (hashEnv.has(envPair.name)) {
        hashEnv.delete(envPair.name);
        hashEnv.set(envPair.name, envPair.value);
      } else {
        hashEnv.set(envPair.name, envPair.value);
      }
    });

    hashEnv.forEach((value, key) => {
      newEnvs.push({ name: key, value });
    });
    const parsedYaml = YAML.parse(yaml);
    parsedYaml.spec.definition.env = newEnvs;
    const stringifiedYaml = YAML.stringify(parsedYaml);
    setYaml(stringifiedYaml);
    const WorkflowData = JSON.parse(
      window.localStorage.getItem('WorkflowData') as string
    );
    WorkflowData.experimentDetails[0].yaml = yaml;
    window.localStorage.setItem('WorkflowData', JSON.stringify(WorkflowData));
  };

  useEffect(() => {
    if (env.length === 0) {
      const WorkflowData = JSON.parse(
        window.localStorage.getItem('WorkflowData') as string
      );
      fetch(WorkflowData?.experimentDetails[0].yamlLink)
        .then((data) => {
          data.text().then((yamlText) => {
            const parsedYaml = YAML.parse(yamlText);
            setEnv([...parsedYaml.spec.definition.env]);
            setYaml(YAML.stringify(parsedYaml));
          });
        })
        .catch((error) => {
          console.error('Error', error);
        });
    }
  }, []);

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
              <Typography variant="h6" style={{ width: '20%' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2">
            To change the variables in chaos experiment specific to this
            workflow, you can override them at the chaos engine.
          </Typography>
          {overrideEnvs.map((data, index) => (
            <div className={classes.inputDiv}>
              <InputField
                label="Key"
                styles={{
                  width: '20%',
                }}
                data-cy="inputWorkflow"
                validationError={false}
                handleChange={(event) => changeKey(index, event)}
                value={data.name}
              />
              <InputField
                label="Value"
                styles={{
                  width: '100%',
                }}
                data-cy="inputWorkflow"
                validationError={false}
                handleChange={(event) => changeValue(index, event)}
                value={data.value}
              />
              {overrideEnvs[index + 1] ? null : (
                <div
                  style={{
                    width: 200,
                    marginLeft: 20,
                    marginTop: 30,
                    marginBottom: 30,
                  }}
                >
                  <ButtonFilled
                    handleClick={() => {
                      AddEnvPair();
                    }}
                    isPrimary={false}
                  >
                    Add Key
                  </ButtonFilled>
                </div>
              )}
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
              // history.push('/create-workflow/custom/tune');
              handleEnvModification();
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
