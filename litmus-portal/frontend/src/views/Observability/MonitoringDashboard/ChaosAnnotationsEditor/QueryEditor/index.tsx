/* eslint-disable no-unused-expressions */
import { useQuery } from '@apollo/client';
import {
  FormControl,
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
import { Accordion } from '../../../../../components/Accordion';
import InfoTooltip from '../../../../../components/InfoTooltip';
import PrometheusQueryEditor from '../../../../../components/PrometheusQueryBox';
import { PROM_LABEL_VALUES } from '../../../../../graphql';
import {
  PromQueryDetails,
  QueryLabelValue,
} from '../../../../../models/dashboardsData';
import {
  LabelValue,
  PrometheusSeriesQueryVars,
  PrometheusSeriesResponse,
} from '../../../../../models/graphql/prometheus';
import { ReactComponent as ExpandAccordion } from '../../../../../svg/expandQueryAccordion.svg';
import { ReactComponent as ShrinkAccordion } from '../../../../../svg/shrinkQueryAccordion.svg';
import {
  getLabelsAndValues,
  setLabelsAndValues,
} from '../../../../../utils/promUtils';
import useStyles from './styles';

interface Option {
  name: string;
  [index: string]: any;
}

interface QueryEditorProps {
  index: number;
  promQuery: PromQueryDetails;
  dsURL: string;
  seriesList: Option[];
  handleUpdateQuery: (query: PromQueryDetails) => void;
}

const QueryEditor: React.FC<QueryEditorProps> = ({
  index,
  promQuery,
  dsURL,
  seriesList,
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

  const { data: labelValueData, refetch } = useQuery<
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
    skip:
      dsURL === '' ||
      seriesList.length === 0 ||
      localQuery.base_query === '' ||
      !open,
    fetchPolicy: 'cache-and-network',
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

  const getSelectedValuesForLabel = (
    label: string,
    queryString: string,
    setValue: boolean
  ) => {
    const labelValuesList: QueryLabelValue[] = getLabelsAndValues(queryString);
    const options: Array<Option> = [];
    labelValuesList.forEach((labelValue) => {
      if (labelValue.label === label) {
        labelValue.value.forEach((item) => {
          options.push({ name: item });
        });
      }
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
      handleUpdateQuery(localQuery);
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

  return (
    <div className={classes.root}>
      <Accordion expanded={open}>
        <AccordionSummary
          onClick={() => setOpen(!open)}
          expandIcon={open ? <ShrinkAccordion /> : <ExpandAccordion />}
          IconButtonProps={{ edge: 'start' }}
          aria-controls={`query-${promQuery.queryID}-content`}
          id={`query-${promQuery.queryID}-header`}
          className={classes.query}
          key={`${promQuery.queryID}`}
        >
          <div className={classes.flex}>
            <Typography className={classes.queryTitle}>
              {promQuery.queryID}
            </Typography>
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
                  disabled={
                    labelValueData &&
                    labelValueData.GetPromLabelNamesAndValues.labelValues
                      ? !(
                          labelValueData.GetPromLabelNamesAndValues.labelValues
                            .length > 0
                        )
                      : true
                  }
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
                labelValueData?.GetPromLabelNamesAndValues.labelValues?.map(
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

            <div className={`${classes.flex} ${classes.legend}`}>
              <InputField
                label={t(
                  'monitoringDashboard.monitoringDashboards.tuneTheQueries.legend'
                )}
                data-cy="queryLegend"
                fullWidth
                variant="primary"
                value={localQuery.legend}
                disabled
              />
              <InfoTooltip
                value={t(
                  'monitoringDashboard.monitoringDashboards.tuneTheQueries.legendInfo'
                )}
                className={classes.infoIcon}
              />
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default QueryEditor;
