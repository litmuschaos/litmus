import { useMutation } from '@apollo/client/react/hooks';
import MobileStepper from '@material-ui/core/MobileStepper';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ButtonFilled from '../Button/ButtonFilled';
import config from '../../config';
import { CREATE_USER } from '../../graphql';
import { RootState } from '../../redux/reducers';
import InputField from '../InputField';
import ModalPage from './Modalpage';
import useStyles from './styles';
import ButtonOutline from '../Button/ButtonOutline';

interface CStepperProps {
  handleModal: () => void;
}
const CStepper: React.FC<CStepperProps> = ({ handleModal }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { userData } = useSelector((state: RootState) => state);
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const [formError, setFormError] = React.useState<boolean>(false);

  const [info, setInfo] = React.useState({
    email: '',
    name: '',
    projectName: '',
  });

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const [values, setValues] = React.useState({
    password: '',
    confirmPassword: '',
  });

  const handleNext = () => {
    if (activeStep === 2 && values.confirmPassword !== values.password) {
      setFormError(true);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  const rerender = () => {
    window.location.reload();
  };

  const [CreateUser] = useMutation(CREATE_USER, {
    onCompleted: () => {
      rerender();
    },
  });

  // Submit entered data to /update endpoint
  const handleSubmit = () => {
    Object.assign(info, { password: values.password });

    fetch(`${config.auth.url}/update/details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userData.token}`,
      },
      body: JSON.stringify(info),
    })
      .then((response) => response.json())
      .then((data) => {
        if ('error' in data) {
          setFormError(true);
        } else {
          CreateUser({
            variables: {
              user: {
                username: userData.username,
                email: info.email,
                name: info.name,
                project_name: info.projectName,
              },
            },
          });
        }
      })
      .catch((err) => {
        setFormError(true);
        console.error(err);
      });

    handleModal();
  };

  const setData = (key: string, value: string) => {
    let data = info;
    data = {
      ...data,
      [key]: value,
    };
    setInfo(data);
  };

  // Render buttons based on active step
  const selectiveButtons = () => {
    if (activeStep === 0) {
      return (
        <div className={classes.buttonDiv} data-cy="Continue">
          <ButtonFilled isPrimary handleClick={handleNext}>
            <div>{t('welcomeModel.button.continue')}</div>
          </ButtonFilled>
        </div>
      );
    }
    if (activeStep === 3) {
      return (
        <div className={classes.buttonDiv}>
          <ButtonOutline
            isDisabled={false}
            handleClick={handleBack}
            data-cy="Skip"
          >
            <>{t('welcomeModel.button.skip')}</>
          </ButtonOutline>
          <ButtonFilled isPrimary handleClick={handleSubmit} data-cy="Start">
            <div>{t('welcomeModel.button.letsStart')}</div>
          </ButtonFilled>
        </div>
      );
    }
    return (
      <div className={classes.buttonDiv}>
        <ButtonOutline
          isDisabled={false}
          handleClick={handleBack}
          data-cy="Back"
        >
          <>{t('welcomeModel.button.back')}</>
        </ButtonOutline>
        <ButtonFilled isPrimary handleClick={handleNext} data-cy="Continue">
          <div>{t('welcomeModel.button.continue')}</div>
        </ButtonFilled>
      </div>
    );
  };

  // Content of the steps based on active step count
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <ModalPage
            renderMenu={
              <div>
                <div className={classes.inputArea} data-cy="InputProjectName">
                  <InputField
                    label={t('welcomeModel.case-0.label')}
                    name={t('welcomeModel.case-0.name')}
                    value={info.projectName}
                    required
                    formError={formError}
                    handleChange={(event) => {
                      setData('projectName', event.target.value);
                    }}
                  />
                </div>
                {selectiveButtons()}
              </div>
            }
            setName={userData.name}
            setText={t('welcomeModel.case-0.info')}
          />
        );
      case 1:
        return (
          <ModalPage
            renderMenu={
              <div>
                <div className={classes.inputArea} data-cy="InputName">
                  <InputField
                    label={t('welcomeModel.case-1.label')}
                    name={t('welcomeModel.case-1.name')}
                    value={info.name}
                    formError={formError}
                    required
                    handleChange={(event) => {
                      setData('name', event.target.value);
                    }}
                  />
                </div>
                {selectiveButtons()}
              </div>
            }
            setName={info.name}
            setText={t('welcomeModel.case-1.info')}
          />
        );
      case 2:
        return (
          <ModalPage
            renderMenu={
              <div
                className={classes.passwordSetterDiv}
                data-cy="InputPassword"
              >
                <div className={classes.passwordArea}>
                  <InputField
                    label={t('welcomeModel.case-2.label')}
                    name={t('welcomeModel.case-2.name')}
                    password
                    formError={formError}
                    required
                    value={values.password}
                    handleChange={(event) =>
                      setValues({
                        password: event.target.value,
                        confirmPassword: values.confirmPassword,
                      })
                    }
                  />
                </div>
                <div className={classes.passwordArea}>
                  <InputField
                    label={t('welcomeModel.case-2.cnfLabel')}
                    name={t('welcomeModel.case-2.cnfName')}
                    password
                    formError={values.confirmPassword !== values.password}
                    required
                    value={values.confirmPassword}
                    handleChange={(event) =>
                      setValues({
                        password: values.password,
                        confirmPassword: event.target.value,
                      })
                    }
                  />
                </div>
                {selectiveButtons()}
              </div>
            }
            setName={info.name}
            setText={t('welcomeModel.case-2.info')}
          />
        );
      case 3:
        return (
          <ModalPage
            renderMenu={
              <div>
                <div className={classes.inputArea} data-cy="InputEmail">
                  <InputField
                    label={t('welcomeModel.case-3.label')}
                    name={t('welcomeModel.case-3.name')}
                    formError={formError}
                    required
                    value={info.email}
                    handleChange={(event) => {
                      setData('email', event.target.value);
                    }}
                  />
                </div>
                {selectiveButtons()}
              </div>
            }
            // pass here corresponding name of user
            setName={info.name}
            setText={t('welcomeModel.case-3.info')}
          />
        );
      default:
        return <Link to="/404" />;
    }
  };

  /*
    The Stepper which can modify modal content
    based on active step
  */
  return (
    <div>
      <div>
        {activeStep === 3 ? (
          <div>{getStepContent(activeStep)}</div>
        ) : (
          <div>{getStepContent(activeStep)}</div>
        )}
      </div>
      <div className={classes.stepper}>
        <MobileStepper
          variant="dots"
          steps={4}
          position="static"
          activeStep={activeStep}
          nextButton={handleNext}
          backButton={handleBack}
        />
      </div>
    </div>
  );
};

export default CStepper;
