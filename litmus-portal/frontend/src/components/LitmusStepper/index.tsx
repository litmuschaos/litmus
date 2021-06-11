import { Paper, Step, StepLabel, Stepper, Typography } from '@material-ui/core';
import clsx from 'clsx';
import { ButtonFilled, ButtonOutlined } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../Loader';
import { LitmusStepConnector } from './LitmusStepConnector';
import { LitmusStepIcon } from './LitmusStepIcon';
import { useStyles } from './styles';

interface LitmusStepperProps {
  steps: string[];
  activeStep: number;
  handleBack: () => void;
  handleNext: () => void;
  loader: boolean;
  finishAction: React.ReactNode;
  hideNext?: boolean;
  disableNext?: boolean;
  moreStepperActions?: React.ReactNode;
  finishButtonText?: React.ReactNode;
}

const LitmusStepper: React.FC<LitmusStepperProps> = ({
  steps,
  activeStep,
  handleBack,
  handleNext,
  hideNext,
  loader,
  disableNext,
  moreStepperActions,
  children,
  finishButtonText,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <div className={classes.root}>
      <Stepper
        activeStep={activeStep}
        connector={<LitmusStepConnector />}
        className={classes.stepper}
        alternativeLabel
      >
        {steps.map((label, i) => (
          <Step key={label}>
            {activeStep === i ? (
              <StepLabel StepIconComponent={LitmusStepIcon}>
                <Typography
                  className={clsx(classes.label, classes.activeLabel)}
                >
                  {label}
                </Typography>
              </StepLabel>
            ) : activeStep < i ? (
              <StepLabel StepIconComponent={LitmusStepIcon}>
                <Typography
                  className={clsx(classes.label, classes.completedLabel)}
                >
                  {label}
                </Typography>
              </StepLabel>
            ) : (
              <StepLabel StepIconComponent={LitmusStepIcon}>
                <Typography className={classes.label}>{label}</Typography>
              </StepLabel>
            )}
          </Step>
        ))}
      </Stepper>

      {/* Stepper Content */}
      <Paper elevation={0} className={classes.stepperContent}>
        {children}
      </Paper>

      {/* Stepper Actions */}
      <div className={classes.stepperActions}>
        {activeStep > 0 && (
          <ButtonOutlined onClick={handleBack}>
            <Typography>{t('workflowStepper.back')}</Typography>
          </ButtonOutlined>
        )}
        {moreStepperActions}
        <div className={classes.endAction}>
          {activeStep !== steps.length - 1 ? (
            !hideNext && (
              <ButtonFilled
                onClick={handleNext}
                disabled={disableNext ?? false}
              >
                <Typography>{t('workflowStepper.next')}</Typography>
              </ButtonFilled>
            )
          ) : loader ? (
            <ButtonFilled disabled onClick={handleNext}>
              {finishButtonText || t('workflowStepper.finish')}
              <span style={{ marginLeft: '0.5rem' }} /> <Loader size={20} />
            </ButtonFilled>
          ) : (
            <ButtonFilled onClick={handleNext} disabled={disableNext ?? false}>
              {finishButtonText || (
                <Typography>{t('workflowStepper.finish')}</Typography>
              )}
            </ButtonFilled>
          )}
        </div>
      </div>
    </div>
  );
};

export { LitmusStepper };
