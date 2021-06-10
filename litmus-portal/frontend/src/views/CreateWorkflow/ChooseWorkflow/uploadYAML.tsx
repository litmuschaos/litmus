import { AccordionDetails, Button, Paper, Typography } from '@material-ui/core';
import { ButtonFilled } from 'litmus-ui';
import localforage from 'localforage';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import useActions from '../../../redux/actions';
import * as WorkflowActions from '../../../redux/actions/workflow';
import { RootState } from '../../../redux/reducers';
import { updateEngineName, updateNamespace } from '../../../utils/yamlUtils';
import useStyles from './styles';

interface ChooseWorkflowRadio {
  selected: string;
}

const UploadYAML = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [uploadedYAML, setUploadedYAML] = useState('');
  const [fileName, setFileName] = useState<string | null>('');
  const [uploadError, setUploadError] = useState(false);
  const workflowAction = useActions(WorkflowActions);
  const { namespace } = useSelector((state: RootState) => state.workflowData);

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
        try {
          setUploadError(false);
          const wfmanifest = updateEngineName(YAML.parse(readFile));
          const updatedManifest = updateNamespace(wfmanifest, namespace);
          workflowAction.setWorkflowManifest({
            manifest: YAML.stringify(updatedManifest),
          });
        } catch {
          setUploadError(true);
          workflowAction.setWorkflowManifest({
            manifest: '',
          });
        }
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
        try {
          setUploadError(false);
          const wfmanifest = updateEngineName(YAML.parse(response));
          const updatedManifest = updateNamespace(wfmanifest, namespace);
          workflowAction.setWorkflowManifest({
            manifest: YAML.stringify(updatedManifest),
          });
        } catch {
          setUploadError(true);
          workflowAction.setWorkflowManifest({
            manifest: '',
          });
        }
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
        {uploadError ? (
          <div className={classes.uploadSuccessDiv}>
            <img
              src="./icons/error-upload.svg"
              alt="upload error"
              width="20"
              height="20"
            />
            <Typography className={classes.errorText}>
              {t('customWorkflow.createWorkflow.errorUpload')}
            </Typography>
            <ButtonFilled
              className={classes.errorBtn}
              onClick={() => {
                setUploadedYAML('');
                setUploadError(false);
              }}
            >
              <img src="./icons/retry.svg" alt="Retry" />
              <Typography className={classes.retryText}>
                {t('customWorkflow.createWorkflow.retryUpload')}
              </Typography>
            </ButtonFilled>
          </div>
        ) : uploadedYAML === '' ? (
          <div className={classes.uploadYAMLText} data-cy="uploadYAMLInput">
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
