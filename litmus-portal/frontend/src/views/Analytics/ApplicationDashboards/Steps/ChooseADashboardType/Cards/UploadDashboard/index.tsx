/* eslint-disable jsx-a11y/label-has-associated-control */
import { Button, Paper, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApplicationDashboard } from '../../../../../../../models/redux/dashboards';
import useActions from '../../../../../../../redux/actions';
import * as DashboardActions from '../../../../../../../redux/actions/dashboards';
import useStyles from './styles';

interface UploadJSONProps {
  successHandler: () => void;
  errorHandler: () => void;
}
const UploadJSON: React.FC<UploadJSONProps> = ({
  successHandler,
  errorHandler,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [uploadedJSON, setUploadedJSON] = useState('');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState<string | null>('');
  const dashboard = useActions(DashboardActions);

  // Function to handle when a File is dragged on the upload field
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    Array.from(e.dataTransfer.files)
      .filter((file) => file.name.split('.')[1] === 'json')
      .forEach(async (file) => {
        const readFile = await file.text();
        setUploadedJSON(readFile);
        setFileName(file.name);
        try {
          const parsedDashboard: ApplicationDashboard = JSON.parse(readFile);
          dashboard.selectDashboard({
            selectedDashboardID: 'upload',
            dashboardJSON: parsedDashboard,
          });
          if (
            parsedDashboard.panelGroups[0].panels[0].prom_queries[0]
              .prom_query_name
          ) {
            successHandler();
          } else {
            throw new Error('Invalid dashboard.');
          }
        } catch (err) {
          setError((err as any).toString());
          errorHandler();
        }
      });
  };

  // Function to handle File upload on button click
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const readFile = e.target.files && e.target.files[0];
    setFileName(readFile && readFile.name);
    const extension = readFile?.name.substring(
      readFile.name.lastIndexOf('.') + 1
    );
    if (extension === 'json' && readFile) {
      readFile.text().then((response) => {
        setUploadedJSON(response);
        try {
          const parsedDashboard: ApplicationDashboard = JSON.parse(response);
          dashboard.selectDashboard({
            selectedDashboardID: 'upload',
            dashboardJSON: parsedDashboard,
          });
          if (
            parsedDashboard.panelGroups[0].panels[0].prom_queries[0]
              .prom_query_name
          ) {
            successHandler();
          } else {
            throw new Error('Invalid dashboard.');
          }
        } catch (err) {
          setError((err as any).toString());
          errorHandler();
        }
      });
    }
  };

  return (
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
      className={classes.uploadJSONDiv}
    >
      {uploadedJSON === '' || error !== '' ? (
        <div className={classes.uploadJSONText}>
          <img
            src="/icons/upload-dashboard.svg"
            alt="upload json"
            className={classes.uploadImage}
          />
          <Typography variant="h6">
            {t(
              'analyticsDashboard.applicationDashboards.chooseADashboardType.uploadModal.option1'
            )}
          </Typography>
          <Typography className={classes.orText}>
            {t(
              'analyticsDashboard.applicationDashboards.chooseADashboardType.uploadModal.or'
            )}
          </Typography>
          <input
            accept=".json"
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
                {t(
                  'analyticsDashboard.applicationDashboards.chooseADashboardType.uploadModal.option2'
                )}
              </Button>
            </label>
          </label>
        </div>
      ) : (
        <div className={classes.uploadSuccessDiv}>
          <img
            src="/icons/upload-success.svg"
            alt="checkmark"
            className={classes.uploadSuccessImg}
          />
          <Typography className={classes.uploadSuccessText}>
            {t(
              'analyticsDashboard.applicationDashboards.chooseADashboardType.uploadModal.successMessage'
            )}{' '}
            {fileName}
          </Typography>
        </div>
      )}
    </Paper>
  );
};
export default UploadJSON;
