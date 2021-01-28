import React from 'react';
import { useTranslation } from 'react-i18next';
import { InputField } from 'kubera-ui';
import useStyles from './styles';
import {
  isValidWebUrl,
  validateStartEmptySpacing,
} from '../../../utils/validate';

interface MyHubInputProps {
  gitURL: string;
  setGitURL: (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void;
  gitBranch: string;
  setGitBranch: (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void;
}

const MyHubInput: React.FC<MyHubInputProps> = ({
  gitURL,
  gitBranch,
  setGitBranch,
  setGitURL,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <>
      <div>
        <InputField
          label="Git URL"
          value={gitURL}
          helperText={!isValidWebUrl(gitURL) ? t('myhub.validURL') : ''}
          variant={!isValidWebUrl(gitURL) ? 'error' : 'primary'}
          required
          onChange={setGitURL}
          className={classes.inputField}
        />
      </div>
      <div>
        <InputField
          label="Branch"
          value={gitBranch}
          helperText={
            validateStartEmptySpacing(gitBranch)
              ? t('myhub.validationEmptySpace')
              : ''
          }
          variant={validateStartEmptySpacing(gitBranch) ? 'error' : 'primary'}
          required
          onChange={setGitBranch}
          className={classes.inputFieldBranch}
        />
      </div>
    </>
  );
};

export default MyHubInput;
