import { useQuery } from '@apollo/client';
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
import DoneIcon from '@material-ui/icons/Done';
import { Autocomplete } from '@material-ui/lab';
import { AutocompleteChipInput, InputField } from 'litmus-ui';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion } from '../../../../../../../../components/Accordion';
import InfoTooltip from '../../../../../../../../components/InfoTooltip';
import PrometheusQueryEditor from '../../../../../../../../components/PrometheusQueryBox';
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
import { ReactComponent as QueryHidden } from '../../../../../../../../svg/queryHidden.svg';
import { ReactComponent as QueryVisible } from '../../../../../../../../svg/queryVisible.svg';
import { ReactComponent as ShrinkAccordion } from '../../../../../../../../svg/shrinkQueryAccordion.svg';
import {
  getLabelsAndValues,
  setLabelsAndValues,
} from '../../../../../../../../utils/promUtils';
import { validateTimeInSeconds } from '../../../../../../../../utils/validate';
import useStyles from './styles';

interface QueryEditorProps {
  numberOfQueries: number;
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
  numberOfQueries,
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
  const [open, setOpen] = React.useState<boolean>(index === 0);
  const [selectedValuesForLabel, setSelectedValuesForLabel] = React.useState<
    Array<Option>
  >([]);
  const [selectedLabel, setSelectedLabel] = React.useState<string>('');
  const [update, setUpdate] = React.useState<boolean>(false);
  const [localQuery, setLocalQuery] = React.useState<PromQueryDetails>({
    ...promQuery,
    base_query: promQuery.promQueryName.split('{')[0].includes('(')
      ? promQuery.promQueryName
          .split('{')[0]
          .substring(promQuery.promQueryName.split('{')[0].lastIndexOf('(') + 1)
      : promQuery.promQueryName.split('{')[0],
    labels_and_values_list: getLabelsAndValues(promQuery.promQueryName),
  });
  const [copying, setCopying] = React.useState<boolean>(false);
  const [queryVisible, setQueryVisible] = React.useState<boolean>(true);

  const { data: labelValueData, refetch } = useQuery<
    PrometheusSeriesResponse,
    PrometheusSeriesQueryVars
  >(PROM_LABEL_VALUES, {
    variables: {
      request: {
        dsDetails: {
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
    skip:
      dsURL === '' ||
      seriesList.length === 0 ||
      localQuery.base_query === '' ||
      !open,
    fetchPolicy: 'cache-and-network',
  });

  const getAvailableValues = (label: string) => {
    let options: Array<Option> = [];
    if (
      labelValueData &&
      labelValueData.getPromLabelNamesAndValues.labelValues
    ) {
      labelValueData.getPromLabelNamesAndValues.labelValues.forEach(
        (labelValue) => {
          if (labelValue.label === label) {
            options = labelValue.values ?? [];
          }
        }
      );
    }
    return options;
  };

  const getSelectedValuesForLabel = (
    label: string,
    queryString: string,
    setValue: boolean
  ) => {
    const allOptions: string[] = getAvailableValues(label).map(
      (option) => option.name
    );
    const labelValuesList: QueryLabelValue[] = getLabelsAndValues(queryString);
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
            if (allOptions.includes(name) && !options.includes({ name })) {
              options.push({ name });
            }
          });
        }
        if (label === 'job') {
          appRes.names.forEach((name) => {
            if (allOptions.includes(name) && !options.includes({ name })) {
              options.push({ name });
            } else if (
              allOptions.includes(`${app.namespace}/${name}`) &&
              !options.includes({ name: `${app.namespace}/${name}` })
            ) {
              options.push({ name: `${app.namespace}/${name}` });
            }
          });
        }
      });
    });
    const filteredOptions = options.filter((opt) => opt.name !== '');
    const newOptionsSet = Array.from(
      new Set(filteredOptions.map((opt) => opt.name))
    );
    const newOptions: Array<Option> = newOptionsSet.map((optionName) => {
      return { name: optionName };
    });
    if (setValue) {
      setSelectedValuesForLabel(newOptions);
      return null;
    }
    return newOptions;
  };

  useEffect(() => {
    if (update) {
      handleUpdateQuery(localQuery, index);
      setUpdate(false);
    }
  }, [update]);

  const getValueList = (list: LabelValue[]) => {
    const completionOptions: any[] = [];
    list.forEach((labelValue) => {
      if (labelValue.values) {
        labelValue.values.forEach((value) => {
          completionOptions.push({
            value,
            score: 3,
            meta: `Value for ${labelValue.label}`,
          });
        });
      }
    });
    return completionOptions;
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    // eslint-disable-next-line no-alert
    window.prompt('Copy to clipboard: Ctrl+C, Enter', text);
  };

  const copyTextToClipboard = (text: string) => {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    setCopying(true);
    navigator.clipboard
      .writeText(text)
      .catch((err) => console.error('Async: Could not copy text: ', err));

    setTimeout(() => setCopying(false), 3000);
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
          aria-controls={`query-${promQuery.queryID}-content`}
          id={`query-${promQuery.queryID}-header`}
          className={classes.query}
          key={`${promQuery.queryID}`}
        >
          <div className={`${classes.flex} ${classes.summaryHeader}`}>
            <Typography className={classes.queryTitle}>
              {String.fromCharCode(65 + index)}
            </Typography>

            <div className={classes.flex}>
              <IconButton
                className={classes.iconButton}
                onClick={() =>
                  copyTextToClipboard(`${localQuery.promQueryName}`)
                }
                aria-label="copyQuery"
              >
                {!copying ? (
                  <CopyQuery className={classes.icon} />
                ) : (
                  <DoneIcon className={classes.icon} />
                )}
              </IconButton>

              {numberOfQueries > 1 && (
                <>
                  <IconButton
                    className={classes.iconButton}
                    onClick={() => {
                      setQueryVisible(!queryVisible);
                      handleShowAndHideQuery(index);
                    }}
                  >
                    {queryVisible ? (
                      <QueryVisible className={classes.icon} />
                    ) : (
                      <QueryHidden className={classes.icon} />
                    )}
                  </IconButton>
                  <IconButton
                    className={classes.iconButton}
                    onClick={() => handleDeleteQuery(index)}
                  >
                    <DeleteQuery className={classes.icon} />
                  </IconButton>
                </>
              )}
            </div>
          </div>
        </AccordionSummary>
        <AccordionDetails className={classes.queryContainer}>
          <div style={{ width: '98.5%' }}>
            <Autocomplete
              value={{ name: localQuery.base_query ?? '' }}
              freeSolo
              id={`query-${promQuery.queryID}-query-name`}
              options={seriesList}
              getOptionLabel={(option: Option) => option.name}
              style={{ width: '45%' }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t(
                    'monitoringDashboard.monitoringDashboards.tuneTheQueries.metric'
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
                const exitingLocalBaseQuery = localQuery.base_query;
                setLocalQuery({
                  ...localQuery,
                  base_query: newQuery,
                  promQueryName: newQuery,
                  labels_and_values_list: [],
                });
                if (
                  newQuery !== '' &&
                  dsURL !== '' &&
                  exitingLocalBaseQuery !== newQuery &&
                  open
                ) {
                  setSelectedValuesForLabel([]);
                  refetch();
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
                    'monitoringDashboard.monitoringDashboards.tuneTheQueries.keys'
                  )}
                </InputLabel>
                <Select
                  value={selectedLabel}
                  onChange={(event: any) => {
                    setSelectedLabel(event.target.value as string);
                    const selectedValues: Array<Option> =
                      getSelectedValuesForLabel(
                        event.target.value as string,
                        localQuery.promQueryName,
                        false
                      ) ?? [];
                    const existingLabelValuesList: QueryLabelValue[] =
                      localQuery.labels_and_values_list ?? [];
                    let updateStatus = false;
                    existingLabelValuesList.forEach((labelValue, index) => {
                      if (labelValue.label === (event.target.value as string)) {
                        existingLabelValuesList[index].value =
                          selectedValues.map((option) => option.name);
                        updateStatus = true;
                      }
                    });
                    if (!updateStatus) {
                      existingLabelValuesList.push({
                        label: event.target.value as string,
                        value: selectedValues.map((option) => option.name),
                      });
                    }
                    const newPromQueryName = setLabelsAndValues(
                      localQuery.base_query ?? '',
                      localQuery.promQueryName ?? '',
                      existingLabelValuesList
                    );
                    setLocalQuery({
                      ...localQuery,
                      promQueryName: newPromQueryName,
                      labels_and_values_list: existingLabelValuesList,
                    });
                    getSelectedValuesForLabel(
                      event.target.value as string,
                      localQuery.promQueryName,
                      true
                    );
                    setUpdate(true);
                  }}
                  label={t(
                    'monitoringDashboard.monitoringDashboards.tuneTheQueries.selectKey'
                  )}
                  className={classes.selectText}
                >
                  {labelValueData &&
                    labelValueData.getPromLabelNamesAndValues.labelValues?.map(
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
                freeSolo
                onChange={(event, value) => {
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
                  const newPromQueryName = setLabelsAndValues(
                    localQuery.base_query ?? '',
                    localQuery.promQueryName ?? '',
                    existingLabelValuesList
                  );
                  setLocalQuery({
                    ...localQuery,
                    promQueryName: newPromQueryName,
                    labels_and_values_list: existingLabelValuesList,
                  });
                  getSelectedValuesForLabel(
                    selectedLabel ?? '',
                    newPromQueryName,
                    true
                  );
                  setUpdate(true);
                }}
                getOptionSelected={(option) =>
                  selectedValuesForLabel
                    .map((selections) => selections.name)
                    .includes(option.name)
                }
                options={getAvailableValues(selectedLabel ?? '')}
                label={t(
                  'monitoringDashboard.monitoringDashboards.tuneTheQueries.values'
                )}
                placeholder={`${t(
                  'monitoringDashboard.monitoringDashboards.tuneTheQueries.addValue'
                )}`}
                disableCloseOnSelect
                disableClearable={false}
                limitTags={4}
                style={{ width: '75%' }}
              />
            </div>

            <PrometheusQueryEditor
              index={index}
              content={localQuery.promQueryName ?? ''}
              seriesListCompletionOptions={
                seriesList.map((option: Option) => ({
                  value: option.name,
                  score: 1,
                  meta: t(
                    'monitoringDashboard.monitoringDashboards.tuneTheQueries.seriesName'
                  ),
                })) ?? []
              }
              labelListCompletionOptions={
                labelValueData?.getPromLabelNamesAndValues.labelValues?.map(
                  (labelValue: LabelValue) => ({
                    value: labelValue.label,
                    score: 2,
                    meta: localQuery.base_query
                      ? `${t(
                          'monitoringDashboard.monitoringDashboards.tuneTheQueries.labelFor'
                        )} ${localQuery.base_query}`
                      : t(
                          'monitoringDashboard.monitoringDashboards.tuneTheQueries.label'
                        ),
                  })
                ) ?? []
              }
              valueListCompletionOptions={getValueList(
                labelValueData?.getPromLabelNamesAndValues.labelValues ?? []
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
                  promQueryName: updatedQuery,
                });
                if (localQuery.base_query !== '' && dsURL !== '' && open) {
                  if (existingBaseQuery !== newBaseQuery) {
                    setSelectedValuesForLabel([]);
                    refetch();
                  } else if (existingBaseQuery === newBaseQuery) {
                    getSelectedValuesForLabel(
                      selectedLabel ?? '',
                      updatedQuery,
                      true
                    );
                  }
                }
                setUpdate(true);
              }}
            />

            <Typography className={classes.configHeader}>
              {t(
                'monitoringDashboard.monitoringDashboards.tuneTheQueries.configuration'
              )}
            </Typography>

            <div
              className={`${classes.flex} ${classes.paddedTop} ${classes.configSection}`}
            >
              <div className={classes.flex}>
                <InputField
                  label={t(
                    'monitoringDashboard.monitoringDashboards.tuneTheQueries.legend'
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
                    'monitoringDashboard.monitoringDashboards.tuneTheQueries.legendInfo'
                  )}
                  className={classes.infoIcon}
                />
              </div>

              <div className={classes.flex}>
                <InputField
                  label={t(
                    'monitoringDashboard.monitoringDashboards.tuneTheQueries.minStep'
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
                    'monitoringDashboard.monitoringDashboards.tuneTheQueries.minStepInfo'
                  )}
                  className={classes.infoIcon}
                />
              </div>

              <div className={classes.flex}>
                <InputField
                  label={t(
                    'monitoringDashboard.monitoringDashboards.tuneTheQueries.format'
                  )}
                  data-cy="dataFormat"
                  width="9rem"
                  variant="primary"
                  disabled
                  value={t(
                    'monitoringDashboard.monitoringDashboards.tuneTheQueries.timeSeries'
                  )}
                />
                <InfoTooltip
                  value={t(
                    'monitoringDashboard.monitoringDashboards.tuneTheQueries.formatInfo'
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
                      'monitoringDashboard.monitoringDashboards.tuneTheQueries.graph'
                    )}
                  </InputLabel>
                  <Select
                    value={localQuery.line ? 'Line graph' : 'Area graph'}
                    onChange={(event) => {
                      const line =
                        (event.target.value as string) === 'Line graph';
                      setLocalQuery({
                        ...localQuery,
                        line,
                        closeArea: !line,
                      });
                      setUpdate(true);
                    }}
                    label={t(
                      'monitoringDashboard.monitoringDashboards.tuneTheQueries.graph'
                    )}
                    className={classes.selectText}
                  >
                    <MenuItem
                      key={`${t(
                        'monitoringDashboard.monitoringDashboards.tuneTheQueries.lineGraph'
                      )}`}
                      value="Line graph"
                    >
                      {t(
                        'monitoringDashboard.monitoringDashboards.tuneTheQueries.lineGraph'
                      )}
                    </MenuItem>
                    <MenuItem
                      key={`${t(
                        'monitoringDashboard.monitoringDashboards.tuneTheQueries.areaGraph'
                      )}`}
                      value="Area graph"
                    >
                      {t(
                        'monitoringDashboard.monitoringDashboards.tuneTheQueries.areaGraph'
                      )}
                    </MenuItem>
                  </Select>
                </FormControl>
                <InfoTooltip
                  value={t(
                    'monitoringDashboard.monitoringDashboards.tuneTheQueries.graphInfo'
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
                  disabled
                >
                  <InputLabel className={classes.selectTextLabel}>
                    {t(
                      'monitoringDashboard.monitoringDashboards.tuneTheQueries.resolution'
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
                      'monitoringDashboard.monitoringDashboards.tuneTheQueries.resolution'
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
                    'monitoringDashboard.monitoringDashboards.tuneTheQueries.resolutionInfo'
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
