import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { ButtonFilled, ButtonOutlined, Modal } from 'litmus-ui';
import CreateIcon from '@material-ui/icons/Create';
import React from 'react';
import { GitOpsDetail } from '../../../models/graphql/gitOps';
import useStyles from './styles';

interface GitOpsInfoProps {
  data: GitOpsDetail | undefined;
  onEditClicked: () => void;
  modalState: boolean;
  onModalClick: () => void;
  onModalCancel: () => void;
}

const GitOpsInfo: React.FC<GitOpsInfoProps> = ({
  data,
  onEditClicked,
  modalState,
  onModalClick,
  onModalCancel,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <div className={classes.gitInfo} data-cy="gitopsInfoBox">
      <Typography className={classes.branchText}>
        <strong>{data?.getGitOpsDetails.Branch}</strong>
      </Typography>
      <Typography className={classes.branch}>
        {t('settings.gitopsTab.branch')}
      </Typography>
      <Typography className={classes.repoURLText}>
        <strong> {data?.getGitOpsDetails.RepoURL}</strong>
      </Typography>
      <Typography className={classes.gitURL}>
        {' '}
        {t('settings.gitopsTab.URL')}
      </Typography>
      <ButtonOutlined
        className={classes.editBtn}
        onClick={() => {
          onEditClicked();
        }}
      >
        <div style={{ display: 'flex' }}>
          <CreateIcon className={classes.createIcon} />
          <Typography className={classes.editText}>
            {t('settings.gitopsTab.edit')}
          </Typography>
        </div>
      </ButtonOutlined>
      <Modal
        open={modalState}
        onClose={() => {
          onModalCancel();
        }}
        width="60%"
        modalActions={
          <ButtonOutlined
            onClick={() => {
              onModalCancel();
            }}
          >
            &#x2715;
          </ButtonOutlined>
        }
      >
        <div className={classes.modalDiv}>
          <Typography className={classes.editHeader}>
            {t('settings.gitopsTab.editHeader')}
          </Typography>
          <Typography className={classes.editDescription}>
            {t('settings.gitopsTab.editDescription')}
          </Typography>
          <div>
            <ButtonOutlined
              className={classes.cancelBtn}
              onClick={() => {
                onModalCancel();
              }}
            >
              {t('settings.gitopsTab.cancel')}
            </ButtonOutlined>
            <ButtonFilled
              onClick={() => {
                onModalClick();
              }}
            >
              {t('settings.gitopsTab.proceed')}
            </ButtonFilled>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GitOpsInfo;
