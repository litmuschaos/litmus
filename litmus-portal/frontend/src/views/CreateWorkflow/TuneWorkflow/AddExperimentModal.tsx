import { RadioGroup, Typography, useTheme } from '@material-ui/core';
import {
  ButtonFilled,
  ButtonOutlined,
  LitmusCard,
  Modal,
  RadioButton,
  Search,
} from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../../components/Loader';
import useStyles from './styles';

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
  doneLoader: boolean;
}

const AddExperimentModal: React.FC<AddExperimentModalProps> = ({
  addExpModal,
  onModalClose,
  hubName,
  selectedExp,
  onSelectChange,
  allExperiments,
  handleDone,
  doneLoader,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { palette } = useTheme();
  const [search, setSearch] = useState<string | null>(null);

  const filteredExperiments = allExperiments.filter((exp: ChartName) => {
    if (search === null) return exp;
    if (
      exp.ChaosName.toLowerCase().includes(search.toLowerCase()) ||
      exp.ExperimentName.toLowerCase().includes(search.toLowerCase())
    )
      return exp;
    return null;
  });

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
        <br />
        <div data-cy="addExperimentSearch">
          <Search
            id="input-with-icon-textfield"
            placeholder="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <br />
        <div className={classes.radioList}>
          <RadioGroup
            data-cy="ExperimentList"
            value={selectedExp}
            onChange={onSelectChange}
          >
            {filteredExperiments.map((exp: ChartName) => (
              <LitmusCard
                width="100%"
                height="5rem"
                key={`${exp.ChaosName}/${exp.ExperimentName}`}
                borderColor={
                  selectedExp === `${exp.ChaosName}/${exp.ExperimentName}`
                    ? palette.primary.main
                    : palette.border.main
                }
                className={classes.experimentCard}
              >
                <RadioButton value={`${exp.ChaosName}/${exp.ExperimentName}`}>
                  <div id="body">
                    <Typography className={classes.experimentName}>
                      {exp.ChaosName}/{exp.ExperimentName}
                    </Typography>
                  </div>
                </RadioButton>
              </LitmusCard>
            ))}
          </RadioGroup>
        </div>
        <ButtonFilled
          onClick={() => {
            handleDone();
          }}
          data-cy="AddExperimentDoneButton"
          className={classes.doneBtn}
          disabled={doneLoader}
        >
          {doneLoader ? (
            <Loader size={20} />
          ) : (
            t('createWorkflow.tuneWorkflow.done')
          )}
        </ButtonFilled>
      </div>
    </Modal>
  );
};

export default AddExperimentModal;
