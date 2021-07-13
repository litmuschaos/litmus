import {
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
} from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { Search } from 'litmus-ui';
import React, { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import useStyles, { useOutlinedInputStyles } from './styles';

interface TableToolBarProps {
  searchToken: string;
  handleSearch: (
    event?: ChangeEvent<{ value: unknown }>,
    token?: string
  ) => void;
  workflows: string[];
  contexts: string[];
  verdicts: string[];
  callbackToSetWorkflow: (workflow: string) => void;
  callbackToSetContext: (context: string) => void;
  callbackToSetVerdict: (verdict: string) => void;
}

const TableToolBar: React.FC<TableToolBarProps> = ({
  handleSearch,
  searchToken,
  workflows,
  contexts,
  verdicts,
  callbackToSetWorkflow,
  callbackToSetContext,
  callbackToSetVerdict,
}) => {
  const classes = useStyles();
  const outlinedInputClasses = useOutlinedInputStyles();
  const { t } = useTranslation();
  const [workflow, setWorkflow] = React.useState<String>('All');
  const [context, setContext] = React.useState<String>('All');
  const [verdict, setVerdict] = React.useState<String>('All');

  const handleWorkflowChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setWorkflow(event.target.value as String);
    callbackToSetWorkflow(event.target.value as string);
  };

  const handleContextChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setContext(event.target.value as String);
    callbackToSetContext(event.target.value as string);
  };

  const handleVerdictChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setVerdict(event.target.value as String);
    callbackToSetVerdict(event.target.value as string);
  };

  return (
    <div className={classes.headerSection}>
      <div className={classes.search}>
        <Search
          id="input-with-icon-textfield"
          placeholder={t(
            'analyticsDashboard.monitoringDashboardPage.chaosTable.search'
          )}
          value={searchToken}
          onChange={handleSearch}
        />
      </div>
      <div
        className={classes.headerSection}
        style={{ justifyContent: 'flex-end' }}
      >
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel className={classes.selectText}>
            {t(
              'analyticsDashboard.monitoringDashboardPage.chaosTable.tableHead2'
            )}
          </InputLabel>
          <Select
            label={t(
              'analyticsDashboard.monitoringDashboardPage.chaosTable.tableHead2'
            )}
            value={workflow}
            onChange={handleWorkflowChange}
            className={classes.selectText}
            input={<OutlinedInput classes={outlinedInputClasses} />}
            IconComponent={KeyboardArrowDownIcon}
            MenuProps={{
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'right',
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'right',
              },
              getContentAnchorEl: null,
              classes: { paper: classes.menuList },
            }}
          >
            <MenuItem value="All" className={classes.menuListItem}>
              {t('analyticsDashboard.monitoringDashboardPage.chaosTable.all')}
            </MenuItem>
            {workflows.map((availableWorkflow: string) => (
              <MenuItem
                key={`${availableWorkflow}-workflow-chaos-table-toolbar`}
                value={availableWorkflow}
                className={classes.menuListItem}
              >
                {availableWorkflow}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel className={classes.selectText}>
            {t(
              'analyticsDashboard.monitoringDashboardPage.chaosTable.tableHead3'
            )}
          </InputLabel>
          <Select
            label={t(
              'analyticsDashboard.monitoringDashboardPage.chaosTable.tableHead3'
            )}
            value={context}
            onChange={handleContextChange}
            className={classes.selectText}
            input={<OutlinedInput classes={outlinedInputClasses} />}
            IconComponent={KeyboardArrowDownIcon}
            MenuProps={{
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'right',
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'right',
              },
              getContentAnchorEl: null,
              classes: { paper: classes.menuList },
            }}
          >
            <MenuItem value="All" className={classes.menuListItem}>
              {t('analyticsDashboard.monitoringDashboardPage.chaosTable.all')}
            </MenuItem>
            {contexts.map((availableContext: string) => (
              <MenuItem
                key={`${availableContext}-context-chaos-table-toolbar`}
                value={availableContext}
                className={classes.menuListItem}
              >
                {availableContext}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          variant="outlined"
          className={`${classes.formControl} ${classes.verdictForm}`}
        >
          <InputLabel className={classes.selectText}>
            {t(
              'analyticsDashboard.monitoringDashboardPage.chaosTable.tableHead4.title'
            )}
          </InputLabel>
          <Select
            label={t(
              'analyticsDashboard.monitoringDashboardPage.chaosTable.tableHead4.title'
            )}
            value={verdict}
            onChange={handleVerdictChange}
            className={classes.selectText}
            input={<OutlinedInput classes={outlinedInputClasses} />}
            IconComponent={KeyboardArrowDownIcon}
            MenuProps={{
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'right',
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'right',
              },
              getContentAnchorEl: null,
              classes: { paper: classes.menuList },
            }}
          >
            <MenuItem value="All" className={classes.menuListItem}>
              {t('analyticsDashboard.monitoringDashboardPage.chaosTable.all')}
            </MenuItem>
            {verdicts.map((availableVerdict: string) => (
              <MenuItem
                key={`${availableVerdict}-context-chaos-table-toolbar`}
                value={availableVerdict}
                className={classes.menuListItem}
              >
                {availableVerdict}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </div>
  );
};

export default TableToolBar;
