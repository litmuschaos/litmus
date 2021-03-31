import React, { useState } from 'react';
import Center from '../../containers/layouts/Center';
import PasswordSet from '../../views/GetStarted/PasswordSet';
import ProjectSet from '../../views/GetStarted/ProjectSet';
import useStyles from './styles';

const GetStarted: React.FC = () => {
  const classes = useStyles();
  const [step, setStep] = useState<number>(1);
  const [password, setPassword] = useState<string>('');
  const handlePassword = (e: any) => {
    setPassword(e.target.value);
  };

  return (
    <div className={classes.rootContainer}>
      <Center>
        {step === 1 ? (
          <PasswordSet
            setPassword={handlePassword}
            currentStep={1}
            totalStep={2}
            handleNext={() => setStep(step + 1)}
          />
        ) : (
          <ProjectSet currentStep={2} totalStep={2} password={password} />
        )}
      </Center>
    </div>
  );
};

export default GetStarted;
