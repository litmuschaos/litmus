/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useLazyQuery } from '@apollo/client';
import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import { Autocomplete } from '@material-ui/lab';
import { AutocompleteChipInput, InputField } from 'litmus-ui';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion } from '../../../../../../../../components/Accordion';
import InfoTooltip from '../../../../../../../../components/InfoTooltip';
import { PROM_LABEL_VALUES } from '../../../../../../../../graphql';
import {
  PromQueryDetails,
  QueryLabelValue,
} from '../../../../../../../../models/dashboardsData';
import { ApplicationMetadata } from '../../../../../../../../models/graphql/dashboardsDetails';
import {
  LabelValue,
  PrometheusSeriesQueryVars,
  PrometheusSeriesResponse,
} from '../../../../../../../../models/graphql/prometheus';
import { ReactComponent as ExpandAccordion } from '../../../../../../../../svg/expandQueryAccordion.svg';
import { ReactComponent as CopyQuery } from '../../../../../../../../svg/queryCopy.svg';
import { ReactComponent as DeleteQuery } from '../../../../../../../../svg/queryDelete.svg';
import { ReactComponent as ShowHideQuery } from '../../../../../../../../svg/queryHide.svg';
import { ReactComponent as ShrinkAccordion } from '../../../../../../../../svg/shrinkQueryAccordion.svg';
import {
  getLabelsAndValues,
  setLabelsAndValues,
} from '../../../../../../../../utils/promUtils';
import { validateTimeInSeconds } from '../../../../../../../../utils/validate';
import PrometheusQueryEditor from './PrometheusQueryBox';
import useStyles from './styles';

interface QueryEditorProps {
  index: number;
  promQuery: PromQueryDetails;
  selectedApps: ApplicationMetadata[];
  dsURL: string;
  seriesList: Option[];
  handleDeleteQuery: (index: number) => void;
  handleShowAndHideQuery: (index: number) => void;
  handleUpdateQuery: (query: PromQueryDetails, index: number) => void;
}

interface Option {
  name: string;
  [index: string]: any;
}

const resolutions: string[] = ['1/1', '1/2', '1/3', '1/4', '1/5', '1/10'];

const QueryEditor: React.FC<QueryEditorProps> = ({
  index,
  promQuery,
  selectedApps,
  dsURL,
  seriesList,
  handleDeleteQuery,
  handleShowAndHideQuery,
  handleUpdateQuery,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [open, setOpen] = React.useState<boolean>(true);
  const [selectedValuesForLabel, setSelectedValuesForLabel] = React.useState<
    Array<Option>
  >([]);

  const [selectedLabel, setSelectedLabel] = React.useState<string>('');
  const [update, setUpdate] = React.useState<boolean>(false);
  const [firstLoad, setFirstLoad] = React.useState<boolean>(true);
  const [localQuery, setLocalQuery] = React.useState<PromQueryDetails>({
    ...promQuery,
    base_query: promQuery.prom_query_name.split('{')[0].includes('(')
      ? promQuery.prom_query_name
          .split('{')[0]
          .substring(
            promQuery.prom_query_name.split('{')[0].lastIndexOf('(') + 1
          )
      : promQuery.prom_query_name.split('{')[0],
    labels_and_values_list: getLabelsAndValues(promQuery.prom_query_name),
  });

  const [getLabelValues, { data: labelValueData }] = useLazyQuery<
    PrometheusSeriesResponse,
    PrometheusSeriesQueryVars
  >(PROM_LABEL_VALUES, {
    variables: {
      prometheusInput: {
        ds_details: {
          url: dsURL,
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
        series: localQuery.base_query ?? '',
      },
    },
    fetchPolicy: 'network-only',
  });

  const getAvailableValues = (label: string) => {
    let options: Array<Option> = [];
    if (labelValueData) {
      labelValueData.GetPromLabelNamesAndValues.labelValues?.forEach(
        (labelValue) => {
          if (labelValue.label === label) {
            options = labelValue.values ?? [];
          }
        }
      );
    }
    return options;
  };

  const getSelectedValuesForLabel = (label: string) => {
    const allOptions: string[] = getAvailableValues(label).map(
      (option) => option.name
    );
    const labelValuesList: QueryLabelValue[] = getLabelsAndValues(
      localQuery.prom_query_name
    );
    const options: Array<Option> = [];
    labelValuesList.forEach((labelValue) => {
      if (labelValue.label === label) {
        labelValue.value.forEach((item) => {
          options.push({ name: item });
        });
      }
    });
    selectedApps.forEach((app) => {
      app.applications.forEach((appRes) => {
        if (
          label !== 'job' &&
          label.toLowerCase().includes(appRes.kind.toLowerCase())
        ) {
          appRes.names.forEach((name) => {
            if (allOptions.includes(name)) {
              options.push({ name });
            }
          });
        }
        if (label === 'job') {
          appRes.names.forEach((name) => {
            if (allOptions.includes(name)) {
              options.push({ name });
            } else if (allOptions.includes(`${app.namespace}/${name}`)) {
              options.push({ name: `${app.namespace}/${name}` });
            }
          });
        }
      });
    });
    setSelectedValuesForLabel(options);
  };

  useEffect(() => {
    if (firstLoad && localQuery.base_query !== '' && dsURL !== '') {
      getLabelValues();
      getSelectedValuesForLabel(selectedLabel ?? '');
      setFirstLoad(false);
    }
  }, [firstLoad]);

  useEffect(() => {
    if (update) {
      handleUpdateQuery(localQuery, index);
      setUpdate(false);
    }
  }, [update]);

  const getValueList = (list: LabelValue[]) => {
    const completionOptions: any[] = [];
    list.forEach((labelValue) => {
      labelValue.values?.forEach((value) => {
        completionOptions.push({
          value,
          score: 3,
          meta: `Value for ${labelValue.label}`,
        });
      });
    });
    return completionOptions;
  };

  const copyTextToClipboard = (text: string) => {
    if (!navigator.clipboard) {
      console.error('Oops Could not copy text: ');
      return;
    }
    navigator.clipboard
      .writeText(text)
      .catch((err) => console.error('Async: Could not copy text: ', err));
  };

  return (
    <div className={classes.root}>
      <Accordion expanded={open}>
        <AccordionSummary
          expandIcon={
            open ? (
              <ShrinkAccordion
                onClick={() => {
                  setOpen(false);
                }}
              />
            ) : (
              <ExpandAccordion
                onClick={() => {
                  setOpen(true);
                }}
              />
            )
          }
          IconButtonProps={{ edge: 'start' }}
          aria-controls={`query-${promQuery.queryid}-content`}
          id={`query-${promQuery.queryid}-header`}
          className={classes.query}
          key={`${promQuery.queryid}`}
        >
          <div className={`${classes.flex} ${classes.summaryHeader}`}>
            <Typography className={classes.queryTitle}>
              {String.fromCharCode(65 + index)}
            </Typography>

            <div className={classes.flex}>
              <IconButton
                className={classes.iconButton}
                onClick={() => {
                  copyTextToClipboard(localQuery.prom_query_name);
                }}
              >
                <CopyQuery className={classes.icon} />
              </IconButton>

              <IconButton
                className={classes.iconButton}
                onClick={() => {
                  handleShowAndHideQuery(index);
                }}
              >
                <ShowHideQuery className={classes.icon} />
              </IconButton>

              <IconButton
                className={classes.iconButton}
                onClick={() => {
                  handleDeleteQuery(index);
                }}
              >
                <DeleteQuery className={classes.icon} />
              </IconButton>
            </div>
          </div>
        </AccordionSummary>
        <AccordionDetails className={classes.queryContainer}>
          <div style={{ width: '98.5%' }}>
            <Autocomplete
              value={{ name: localQuery.base_query ?? '' }}
              freeSolo
              id={`query-${promQuery.queryid}-query-name`}
              options={seriesList}
              getOptionLabel={(option: Option) => option.name}
              style={{ width: '45%' }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t(
                    'analyticsDashboard.applicationDashboards.tuneTheQueries.metric'
                  )}
                  variant="outlined"
                  size="medium"
                  InputLabelProps={{ className: classes.formLabel }}
                />
              )}
              onChange={(event, value, reason) => {
                const newQuery: string = value
                  ? reason === 'create-option'
                    ? (value as string)
                    : (value as Option).name
                  : '';
                setLocalQuery({
                  ...localQuery,
                  base_query: newQuery,
                  prom_query_name: newQuery,
                  labels_and_values_list: [],
                });
                if (newQuery !== '' && dsURL !== '') {
                  setSelectedValuesForLabel([]);
                  getLabelValues();
                }
                setUpdate(true);
              }}
            />
            <div
              className={`${classes.flex} ${classes.paddedTop}`}
              style={{ gap: '1rem' }}
            >
              <FormControl
                variant="outlined"
                className={classes.formControl}
                style={{ width: '25%' }}
                color="primary"
              >
                <InputLabel className={classes.selectTextLabel}>
                  {t(
                    'analyticsDashboard.applicationDashboards.tuneTheQueries.keys'
                  )}
                </InputLabel>
                <Select
                  value={selectedLabel}
                  onChange={(event: any) => {
                    setSelectedLabel(event.target.value as string);
                    getSelectedValuesForLabel(event.target.value as string);
                  }}
                  label={t(
                    'analyticsDashboard.applicationDashboards.tuneTheQueries.selectKey'
                  )}
                  className={classes.selectText}
                >
                  {labelValueData &&
                    labelValueData.GetPromLabelNamesAndValues.labelValues?.map(
                      (labelValue: LabelValue) => (
                        <MenuItem
                          key={labelValue.label}
                          value={labelValue.label}
                        >
                          {labelValue.label}
                        </MenuItem>
                      )
                    )}
                </Select>
              </FormControl>

              <AutocompleteChipInput
                value={selectedValuesForLabel}
                onChange={(event, value, reason) => {
                  const selectedValues: Array<Option> = value as Array<Option>;
                  const existingLabelValuesList: QueryLabelValue[] =
                    localQuery.labels_and_values_list ?? [];
                  let updateStatus = false;
                  existingLabelValuesList.forEach((labelValue, index) => {
                    if (labelValue.label === selectedLabel) {
                      existingLabelValuesList[index].value = selectedValues.map(
                        (option) => option.name
                      );
                      updateStatus = true;
                    }
                  });
                  if (!updateStatus) {
                    existingLabelValuesList.push({
                      label: selectedLabel,
                      value: selectedValues.map((option) => option.name),
                    });
                  }
                  setLocalQuery({
                    ...localQuery,
                    prom_query_name: setLabelsAndValues(
                      localQuery.base_query ?? '',
                      localQuery.prom_query_name ?? '',
                      existingLabelValuesList
                    ),
                    labels_and_values_list: existingLabelValuesList,
                  });
                  getSelectedValuesForLabel(selectedLabel ?? '');
                  setUpdate(true);
                }}
                options={getAvailableValues(selectedLabel ?? '')}
                label={t(
                  'analyticsDashboard.applicationDashboards.tuneTheQueries.values'
                )}
                placeholder={`${t(
                  'analyticsDashboard.applicationDashboards.tuneTheQueries.addValue'
                )}`}
                disableCloseOnSelect
                disableClearable={false}
                limitTags={4}
                style={{ width: '75%' }}
              />
            </div>

            <PrometheusQueryEditor
              index={index}
              content={localQuery.prom_query_name ?? ''}
              seriesListCompletionOptions={
                seriesList.map((option: Option) => ({
                  value: option.name,
                  score: 1,
                  meta: t(
                    'analyticsDashboard.applicationDashboards.tuneTheQueries.seriesName'
                  ),
                })) ?? []
              }
              labelListCompletionOptions={
                labelValueData?.GetPromLabelNamesAndValues.labelValues?.map(
                  (labelValue: LabelValue) => ({
                    value: labelValue.label,
                    score: 2,
                    meta: localQuery.base_query
                      ? `${t(
                          'analyticsDashboard.applicationDashboards.tuneTheQueries.labelFor'
                        )} ${localQuery.base_query}`
                      : t(
                          'analyticsDashboard.applicationDashboards.tuneTheQueries.label'
                        ),
                  })
                ) ?? []
              }
              valueListCompletionOptions={getValueList(
                labelValueData?.GetPromLabelNamesAndValues.labelValues ?? []
              )}
              saveQueryChange={(updatedQuery: string) => {
                const existingBaseQuery: string = localQuery.base_query ?? '';
                const newBaseQuery: string = updatedQuery
                  .split('{')[0]
                  .includes('(')
                  ? updatedQuery
                      .split('{')[0]
                      .substring(
                        updatedQuery.split('{')[0].lastIndexOf('(') + 1
                      )
                  : updatedQuery.split('{')[0];
                setLocalQuery({
                  ...localQuery,
                  base_query: newBaseQuery,
                  labels_and_values_list: getLabelsAndValues(updatedQuery),
                  prom_query_name: updatedQuery,
                });
                if (
                  existingBaseQuery !== newBaseQuery &&
                  localQuery.base_query !== '' &&
                  dsURL !== ''
                ) {
                  getLabelValues();
                  setSelectedValuesForLabel([]);
                }
                setUpdate(true);
              }}
            />

            <Typography className={classes.configHeader}>
              {t(
                'analyticsDashboard.applicationDashboards.tuneTheQueries.configuration'
              )}
            </Typography>

            <div
              className={`${classes.flex} ${classes.paddedTop}`}
              style={{ gap: '2.5rem', width: '98.5%', flexWrap: 'wrap' }}
            >
              <div className={classes.flex}>
                <InputField
                  label={t(
                    'analyticsDashboard.applicationDashboards.tuneTheQueries.legend'
                  )}
                  data-cy="queryLegend"
                  width="16rem"
                  variant="primary"
                  value={localQuery.legend}
                  onChange={(event: React.ChangeEvent<{ value: string }>) => {
                    setLocalQuery({
                      ...localQuery,
                      legend: (event.target as HTMLInputElement).value,
                    });
                    setUpdate(true);
                  }}
                />
                <InfoTooltip
                  value={t(
                    'analyticsDashboard.applicationDashboards.tuneTheQueries.legendInfo'
                  )}
                  className={classes.infoIcon}
                />
              </div>

              <div className={classes.flex}>
                <InputField
                  label={t(
                    'analyticsDashboard.applicationDashboards.tuneTheQueries.minStep'
                  )}
                  data-cy="minStep"
                  width="9rem"
                  variant={
                    !validateTimeInSeconds(`${localQuery.minstep}s`)
                      ? 'error'
                      : 'primary'
                  }
                  value={`${localQuery.minstep}s`}
                  onChange={(event: React.ChangeEvent<{ value: string }>) => {
                    setLocalQuery({
                      ...localQuery,
                      minstep: (event.target as HTMLInputElement).value.split(
                        's'
                      )[0],
                    });
                    setUpdate(true);
                  }}
                />
                <InfoTooltip
                  value={t(
                    'analyticsDashboard.applicationDashboards.tuneTheQueries.minStepInfo'
                  )}
                  className={classes.infoIcon}
                />
              </div>

              <div className={classes.flex}>
                <InputField
                  label={t(
                    'analyticsDashboard.applicationDashboards.tuneTheQueries.format'
                  )}
                  data-cy="dataFormat"
                  width="9rem"
                  variant="primary"
                  disabled
                  value={t(
                    'analyticsDashboard.applicationDashboards.tuneTheQueries.timeSeries'
                  )}
                />
                <InfoTooltip
                  value={t(
                    'analyticsDashboard.applicationDashboards.tuneTheQueries.formatInfo'
                  )}
                  className={classes.infoIcon}
                />
              </div>
            </div>

            <div
              className={`${classes.flex} ${classes.paddedTop}`}
              style={{ gap: '2.5rem' }}
            >
              <div className={classes.flex}>
                <FormControl
                  variant="outlined"
                  className={classes.formControl}
                  style={{ width: '12.5rem' }}
                  color="primary"
                >
                  <InputLabel className={classes.selectTextLabel}>
                    {t(
                      'analyticsDashboard.applicationDashboards.tuneTheQueries.graph'
                    )}
                  </InputLabel>
                  <Select
                    value={
                      localQuery.line
                        ? t(
                            'analyticsDashboard.applicationDashboards.tuneTheQueries.lineGraph'
                          )
                        : t(
                            'analyticsDashboard.applicationDashboards.tuneTheQueries.areaGraph'
                          )
                    }
                    onChange={(event) => {
                      const line =
                        (event.target.value as string) ===
                        t(
                          'analyticsDashboard.applicationDashboards.tuneTheQueries.areaGraph'
                        );
                      setLocalQuery({
                        ...localQuery,
                        line,
                        close_area: !line,
                      });
                      setUpdate(true);
                    }}
                    label={t(
                      'analyticsDashboard.applicationDashboards.tuneTheQueries.graph'
                    )}
                    className={classes.selectText}
                  >
                    <MenuItem
                      key={`${t(
                        'analyticsDashboard.applicationDashboards.tuneTheQueries.lineGraph'
                      )}`}
                      value={t(
                        'analyticsDashboard.applicationDashboards.tuneTheQueries.lineGraph'
                      )}
                    >
                      {t(
                        'analyticsDashboard.applicationDashboards.tuneTheQueries.lineGraph'
                      )}
                    </MenuItem>
                    <MenuItem
                      key={`${t(
                        'analyticsDashboard.applicationDashboards.tuneTheQueries.areaGraph'
                      )}`}
                      value={t(
                        'analyticsDashboard.applicationDashboards.tuneTheQueries.areaGraph'
                      )}
                    >
                      {t(
                        'analyticsDashboard.applicationDashboards.tuneTheQueries.areaGraph'
                      )}
                    </MenuItem>
                  </Select>
                </FormControl>
                <InfoTooltip
                  value={t(
                    'analyticsDashboard.applicationDashboards.tuneTheQueries.graphInfo'
                  )}
                  className={classes.infoIcon}
                />
              </div>

              <div className={classes.flex}>
                <FormControl
                  variant="outlined"
                  className={classes.formControl}
                  style={{ width: '8.5rem' }}
                  color="primary"
                >
                  <InputLabel className={classes.selectTextLabel}>
                    {t(
                      'analyticsDashboard.applicationDashboards.tuneTheQueries.resolution'
                    )}
                  </InputLabel>
                  <Select
                    value={localQuery.resolution}
                    onChange={(event) => {
                      setLocalQuery({
                        ...localQuery,
                        resolution: event.target.value as string,
                      });
                      setUpdate(true);
                    }}
                    label={t(
                      'analyticsDashboard.applicationDashboards.tuneTheQueries.resolution'
                    )}
                    className={classes.selectText}
                  >
                    {resolutions.map((resolution: string) => (
                      <MenuItem key={resolution} value={resolution}>
                        {resolution}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <InfoTooltip
                  value={t(
                    'analyticsDashboard.applicationDashboards.tuneTheQueries.resolutionInfo'
                  )}
                  className={classes.infoIcon}
                />
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default QueryEditor;
