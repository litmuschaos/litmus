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
import useStyles, { MenuProps } from './styles';

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
  allExperiments: any;
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
          <strong>Choose Experiments</strong>
        </Typography>
        <Typography>
          Select experiments available in {hubName} . After selecting you can
          fine tune them.
        </Typography>
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel id="demo-simple-select-label" className={classes.label}>
            Select An Experiment
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            value={selectedExp}
            onChange={onSelectChange}
            label="Cluster Status"
            MenuProps={MenuProps}
            input={<OutlinedInput labelWidth={150} />}
          >
            {allExperiments.map((exp: any) => (
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
          Done
        </ButtonFilled>
      </div>
    </Modal>
  );
};

export default AddExperimentModal;
