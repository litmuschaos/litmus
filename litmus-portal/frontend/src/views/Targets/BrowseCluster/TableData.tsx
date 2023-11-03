import {
  IconButton,
  Menu,
  MenuItem,
  TableCell,
  Tooltip,
  Typography,
  useTheme,
} from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import {
  ButtonFilled,
  ButtonOutlined,
  Icon,
  LightPills,
  Modal,
} from 'litmus-ui';
import moment from 'moment';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Cluster } from '../../../models/graphql/clusterData';
import capitalize from '../../../utils/capitalize';
import timeDifferenceForDate from '../../../utils/datesModifier';
import { getProjectID, getProjectRole } from '../../../utils/getSearchParams';
import useStyles from './styles';

interface TableDataProps {
  data: Cluster;
  deleteRow: (clid: string) => void;
}

const TableData: React.FC<TableDataProps> = ({ data, deleteRow }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  // Function to convert UNIX time in format of DD MMM YYY
  const formatDate = (date: string) => {
    const updated = new Date(parseInt(date, 10) * 1000).toString();
    const resDate = moment(updated).format('DD MMM YYYY');
    if (date) return resDate;
    return 'Date not available';
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const userRole = getProjectRole();
  const menuOpen = Boolean(anchorEl);
  const [open, setOpen] = useState(false);
  const [copying, setCopying] = useState<boolean>(false);

  const handleClick = () => {
    setOpen(true);
    setAnchorEl(null);
  };

  const handleClose = () => {
    deleteRow(data.clusterID);
    setOpen(false);
  };

  const handleOptClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleOptClose = () => {
    setAnchorEl(null);
  };

  function fallbackCopyTextToClipboard(text: string) {
    // eslint-disable-next-line no-alert
    window.prompt('Copy to clipboard: Ctrl+C, Enter', text);
  }

  function copyTextToClipboard(text: string) {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    setCopying(true);
    navigator.clipboard
      .writeText(text)
      .catch((err) => console.error('Async: Could not copy text: ', err));
    setTimeout(() => setCopying(false), 3000);
  }
  const version = process.env.REACT_APP_KB_CHAOS_VERSION;
  const [upgradeModal, setUpgradeModal] = React.useState(false);
  const theme = useTheme();
  const codeSnippet = `litmusctl upgrade chaos-delegate --chaos-delegate-id="${
    data.clusterID
  }" --project-id="${getProjectID()}"`;

  return (
    <>
      <TableCell className={classes.tableDataStatus}>
        {data.isClusterConfirmed === false ? (
          <LightPills
            variant="warning"
            label={t('workflowCluster.header.formControl.menu6')}
          />
        ) : data.isClusterConfirmed === true && data.isActive ? (
          <LightPills
            variant="success"
            label={t('workflowCluster.header.formControl.menu1')}
          />
        ) : (
          <LightPills
            variant="danger"
            label={t('workflowCluster.header.formControl.menu2')}
          />
        )}
      </TableCell>
      <TableCell className={classes.workflowNameData}>
        <Typography>{data.clusterName}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{capitalize(data.agentScope)}</Typography>
      </TableCell>
      <TableCell>{formatDate(data.updatedAt)}</TableCell>
      <TableCell>
        <Typography className={classes.stepsData}>
          {data.noOfWorkflows}
        </Typography>
      </TableCell>
      <TableCell className={classes.stepsDataschedule}>
        <Typography>{data.noOfSchedules}</Typography>
      </TableCell>
      <TableCell>
        {data.lastWorkflowTimestamp === '0' ? (
          <Typography>Not Yet</Typography>
        ) : (
          timeDifferenceForDate(data.lastWorkflowTimestamp)
        )}
      </TableCell>
      <TableCell className={classes.menuCell}>
        <IconButton
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={handleOptClick}
          className={classes.optionBtn}
          data-cy="browseScheduleOptions"
        >
          <MoreVertIcon />
        </IconButton>

        <Menu
          id="long-menu"
          anchorEl={anchorEl}
          keepMounted
          open={menuOpen}
          onClose={handleOptClose}
          data-cy="agentMenu"
        >
          <MenuItem
            value="Copy_ID"
            onClick={() => copyTextToClipboard(data.clusterID)}
          >
            <div className={classes.expDiv}>
              <Typography data-cy="Copy_ID" className={classes.btnText}>
                {t('targets.options.copyTargetID')}
              </Typography>
            </div>
          </MenuItem>
          <Tooltip
            classes={{
              tooltip: classes.customTooltip,
            }}
            disableFocusListener
            disableHoverListener={userRole !== 'Viewer'}
            placement="bottom"
            title="Insufficient Permissions"
          >
            <MenuItem
              value="upgrade"
              onClick={() => {
                setUpgradeModal(true);
                setAnchorEl(null);
              }}
              disabled={
                userRole === 'Viewer' ||
                data.version === version ||
                data.version === ''
              }
            >
              <div className={classes.expDiv}>
                <Typography data-cy="upgrade" className={classes.btnText}>
                  {t('targets.options.upgrade')}
                </Typography>
              </div>
            </MenuItem>
          </Tooltip>
          <Tooltip
            classes={{
              tooltip: classes.customTooltip,
            }}
            disableFocusListener
            disableHoverListener={userRole !== 'Viewer'}
            placement="bottom"
            title="Insufficient Permissions"
          >
            <MenuItem
              value="disconnect"
              disabled={userRole === 'Viewer'}
              onClick={handleClick}
            >
              <div className={classes.expDiv}>
                <Typography data-cy="disconnect" className={classes.btnText}>
                  {t('targets.modalDelete.disconnect')}
                </Typography>
              </div>
            </MenuItem>
          </Tooltip>
        </Menu>
      </TableCell>
      {open && (
        <div>
          <Modal
            open={open}
            onClose={() => {
              setOpen(false);
            }}
            width="60%"
            modalActions={
              <ButtonOutlined
                onClick={() => {
                  setOpen(false);
                }}
              >
                &#x2715;
              </ButtonOutlined>
            }
          >
            <div className={classes.body}>
              <img src="./icons/DisconnectIcon.svg" alt="disconnect" />
              <div className={classes.text}>
                <Typography className={classes.typo} align="center">
                  {t('targets.modalDelete.head1')} <br />
                  {t('targets.modalDelete.head2')}
                  <br />
                  <strong>
                    {data.clusterName} {t('targets.modalDelete.head4')}
                  </strong>
                </Typography>
              </div>
              <div className={classes.textSecond}>
                <Typography
                  className={classes.disconnectForever}
                  align="center"
                >
                  {t('targets.modalDelete.head3')}
                </Typography>
              </div>
              <div className={classes.buttonGroup}>
                <ButtonOutlined
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  <> {t('targets.modalDelete.no')}</>
                </ButtonOutlined>

                <ButtonFilled
                  disabled={userRole === 'Viewer'}
                  variant="error"
                  onClick={handleClose}
                  className={classes.w7}
                >
                  {t('targets.modalDelete.yes')}
                </ButtonFilled>
              </div>
            </div>
          </Modal>
        </div>
      )}
      {upgradeModal && (
        <div>
          <Modal
            open={upgradeModal}
            onClose={() => {
              setUpgradeModal(false);
            }}
            width="50%"
            height="45%"
            modalActions={
              <ButtonOutlined
                size="small"
                onClick={() => {
                  setUpgradeModal(false);
                }}
              >
                &#x2715;
              </ButtonOutlined>
            }
          >
            <div className={classes.upgradeModalBody}>
              <Typography
                style={{
                  fontWeight: 700,
                  fontSize: '1.5rem',
                }}
              >
                {t('targets.modalUpgrade.head1')}
              </Typography>
              <Typography className={classes.bodyText}>
                {t('targets.modalUpgrade.copyUpgradeCommand')}
              </Typography>
              <div className={classes.editorText}>
                <Typography
                  style={{
                    textAlign: 'start',
                    width: '70%',
                  }}
                >
                  {codeSnippet}
                </Typography>
                <IconButton
                  onClick={() => copyTextToClipboard(codeSnippet)}
                  edge="end"
                  aria-label="copyProject"
                >
                  {!copying ? (
                    <Icon
                      name="copy"
                      size="lg"
                      color={theme.palette.primary.main}
                    />
                  ) : (
                    <DoneIcon />
                  )}
                </IconButton>
              </div>

              <ButtonFilled
                onClick={() => setUpgradeModal(false)}
                style={{
                  marginLeft: 'auto',
                }}
              >
                {t('targets.modalUpgrade.done')}
              </ButtonFilled>
            </div>
          </Modal>
        </div>
      )}
    </>
  );
};
export default TableData;
