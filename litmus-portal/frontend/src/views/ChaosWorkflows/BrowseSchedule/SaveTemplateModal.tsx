import { IconButton, Typography } from '@material-ui/core';
import CheckOutlinedIcon from '@material-ui/icons/CheckOutlined';
import { ButtonFilled, InputField } from 'litmus-ui';
import React, { useState } from 'react';
import useStyles from './styles';

const SaveTemplateModal: React.FC = () => {
  const classes = useStyles();
  const [chaosEngineName, setChaosEngineName] = useState<string>('');
  return (
    <div className={classes.saveTemplateRoot}>
      <Typography className={classes.SaveTemplateTxt}>Save Template</Typography>
      <Typography className={classes.NoteTxt}>
        Note: Make sure to update the chaos engine names
      </Typography>
      <InputField
        label="Name of the template"
        value={chaosEngineName}
        helperText=""
        required
        onChange={(e) => setChaosEngineName(e.target.value)}
        className={classes.InputFieldTemplate}
      />
      {/*  <YamlEditor
        content={isCustomWorkflow ? YAML.stringify(generatedYAML) : manifest}
        filename={workflow.name}
        readOnly={false}
      /> */}
      <div className={classes.footerTemplateDiv}>
        <div className={classes.errorTemplateDiv}>
          <img src="./icons/errorYaml.svg" alt="error yaml" />
          <Typography className={classes.errorYamlText}>
            Error in YAML file
          </Typography>
        </div>
        <div className={classes.templateButtonsDiv}>
          <IconButton onClick={() => {}} className={classes.cancelIcon}>
            Cancel
          </IconButton>
          <ButtonFilled onClick={() => {}}>
            <CheckOutlinedIcon />
            <Typography className={classes.saveButtonTemplate}>
              Save Changes
            </Typography>
          </ButtonFilled>
        </div>
      </div>
    </div>
  );
};
export default SaveTemplateModal;
