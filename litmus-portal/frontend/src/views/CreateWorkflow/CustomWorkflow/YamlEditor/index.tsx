import { Typography } from '@material-ui/core';
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import BackButton from '../BackButton';
import YamlEditor from '../../../../components/YamlEditor/Editor';
import { WorkflowData } from '../../../../models/redux/workflow';
import { RootState } from '../../../../redux/reducers';
import useStyles from './styles';

interface ExperimentEditorProps {
  gotoStep: (page: number) => void;
}

const ExperimentEditor: React.FC<ExperimentEditorProps> = ({ gotoStep }) => {
  const classes = useStyles();

  const workflowData: WorkflowData = useSelector(
    (state: RootState) => state.workflowData
  );
  const { t } = useTranslation();
  const { customWorkflow, description } = workflowData;

  return (
    <div className={classes.root}>
      <div className={classes.tuneDiv}>
        <BackButton isDisabled={false} onClick={() => gotoStep(2)} />
        <Typography className={classes.headerText} variant="h4">
          {customWorkflow.experiment_name}
        </Typography>
        <Typography className={classes.heading}>
          <strong>{t('customWorkflow.viewYAML.view')}:</strong>
        </Typography>
      </div>

      <div className={classes.editorfix}>
        <YamlEditor
          content={customWorkflow.yaml as string}
          filename={customWorkflow.experiment_name as string}
          yamlLink={customWorkflow.yamlLink as string}
          id="1"
          description={description}
          readOnly
        />
      </div>
    </div>
  );
};

export default ExperimentEditor;
