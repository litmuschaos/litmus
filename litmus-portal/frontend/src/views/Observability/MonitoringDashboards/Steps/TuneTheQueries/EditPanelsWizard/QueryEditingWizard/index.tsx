import {
  AppBar,
  Avatar,
  FormControlLabel,
  Switch,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import {
  ButtonFilled,
  ButtonOutlined,
  EditableText,
  Modal,
  TextButton,
} from 'litmus-ui';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { StyledTab, TabPanel } from '../../../../../../../components/Tabs';
import {
  PanelDetails,
  PromQueryDetails,
} from '../../../../../../../models/dashboardsData';
import {
  ApplicationMetadata,
  PanelOption,
} from '../../../../../../../models/graphql/dashboardsDetails';
import { promInput } from '../../../../../../../models/graphql/prometheus';
import { ReactComponent as AddQueryIcon } from '../../../../../../../svg/add-query.svg';
import { ReactComponent as SwitchIcon } from '../../../../../../../svg/switch-checked.svg';
import { getPromQueryInput } from '../../../../../../../utils/promUtils';
import Graph from './Graph';
import QueryEditor from './QueryEditor';
import useStyles from './styles';

interface Option {
  name: string;
  [index: string]: any;
}

interface QueryEditingWizardProps {
  numberOfPanels: number;
  panelVars: PanelDetails;
  selectedApps: ApplicationMetadata[];
  seriesList: Array<Option>;
  panelGroupsList: Array<Option>;
  index: number;
  handleUpdatePanel: (panelVars: PanelDetails, index: number) => void;
  handleDeletePanel: (index: number) => void;
  handleDiscardChanges: (index: number) => void;
}

interface Update {
  triggerUpdate: boolean;
  graph: boolean;
}

const QueryEditingWizard: React.FC<QueryEditingWizardProps> = ({
  numberOfPanels,
  panelVars,
  selectedApps,
  seriesList,
  panelGroupsList,
  index,
  handleUpdatePanel,
  handleDeletePanel,
  handleDiscardChanges,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const [tabValue, setTabValue] = React.useState<number>(0);
  const [discardChangesModalOpen, setDiscardChangesModalOpen] =
    React.useState<boolean>(false);
  const [deletePanelModalOpen, setDeletePanelModalOpen] =
    React.useState<boolean>(false);
  const [panelInfo, setPanelInfo] = useState<PanelDetails>({ ...panelVars });
  const [update, setUpdate] = useState<Update>({
    triggerUpdate: false,
    graph: false,
  });
  const [settings, setSettings] = useState<boolean>(true);
  const [prometheusQueryData, setPrometheusQueryData] =
    React.useState<promInput>({
      ds_details: {
        url: panelInfo.dsURL ?? '',
        start: `${
          new Date(
            moment.unix(Math.round(new Date().getTime() / 1000) - 900).format()
          ).getTime() / 1000
        }`,
        end: `${
          new Date(
            moment.unix(Math.round(new Date().getTime() / 1000)).format()
          ).getTime() / 1000
        }`,
      },
      queries: getPromQueryInput(
        panelInfo.promQueries.filter((query) => !query.hidden),
        900,
        false
      ),
    });

  useEffect(() => {
    if (update.triggerUpdate) {
      handleUpdatePanel(panelInfo, index);
      if (update.graph) {
        setPrometheusQueryData({
          ds_details: {
            url: panelInfo.dsURL ?? '',
            start: `${
              new Date(
                moment
                  .unix(Math.round(new Date().getTime() / 1000) - 900)
                  .format()
              ).getTime() / 1000
            }`,
            end: `${
              new Date(
                moment.unix(Math.round(new Date().getTime() / 1000)).format()
              ).getTime() / 1000
            }`,
          },
          queries: getPromQueryInput(
            panelInfo.promQueries.filter((query) => !query.hidden),
            900,
            false
          ),
        });
      }
      setUpdate({ triggerUpdate: false, graph: false });
    }
  }, [update]);

  const handleAddQuery = () => {
    const existingQueries: PromQueryDetails[] = panelInfo.promQueries;
    existingQueries.push({
      hidden: false,
      queryID: uuidv4(),
      promQueryName: '',
      legend: '',
      resolution: '1/2',
      minstep: '5',
      line: true,
      closeArea: false,
    });
    setPanelInfo({ ...panelInfo, promQueries: existingQueries });
    setUpdate({ triggerUpdate: true, graph: true });
  };

  const handleDeleteQuery = (index: number) => {
    const existingQueries: PromQueryDetails[] = panelInfo.promQueries;
    if (index !== 0 || existingQueries.length > 1) {
      existingQueries.splice(index, 1);
      setPanelInfo({ ...panelInfo, promQueries: existingQueries });
      setUpdate({ triggerUpdate: true, graph: true });
    }
  };

  const handleShowAndHideQuery = (index: number) => {
    const existingQueries: PromQueryDetails[] = panelInfo.promQueries;
    existingQueries[index].hidden = !existingQueries[index].hidden;
    setPanelInfo({ ...panelInfo, promQueries: existingQueries });
    setUpdate({ triggerUpdate: true, graph: true });
  };

  const handleUpdateQuery = (query: PromQueryDetails, index: number) => {
    const existingQueries: PromQueryDetails[] = panelInfo.promQueries;
    existingQueries[index] = query;
    setPanelInfo({ ...panelInfo, promQueries: existingQueries });
    setUpdate({ triggerUpdate: true, graph: true });
  };

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <div className={classes.root}>
      <div className={`${classes.flexBetween} ${classes.header}`}>
        <div className={classes.flex}>
          <Autocomplete
            defaultValue={{ name: panelInfo.panelGroupName ?? '' }}
            freeSolo
            id={`pg-${panelInfo.panelGroupName}`}
            options={panelGroupsList}
            getOptionLabel={(option: Option) => option.name}
            style={{ width: '10.3rem' }}
            value={{ name: panelInfo.panelGroupName ?? '' }}
            renderInput={(params) => (
              <TextField {...params} variant="standard" size="small" />
            )}
            onChange={(event, value, reason) => {
              setPanelInfo({
                ...panelInfo,
                panelGroupName: value
                  ? reason === 'create-option'
                    ? (value as string)
                    : (value as Option).name
                  : '',
                panelGroupID:
                  reason === 'create-option'
                    ? ''
                    : panelInfo.panelGroupID ?? '',
              });
              setUpdate({ triggerUpdate: true, graph: false });
            }}
          />
          <Typography className={classes.divider}> / </Typography>
          <EditableText
            defaultValue={panelInfo.panelName}
            id="name"
            onSave={(value) => {
              setPanelInfo({ ...panelInfo, panelName: value });
              setUpdate({ triggerUpdate: true, graph: false });
            }}
          />
        </div>
        <div
          className={`${classes.flex} ${classes.controlButtons}`}
          style={{ gap: '1rem' }}
        >
          <ButtonOutlined
            onClick={() => setSettings(!settings)}
            className={classes.iconButton}
          >
            <img
              src="./icons/query-settings.svg"
              alt="Settings icon"
              className={classes.icon}
            />
          </ButtonOutlined>
          {numberOfPanels > 1 && (
            <ButtonOutlined
              onClick={() => setDeletePanelModalOpen(true)}
              className={`${classes.iconButton} ${classes.deleteButton}`}
            >
              <img
                src="./icons/delete.svg"
                alt="Delete icon"
                className={classes.icon}
              />
            </ButtonOutlined>
          )}
        </div>
      </div>
      <Graph panelVars={panelVars} prometheusQueryData={prometheusQueryData} />
      {settings && (
        <>
          <div className={classes.editSection}>
            <AppBar
              position="static"
              color="default"
              className={classes.appBar}
            >
              <Tabs
                value={tabValue}
                onChange={handleChange}
                TabIndicatorProps={{
                  style: {
                    backgroundColor: theme.palette.primary.main,
                  },
                }}
                variant="scrollable"
                scrollButtons="auto"
              >
                <StyledTab
                  label={
                    panelInfo.promQueries.length > 1
                      ? t(
                          'monitoringDashboard.monitoringDashboards.tuneTheQueries.queries'
                        )
                      : t(
                          'monitoringDashboard.monitoringDashboards.tuneTheQueries.query'
                        )
                  }
                  icon={
                    <Avatar className={classes.avatar}>
                      <Typography className={classes.queryCount}>
                        {panelInfo.promQueries.length}
                      </Typography>
                    </Avatar>
                  }
                />

                <StyledTab
                  label={t(
                    'monitoringDashboard.monitoringDashboards.tuneTheQueries.visualization'
                  )}
                />
              </Tabs>
            </AppBar>

            <TabPanel value={tabValue} index={0}>
              {panelInfo.promQueries.map((prom_query, index) => (
                <QueryEditor
                  numberOfQueries={panelInfo.promQueries.length}
                  index={index}
                  key={`query-editor-${prom_query.queryID}`}
                  promQuery={prom_query}
                  selectedApps={selectedApps}
                  dsURL={panelInfo.dsURL ?? ''}
                  seriesList={seriesList}
                  handleDeleteQuery={handleDeleteQuery}
                  handleShowAndHideQuery={handleShowAndHideQuery}
                  handleUpdateQuery={handleUpdateQuery}
                />
              ))}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <div className={classes.switches}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={panelInfo.panelOptions.points}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        const updatedPanelOptions: PanelOption = {
                          ...panelInfo.panelOptions,
                          points: event.target.checked,
                        };
                        setPanelInfo({
                          ...panelInfo,
                          panelOptions: updatedPanelOptions,
                        });
                        setUpdate({ triggerUpdate: true, graph: true });
                      }}
                      name={`${t(
                        'monitoringDashboard.monitoringDashboards.tuneTheQueries.points'
                      )}`}
                      icon={<SwitchIcon />}
                      checkedIcon={<SwitchIcon />}
                    />
                  }
                  label={`${t(
                    'monitoringDashboard.monitoringDashboards.tuneTheQueries.points'
                  )}`}
                  labelPlacement="start"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={panelInfo.panelOptions.grids}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        const updatedPanelOptions: PanelOption = {
                          ...panelInfo.panelOptions,
                          grids: event.target.checked,
                        };
                        setPanelInfo({
                          ...panelInfo,
                          panelOptions: updatedPanelOptions,
                        });
                        setUpdate({ triggerUpdate: true, graph: true });
                      }}
                      name={`${t(
                        'monitoringDashboard.monitoringDashboards.tuneTheQueries.grids'
                      )}`}
                      icon={<SwitchIcon />}
                      checkedIcon={<SwitchIcon />}
                    />
                  }
                  label={`${t(
                    'monitoringDashboard.monitoringDashboards.tuneTheQueries.grids'
                  )}`}
                  labelPlacement="start"
                />
              </div>
            </TabPanel>
          </div>
          <div
            className={`${classes.flexBetween} ${classes.topMargin} ${
              tabValue === 0 ? '' : classes.flexEnd
            }`}
          >
            {tabValue === 0 && (
              <ButtonOutlined
                onClick={handleAddQuery}
                startIcon={<AddQueryIcon />}
              >
                <Typography>
                  {t(
                    'monitoringDashboard.monitoringDashboards.tuneTheQueries.addQuery'
                  )}
                </Typography>
              </ButtonOutlined>
            )}

            <ButtonFilled
              onClick={() => setDiscardChangesModalOpen(true)}
              variant="error"
            >
              <Typography>
                {t(
                  'monitoringDashboard.monitoringDashboards.tuneTheQueries.discardChanges'
                )}
              </Typography>
            </ButtonFilled>
          </div>
        </>
      )}

      <Modal
        open={deletePanelModalOpen}
        onClose={() => setDeletePanelModalOpen(false)}
        width="45%"
        height="fit-content"
      >
        <div className={classes.modal}>
          <Typography className={classes.modalHeading} align="left">
            <b>
              {t(
                'monitoringDashboard.monitoringDashboards.tuneTheQueries.removeMetric'
              )}
            </b>
          </Typography>

          <Typography className={classes.modalBodyText} align="left">
            {t(
              'monitoringDashboard.monitoringDashboards.tuneTheQueries.removeMetricConfirmation'
            )}
            <b>
              <i>{` ${panelInfo.panelName} `}</i>
            </b>
            {t('monitoringDashboard.monitoringDashboards.tuneTheQueries.under')}
            <b>
              <i>{` ${panelInfo.panelGroupName} `}</i>
            </b>
            ?
          </Typography>

          <div className={classes.flexButtons}>
            <TextButton
              onClick={() => setDeletePanelModalOpen(false)}
              className={classes.cancelButton}
            >
              <Typography className={classes.buttonText}>
                {t(
                  'monitoringDashboard.monitoringDashboards.tuneTheQueries.cancel'
                )}
              </Typography>
            </TextButton>
            <ButtonFilled
              onClick={() => handleDeletePanel(index)}
              variant="error"
            >
              <Typography
                className={`${classes.buttonText} ${classes.confirmButtonText}`}
              >
                {t(
                  'monitoringDashboard.monitoringDashboards.tuneTheQueries.delete'
                )}
              </Typography>
            </ButtonFilled>
          </div>
        </div>
      </Modal>

      <Modal
        open={discardChangesModalOpen}
        onClose={() => setDiscardChangesModalOpen(false)}
        width="45%"
        height="fit-content"
      >
        <div className={classes.modal}>
          <Typography className={classes.modalHeading} align="left">
            {t(
              'monitoringDashboard.monitoringDashboards.tuneTheQueries.discardChangesConfirmation'
            )}
            <b>
              <i>{` ${panelInfo.panelName} `}</i>
            </b>
            {t('monitoringDashboard.monitoringDashboards.tuneTheQueries.under')}
            <b>
              <i>{` ${panelInfo.panelGroupName} `}</i>
            </b>
            ?
          </Typography>

          <Typography className={classes.modalBodyText} align="left">
            {t(
              'monitoringDashboard.monitoringDashboards.tuneTheQueries.discardChangesInfo'
            )}
          </Typography>

          <div className={classes.flexButtons}>
            <TextButton
              onClick={() => setDiscardChangesModalOpen(false)}
              className={classes.cancelButton}
            >
              <Typography className={classes.buttonText}>
                {t(
                  'monitoringDashboard.monitoringDashboards.tuneTheQueries.cancel'
                )}
              </Typography>
            </TextButton>
            <ButtonFilled
              onClick={() => handleDiscardChanges(index)}
              variant="error"
            >
              <Typography
                className={`${classes.buttonText} ${classes.confirmButtonText}`}
              >
                {t(
                  'monitoringDashboard.monitoringDashboards.tuneTheQueries.yesProceed'
                )}
              </Typography>
            </ButtonFilled>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default QueryEditingWizard;
