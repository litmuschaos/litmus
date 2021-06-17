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
import { ButtonFilled, ButtonOutlined, EditableText } from 'litmus-ui';
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
  const [panelInfo, setPanelInfo] = useState<PanelDetails>({ ...panelVars });
  const [update, setUpdate] = useState<Update>({
    triggerUpdate: false,
    graph: false,
  });
  const [settings, setSettings] = useState<boolean>(true);
  const [
    prometheusQueryData,
    setPrometheusQueryData,
  ] = React.useState<promInput>({
    ds_details: {
      url: panelInfo.ds_url ?? '',
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
      panelInfo.prom_queries.filter((query) => !query.hidden),
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
            url: panelInfo.ds_url ?? '',
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
            panelInfo.prom_queries.filter((query) => !query.hidden),
            900,
            false
          ),
        });
      }
      setUpdate({ triggerUpdate: false, graph: false });
    }
  }, [update]);

  const handleAddQuery = () => {
    const existingQueries: PromQueryDetails[] = panelInfo.prom_queries;
    existingQueries.push({
      hidden: false,
      queryid: uuidv4(),
      prom_query_name: '',
      legend: '',
      resolution: '1/2',
      minstep: '5',
      line: true,
      close_area: false,
    });
    setPanelInfo({ ...panelInfo, prom_queries: existingQueries });
    setUpdate({ triggerUpdate: true, graph: true });
  };

  const handleDeleteQuery = (index: number) => {
    const existingQueries: PromQueryDetails[] = panelInfo.prom_queries;
    if (index !== 0 || existingQueries.length > 1) {
      existingQueries.splice(index, 1);
      setPanelInfo({ ...panelInfo, prom_queries: existingQueries });
      setUpdate({ triggerUpdate: true, graph: true });
    }
  };

  const handleShowAndHideQuery = (index: number) => {
    const existingQueries: PromQueryDetails[] = panelInfo.prom_queries;
    existingQueries[index].hidden = !existingQueries[index].hidden;
    setPanelInfo({ ...panelInfo, prom_queries: existingQueries });
    setUpdate({ triggerUpdate: true, graph: true });
  };

  const handleUpdateQuery = (query: PromQueryDetails, index: number) => {
    const existingQueries: PromQueryDetails[] = panelInfo.prom_queries;
    existingQueries[index] = query;
    setPanelInfo({ ...panelInfo, prom_queries: existingQueries });
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
            defaultValue={{ name: panelInfo.panel_group_name ?? '' }}
            freeSolo
            id={`pg-${panelInfo.panel_group_name}`}
            options={panelGroupsList}
            getOptionLabel={(option: Option) => option.name}
            style={{ width: '10.3rem' }}
            renderInput={(params) => (
              <TextField {...params} variant="standard" size="small" />
            )}
            onChange={(event, value, reason) => {
              setPanelInfo({
                ...panelInfo,
                panel_group_name: value
                  ? reason === 'create-option'
                    ? (value as string)
                    : (value as Option).name
                  : '',
                panel_group_id:
                  reason === 'create-option'
                    ? ''
                    : panelInfo.panel_group_id ?? '',
              });
              setUpdate({ triggerUpdate: true, graph: false });
            }}
          />
          <Typography className={classes.divider}> / </Typography>
          <EditableText
            defaultValue={panelInfo.panel_name}
            id="name"
            onSave={(value) => {
              setPanelInfo({ ...panelInfo, panel_name: value });
              setUpdate({ triggerUpdate: true, graph: false });
            }}
          />
        </div>
        <div
          className={`${classes.flex} ${classes.controlButtons}`}
          style={{ gap: '1rem' }}
        >
          <ButtonOutlined
            onClick={() => {
              setSettings(!settings);
            }}
            className={classes.iconButton}
          >
            <img
              src="/icons/query-settings.svg"
              alt="Settings icon"
              className={classes.icon}
            />
          </ButtonOutlined>
          <ButtonOutlined
            onClick={() => {
              handleDeletePanel(index);
            }}
            className={`${classes.iconButton} ${classes.deleteButton}`}
          >
            <img
              src="/icons/delete.svg"
              alt="Delete icon"
              className={classes.icon}
            />
          </ButtonOutlined>
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
                    panelInfo.prom_queries.length > 1
                      ? t(
                          'analyticsDashboard.applicationDashboards.tuneTheQueries.queries'
                        )
                      : t(
                          'analyticsDashboard.applicationDashboards.tuneTheQueries.query'
                        )
                  }
                  icon={
                    <Avatar className={classes.avatar}>
                      <Typography className={classes.queryCount}>
                        {panelInfo.prom_queries.length}
                      </Typography>
                    </Avatar>
                  }
                />

                <StyledTab
                  label={t(
                    'analyticsDashboard.applicationDashboards.tuneTheQueries.visualization'
                  )}
                />
              </Tabs>
            </AppBar>

            <TabPanel value={tabValue} index={0}>
              {panelInfo.prom_queries.map((prom_query, index) => (
                <QueryEditor
                  index={index}
                  key={`query-editor-${prom_query.queryid}`}
                  promQuery={prom_query}
                  selectedApps={selectedApps}
                  dsURL={panelInfo.ds_url ?? ''}
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
                      checked={panelInfo.panel_options.points}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        const updatedPanelOptions: PanelOption = {
                          ...panelInfo.panel_options,
                          points: event.target.checked,
                        };
                        setPanelInfo({
                          ...panelInfo,
                          panel_options: updatedPanelOptions,
                        });
                        setUpdate({ triggerUpdate: true, graph: true });
                      }}
                      name={`${t(
                        'analyticsDashboard.applicationDashboards.tuneTheQueries.points'
                      )}`}
                      icon={<SwitchIcon />}
                      checkedIcon={<SwitchIcon />}
                    />
                  }
                  label={`${t(
                    'analyticsDashboard.applicationDashboards.tuneTheQueries.points'
                  )}`}
                  labelPlacement="start"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={panelInfo.panel_options.grids}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        const updatedPanelOptions: PanelOption = {
                          ...panelInfo.panel_options,
                          grids: event.target.checked,
                        };
                        setPanelInfo({
                          ...panelInfo,
                          panel_options: updatedPanelOptions,
                        });
                        setUpdate({ triggerUpdate: true, graph: true });
                      }}
                      name={`${t(
                        'analyticsDashboard.applicationDashboards.tuneTheQueries.grids'
                      )}`}
                      icon={<SwitchIcon />}
                      checkedIcon={<SwitchIcon />}
                    />
                  }
                  label={`${t(
                    'analyticsDashboard.applicationDashboards.tuneTheQueries.grids'
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
                    'analyticsDashboard.applicationDashboards.tuneTheQueries.addQuery'
                  )}
                </Typography>
              </ButtonOutlined>
            )}

            <ButtonFilled
              onClick={() => {
                handleDiscardChanges(index);
              }}
              className={classes.discardButton}
            >
              <Typography>
                {t(
                  'analyticsDashboard.applicationDashboards.tuneTheQueries.discardChanges'
                )}
              </Typography>
            </ButtonFilled>
          </div>
        </>
      )}
    </div>
  );
};
export default QueryEditingWizard;
