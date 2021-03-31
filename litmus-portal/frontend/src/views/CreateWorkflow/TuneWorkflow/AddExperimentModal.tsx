import {
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from '@material-ui/core';
import { ButtonFilled, ButtonOutlined, Modal } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useStyles, { MenuProps } from './styles';

interface ChartName {
  ChaosName: string;
  ExperimentName: string;
}

interface AddExperimentModalProps {
  addExpModal: boolean;
  onModalClose: () => void;
  hubName: string;
  selectedExp: string;
  onSelectChange: (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => void;
  allExperiments: ChartName[];
  handleDone: () => void;
}

const AddExperimentModal: React.FC<AddExperimentModalProps> = ({
  addExpModal,
  onModalClose,
  hubName,
  selectedExp,
  onSelectChange,
  allExperiments,
  handleDone,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Modal
      open={addExpModal}
      onClose={() => {
        onModalClose();
      }}
      width="55%"
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      modalActions={
        <ButtonOutlined
          className={classes.closeButton}
          onClick={() => {
            onModalClose();
          }}
        >
          &#x2715;
        </ButtonOutlined>
      }
    >
      <div className={classes.addExpModal}>
        <Typography variant="h5">
          <strong>{t('createWorkflow.tuneWorkflow.choose')}</strong>
        </Typography>
        <Typography>
          {t('createWorkflow.tuneWorkflow.selectAvailableExp')} {hubName} .{' '}
          {t('createWorkflow.tuneWorkflow.afterSelect')}
        </Typography>
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel id="demo-simple-select-label" className={classes.label}>
            {t('createWorkflow.tuneWorkflow.selectExp')}
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            value={selectedExp}
            onChange={onSelectChange}
            label="Cluster Status"
            MenuProps={MenuProps}
            input={<OutlinedInput labelWidth={150} />}
          >
            {allExperiments.map((exp: ChartName) => (
              <MenuItem
                key={`${exp.ChaosName}/${exp.ExperimentName}`}
                value={`${exp.ChaosName}/${exp.ExperimentName}`}
              >
                {exp.ChaosName}/{exp.ExperimentName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <ButtonFilled
          onClick={() => {
            handleDone();
          }}
          className={classes.doneBtn}
        >
          {t('createWorkflow.tuneWorkflow.done')}
        </ButtonFilled>
      </div>
    </Modal>
  );
};

export default AddExperimentModal;
