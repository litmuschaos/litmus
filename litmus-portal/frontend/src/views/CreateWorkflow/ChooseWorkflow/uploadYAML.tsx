import { AccordionDetails, Button, Paper, Typography } from '@material-ui/core';
import localforage from 'localforage';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import YAML from 'yaml';
import useActions from '../../../redux/actions';
import * as WorkflowActions from '../../../redux/actions/workflow';
import { updateEngineName } from '../../../utils/yamlUtils';
import useStyles from './styles';

interface ChooseWorkflowRadio {
  selected: string;
}

const UploadYAML = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [uploadedYAML, setUploadedYAML] = useState('');
  const [fileName, setFileName] = useState<string | null>('');
  const workflowAction = useActions(WorkflowActions);

  const saveToLocalForage = () => {
    const selection: ChooseWorkflowRadio = {
      selected: 'D',
    };
    localforage.setItem('selectedScheduleOption', selection);
    localforage.setItem('hasSetWorkflowData', false);
  };

  // Function to handle when a File is dragged on the upload field
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    Array.from(e.dataTransfer.files)
      .filter(
        (file) =>
          file.name.split('.')[1] === 'yaml' ||
          file.name.split('.')[1] === 'yml'
      )
      .forEach(async (file) => {
        const readFile = await file.text();
        setUploadedYAML(readFile);
        setFileName(file.name);
        const wfmanifest = updateEngineName(YAML.parse(readFile));
        workflowAction.setWorkflowManifest({
          manifest: wfmanifest,
        });
      });
    saveToLocalForage();
  };

  // Function to handle File upload on button click
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const readFile = e.target.files && e.target.files[0];
    setFileName(readFile && readFile.name);
    const extension = readFile?.name.substring(
      readFile.name.lastIndexOf('.') + 1
    );
    if ((extension === 'yaml' || extension === 'yml') && readFile) {
      readFile.text().then((response) => {
        setUploadedYAML(response);
        const wfmanifest = updateEngineName(YAML.parse(response));
        workflowAction.setWorkflowManifest({
          manifest: wfmanifest,
        });
      });
    } else {
      workflowAction.setWorkflowManifest({
        manifest: '',
      });
    }
    saveToLocalForage();
  };
  return (
    <AccordionDetails>
      <Paper
        elevation={3}
        component="div"
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          handleDrag(e);
        }}
        className={classes.uploadYAMLDiv}
      >
        {uploadedYAML === '' ? (
          <div className={classes.uploadYAMLText}>
            <img
              src="./icons/upload-yaml.svg"
              alt="upload yaml"
              className={classes.uploadImage}
            />
            <Typography variant="h6">
              {t('customWorkflow.createWorkflow.drag')}
            </Typography>
            <Typography className={classes.orText}>or</Typography>
            <input
              accept=".yaml"
              style={{ display: 'none' }}
              id="contained-button-file"
              type="file"
              onChange={(e) => {
                handleFileUpload(e);
              }}
            />
            <label htmlFor="contained-button-file">
              <label htmlFor="contained-button-file">
                <Button
                  variant="outlined"
                  className={classes.uploadBtn}
                  component="span"
                >
                  {t('customWorkflow.createWorkflow.uploadFile')}
                </Button>
              </label>
            </label>
          </div>
        ) : (
          <div className={classes.uploadSuccessDiv}>
            <img
              src="./icons/upload-success.svg"
              alt="checkmark"
              className={classes.uploadSuccessImg}
            />
            <Typography className={classes.uploadSuccessText}>
              {t('customWorkflow.createWorkflow.uploadSuccess')} {fileName}
            </Typography>
          </div>
        )}
      </Paper>
    </AccordionDetails>
  );
};
export default UploadYAML;
