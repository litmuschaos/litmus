import { useMutation } from '@apollo/client';
import { IconButton, Snackbar, Typography } from '@material-ui/core';
import CheckOutlinedIcon from '@material-ui/icons/CheckOutlined';
import { ButtonFilled, InputField } from 'litmus-ui';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import { Alert } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import YamlEditor from '../../../components/YamlEditor/Editor';
import { ADD_WORKFLOW_TEMPLATE } from '../../../graphql';
import { RootState } from '../../../redux/reducers';
import useStyles from './styles';
import { getProjectID } from '../../../utils/getSearchParams';
import Loader from '../../../components/Loader';
import { constants } from '../../../constants';
import { validateWorkflowName } from '../../../utils/validate';

interface SaveTemplateModalProps {
  closeTemplate: () => void;
  isCustomWorkflow: boolean;
}

interface CloneTemplateResult {
  type: string;
  message: string;
}

const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
  closeTemplate,
  isCustomWorkflow,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [templateName, setTemplateName] = useState<string>('');
  const [templateDesc, setTemplateDesc] = useState<string>('');
  const manifest: string = useSelector(
    (state: RootState) => state.workflowManifest.manifest
  );
  const [editManifest, setEditManifest] = useState(manifest);
  const [yamlValid, setYamlValid] = useState(true);
  const [displayResult, setDisplayResult] = useState<boolean>(false);
  const [cloneResult, setCloneResult] = useState<CloneTemplateResult>({
    type: '',
    message: '',
  });
  const [addWorkflowTemplate, { loading }] = useMutation(
    ADD_WORKFLOW_TEMPLATE,
    {
      variables: {
        data: {
          manifest: YAML.stringify(editManifest),
          template_name: templateName,
          template_description: templateDesc,
          project_id: getProjectID(),
          isCustomWorkflow,
        },
      },
      onError: (data) => {
        setDisplayResult(true);
        setCloneResult({
          type: constants.error,
          message: data.message,
        });
      },
      onCompleted: () => {
        setDisplayResult(true);
        setCloneResult({
          type: constants.success,
          message: `${t('chaosWorkflows.browseSchedules.savedSuccessfully')}`,
        });
      },
    }
  );

  const handleAlertOnClose = () => {
    setDisplayResult(false);
    if (cloneResult.type === constants.success) closeTemplate();
  };

  return (
    <div className={classes.saveTemplateRoot}>
      <Typography className={classes.SaveTemplateTxt}>
        {t('chaosWorkflows.browseSchedules.saveTemplate')}
      </Typography>
      <Typography className={classes.NoteTxt}>
        {t('chaosWorkflows.browseSchedules.updateEngine')}
      </Typography>
      <InputField
        label="Name of the template"
        value={templateName}
        data-cy="WorkflowName"
        required
        onChange={(e) => setTemplateName(e.target.value.toLowerCase())}
        helperText={
          validateWorkflowName(templateName)
            ? t('createWorkflow.chooseWorkflow.validate')
            : ''
        }
        variant={validateWorkflowName(templateName) ? 'error' : 'primary'}
        className={classes.InputFieldTemplate}
      />
      <br />
      <InputField
        label="Description of the template"
        value={templateDesc}
        data-cy="WorkflowDescription"
        helperText=""
        required
        onChange={(e) => setTemplateDesc(e.target.value)}
        className={classes.InputFieldTemplate}
      />
      <br />
      <div className={classes.editor}>
        <YamlEditor
          content={editManifest}
          filename="Workflow Template"
          readOnly={false}
          setButtonState={(btnState: boolean) => {
            setYamlValid(btnState);
          }}
          saveWorkflowChange={(updatedManifest: string) => {
            setEditManifest(updatedManifest);
          }}
        />
      </div>
      <div className={classes.footerTemplateDiv}>
        <div className={classes.templateButtonsDiv}>
          <IconButton onClick={closeTemplate} className={classes.cancelIcon}>
            {t('chaosWorkflows.browseSchedules.cancel')}
          </IconButton>
          <ButtonFilled
            data-cy="saveTemplateButton"
            onClick={() => {
              addWorkflowTemplate();
            }}
            disabled={
              loading ||
              cloneResult.type === constants.success ||
              templateName.trim().length === 0 ||
              templateDesc.trim().length === 0 ||
              validateWorkflowName(templateName) ||
              !yamlValid
            }
          >
            {loading ? (
              <Loader size={20} />
            ) : (
              <>
                <CheckOutlinedIcon />
                <Typography className={classes.saveButtonTemplate}>
                  {t('chaosWorkflows.browseSchedules.saveChanges')}
                </Typography>
              </>
            )}
          </ButtonFilled>
        </div>
      </div>
      <Snackbar
        open={displayResult}
        autoHideDuration={6000}
        onClose={handleAlertOnClose}
        data-cy="templateAlert"
      >
        <Alert
          onClose={handleAlertOnClose}
          severity={cloneResult.type === constants.error ? 'error' : 'success'}
        >
          {cloneResult.message}
        </Alert>
      </Snackbar>
    </div>
  );
};
export default SaveTemplateModal;
