import {
  Divider,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Select,
  Typography,
} from '@material-ui/core';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import CustomDate from '../../../components/DateTime/CustomDate/index';
import CustomTime from '../../../components/DateTime/CustomTime/index';
import { constants } from '../../../constants';
import { WorkflowData } from '../../../models/redux/workflow';
import useActions from '../../../redux/actions';
import * as TemplateSelectionActions from '../../../redux/actions/template';
import * as WorkflowActions from '../../../redux/actions/workflow';
import { RootState } from '../../../redux/reducers';
import { cronWorkflow, workflowOnce } from '../../../utils/workflowTemplate';
import { fetchWorkflowNameFromManifest } from '../../../utils/yamlUtils';
import SetTime from './SetTime/index';
import useStyles from './styles';

interface ScheduleSyntax {
  minute: string | undefined;
  hour: string | undefined;
  day_month: string | undefined;
  month: string | undefined;
  day_week: string;
}

const ScheduleWorkflow = forwardRef((_, ref) => {
  // Initial Cron State
  const [cronValue, setCronValue] = useState<ScheduleSyntax>({
    minute: '*',
    hour: '*',
    day_month: '*',
    month: '*',
    day_week: '*',
  });

  const manifest = useSelector(
    (state: RootState) => state.workflowManifest.manifest
  );
  const { namespace } = useSelector((state: RootState) => state.workflowData);
  // Redux States for Schedule
  const workflowData: WorkflowData = useSelector(
    (state: RootState) => state.workflowData
  );
  const workflow = useActions(WorkflowActions);
  const template = useActions(TemplateSelectionActions);

  const scheduleOnce = workflowOnce;
  const scheduleMore = cronWorkflow;

  // Controls Radio Buttons
  const [value, setValue] = React.useState(
    workflowData.scheduleType.scheduleOnce
  );
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  // Controls inner radio buttons of Recurring Schedule
  const [valueDef, setValueDef] = React.useState(
    workflowData.scheduleType.recurringSchedule
  );
  const handleChangeInstance = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValueDef(event.target.value);
  };

  // UseEffect to update the cron syntax with changes
  useEffect(() => {
    const cronSyntax = `${cronValue.minute} ${cronValue.hour} ${cronValue.day_month} ${cronValue.month} ${cronValue.day_week}`;
    if (value === 'now')
      workflow.setWorkflowDetails({
        cronSyntax: '',
      });
    else
      workflow.setWorkflowDetails({
        cronSyntax,
      });
  }, [cronValue]);

  const classes = useStyles();
  const { t } = useTranslation();

  // Sets individual minutes
  const [minute, setMinute] = React.useState(
    workflowData.scheduleInput.hour_interval
  );

  // Sets Weekdays
  const [days, setDays] = React.useState(workflowData.scheduleInput.weekday);

  // Sets Day in number
  const [dates, setDates] = React.useState(workflowData.scheduleInput.day);

  // Sets Time
  const [selectedTime, setSelectedTime] = React.useState<Date | null>(
    new Date(workflowData.scheduleInput.time)
  );

  // Sets Date
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(
    new Date(workflowData.scheduleInput.date)
  );

  // Function to validate the date and time for "Specific Time" radio button
  const validateTime = (time: Date | null, date: Date | null) => {
    if (
      value === 'specificTime' &&
      (time?.setSeconds(0) as number) <= new Date().setSeconds(0) &&
      (date?.getTime() as number) <= new Date().getTime()
    ) {
      const newTime = new Date();
      newTime.setMinutes(newTime.getMinutes() + 5);
      setSelectedTime(newTime);
      workflow.setWorkflowDetails({
        scheduleInput: {
          ...workflowData.scheduleInput,
          date,
          time: newTime,
        },
      });
      setCronValue({
        ...cronValue,
        minute: newTime.getMinutes().toString(),
        hour: newTime.getHours().toString(),
        day_month: date?.getDate().toString(),
        month: (date && date.getMonth() + 1)?.toString(),
      });
    } else {
      workflow.setWorkflowDetails({
        scheduleInput: {
          ...workflowData.scheduleInput,
          date,
          time,
        },
      });
      setCronValue({
        ...cronValue,
        minute: time?.getMinutes().toString(),
        hour: time?.getHours().toString(),
        day_month: date?.getDate().toString(),
        month: (date && date.getMonth() + 1)?.toString(),
      });
    }
  };

  const handleTimeChange = (time: Date | null) => {
    setSelectedTime(time);
    validateTime(time, selectedDate);
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    validateTime(selectedTime, date);
  };

  function EditYaml() {
    const oldParsedYaml = YAML.parse(manifest);
    let NewYaml: string;
    if (
      oldParsedYaml.kind === 'Workflow' &&
      workflowData.scheduleType.scheduleOnce !== 'now'
    ) {
      const oldParsedYaml = YAML.parse(manifest);
      const newParsedYaml = YAML.parse(scheduleMore);
      delete newParsedYaml.spec.workflowSpec;
      newParsedYaml.spec.schedule = workflowData.cronSyntax;
      delete newParsedYaml.metadata.generateName;
      newParsedYaml.metadata.name = fetchWorkflowNameFromManifest(manifest);
      newParsedYaml.metadata.namespace = namespace;
      newParsedYaml.metadata.labels = {
        workflow_id: workflowData.workflow_id,
      };
      newParsedYaml.spec.workflowSpec = oldParsedYaml.spec;
      const tz = {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      };
      Object.entries(tz).forEach(([key, value]) => {
        newParsedYaml.spec[key] = value;
      });
      NewYaml = YAML.stringify(newParsedYaml);
      workflow.setWorkflowManifest({
        manifest: NewYaml,
      });
    }
    if (
      oldParsedYaml.kind === 'CronWorkflow' &&
      workflowData.scheduleType.scheduleOnce === 'now'
    ) {
      const oldParsedYaml = YAML.parse(manifest);
      const newParsedYaml = YAML.parse(scheduleOnce);
      delete newParsedYaml.spec;
      delete newParsedYaml.metadata.generateName;
      newParsedYaml.metadata.name = fetchWorkflowNameFromManifest(manifest);
      newParsedYaml.metadata.namespace = namespace;
      newParsedYaml.spec = oldParsedYaml.spec.workflowSpec;
      newParsedYaml.metadata.labels = {
        workflow_id: workflowData.workflow_id,
      };
      NewYaml = YAML.stringify(newParsedYaml);
      workflow.setWorkflowManifest({
        manifest: NewYaml,
      });
    }
    if (
      oldParsedYaml.kind === 'CronWorkflow' &&
      workflowData.scheduleType.scheduleOnce !== 'now'
      //   && !isDisabled
    ) {
      const newParsedYaml = YAML.parse(manifest);
      newParsedYaml.spec.schedule = workflowData.cronSyntax;
      //   newParsedYaml.spec.suspend = false;
      delete newParsedYaml.metadata.generateName;
      newParsedYaml.metadata.name = fetchWorkflowNameFromManifest(manifest);
      newParsedYaml.metadata.namespace = namespace;
      newParsedYaml.metadata.labels = { workflow_id: workflowData.workflow_id };
      const tz = {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      };
      Object.entries(tz).forEach(([key, value]) => {
        newParsedYaml.spec[key] = value;
      });
      NewYaml = YAML.stringify(newParsedYaml);
      workflow.setWorkflowManifest({
        manifest: NewYaml,
      });
    }
  }

  // Function for recurring date change
  const reccuringDateChange = (date: Date | null) => {
    setSelectedTime(date);
    setCronValue({
      ...cronValue,
      minute: date?.getMinutes().toString(),
      hour: date?.getHours().toString(),
    });
    workflow.setWorkflowDetails({
      scheduleInput: {
        ...workflowData.scheduleInput,
        time: date,
      },
    });
  };

  // Stores dates in an array
  const names: number[] = [1];
  for (let i = 1; i <= 30; i += 1) {
    names[i] = i + 1;
  }
  const mins: number[] = [0];
  for (let i = 0; i <= 59; i += 1) {
    mins[i] = i;
  }
  // Day names
  const weekdays: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  // UseEffect to update the values of CronSyntax on radio button change
  useEffect(() => {
    if (value === 'now') {
      setValueDef('');
      setCronValue({
        minute: '',
        hour: '',
        day_month: '',
        month: '',
        day_week: '',
      });
    }
    if (value === 'specificTime') {
      setValueDef('');
      setCronValue({
        minute: selectedTime?.getMinutes().toString(),
        hour: selectedTime?.getHours().toString(),
        day_month: selectedDate?.getDate().toString(),
        month: (selectedDate && selectedDate.getMonth() + 1)?.toString(),
        day_week: '*',
      });
      if (workflowData.scheduleInput.time <= new Date()) {
        const newTime = new Date();
        newTime.setMinutes(newTime.getMinutes() + 5);
        setSelectedTime(newTime);
        setCronValue({
          minute: newTime.getMinutes().toString(),
          hour: newTime.getHours().toString(),
          day_month: selectedDate?.getDate().toString(),
          month: (selectedDate && selectedDate.getMonth() + 1)?.toString(),
          day_week: '*',
        });
        workflow.setWorkflowDetails({
          scheduleInput: {
            ...workflowData.scheduleInput,
            time: newTime,
          },
        });
      }
    }
    if (valueDef === constants.recurringEveryHour) {
      setCronValue({
        minute: minute.toString(),
        hour: '0-23',
        day_month: '*',
        month: '*',
        day_week: '*',
      });
    }
    if (valueDef === constants.recurringEveryDay) {
      setCronValue({
        minute: selectedTime?.getMinutes().toString(),
        hour: selectedTime?.getHours().toString(),
        day_month: '*',
        month: '*',
        day_week: '0-6',
      });
    }
    if (valueDef === constants.recurringEveryWeek) {
      setCronValue({
        minute: selectedTime?.getMinutes().toString(),
        hour: selectedTime?.getHours().toString(),
        day_month: '*',
        month: '*',
        day_week: days.slice(0, 3),
      });
    }
    if (valueDef === constants.recurringEveryMonth) {
      setCronValue({
        minute: selectedTime?.getMinutes().toString(),
        hour: selectedTime?.getHours().toString(),
        day_month: dates.toString(),
        month: '*',
        day_week: '*',
      });
    }
    if (value === 'recurringSchedule' && valueDef === '') {
      template.selectTemplate({ isDisable: true });
    } else {
      template.selectTemplate({ isDisable: false });
    }
    workflow.setWorkflowDetails({
      scheduleType: {
        scheduleOnce: value,
        recurringSchedule: valueDef,
      },
    });
  }, [valueDef, value]);

  function onNext() {
    EditYaml();
    return true;
  }

  useImperativeHandle(ref, () => ({
    onNext,
  }));

  return (
    <div className={classes.root}>
      <div className={classes.innerContainer}>
        {/* Upper segment */}
        <div className={classes.scSegments}>
          <div>
            <Typography className={classes.headerText}>
              <strong>{t('createWorkflow.scheduleWorkflow.header')}</strong>
            </Typography>

            <div className={classes.schBody}>
              <Typography align="left" className={classes.description}>
                {t('createWorkflow.scheduleWorkflow.info')}
              </Typography>
            </div>
          </div>
          <img
            src="./icons/calendarWorkflowIcon.svg"
            alt="calendar"
            className={classes.calIcon}
          />
        </div>
        <Divider />

        {/* Lower segment */}
        <div className={classes.scFormControl}>
          <FormControl component="fieldset" className={classes.formControl}>
            <RadioGroup
              data-cy="ScheduleOptions"
              aria-label="schedule"
              name="schedule"
              value={value}
              onChange={handleChange}
            >
              {/* options to choose schedule */}
              <FormControlLabel
                value="now"
                control={
                  <Radio
                    classes={{
                      root: classes.radio,
                      checked: classes.checked,
                    }}
                  />
                }
                label={
                  <Typography className={classes.radioText}>
                    {t('createWorkflow.scheduleWorkflow.radio.now')}
                  </Typography>
                }
              />
              {value === 'specificTime' && (
                <div className={classes.schLater}>
                  <Typography className={classes.captionText}>
                    {t('createWorkflow.scheduleWorkflow.radio.future')}
                  </Typography>
                  <div className={classes.innerSpecific}>
                    <CustomDate
                      selectedDate={selectedDate}
                      handleDateChange={(event) => {
                        handleDateChange(event);
                      }}
                      disabled={false}
                    />
                    <CustomTime
                      handleDateChange={(event) => {
                        handleTimeChange(event);
                      }}
                      value={selectedTime}
                      ampm
                      disabled={false}
                    />
                  </div>
                </div>
              )}
              <FormControlLabel
                value="recurringSchedule"
                control={
                  <Radio
                    classes={{ root: classes.radio, checked: classes.checked }}
                  />
                }
                label={
                  <Typography className={classes.radioText}>
                    {t('createWorkflow.scheduleWorkflow.radio.recurr')}
                  </Typography>
                }
              />
              {value === 'recurringSchedule' && (
                <div className={classes.schLater}>
                  <Typography className={classes.captionText}>
                    {t('createWorkflow.scheduleWorkflow.radio.rightRecurr')}
                  </Typography>

                  {/* options to select time of recurring schedule */}
                  <div className={classes.innerRecurring}>
                    <FormControl component="fieldset">
                      <RadioGroup
                        data-cy="RecurringSchedule"
                        aria-label="instanceDef"
                        name="instanceDef"
                        value={valueDef}
                        onChange={(event) => {
                          handleChangeInstance(event);
                        }}
                      >
                        <FormControlLabel
                          value={constants.recurringEveryHour}
                          control={
                            <Radio
                              classes={{
                                root: classes.radio,
                                checked: classes.checked,
                              }}
                            />
                          }
                          label={t('createWorkflow.scheduleWorkflow.every.hr')}
                        />
                        {valueDef === constants.recurringEveryHour && (
                          <div>
                            <div className={classes.scRandom}>
                              <Typography className={classes.scRandsub1}>
                                {t('createWorkflow.scheduleWorkflow.at')}
                              </Typography>
                              <SetTime
                                data={mins}
                                handleChange={(event) => {
                                  setMinute(event.target.value as number);
                                  setCronValue({
                                    ...cronValue,
                                    minute: (
                                      event.target.value as number
                                    ).toString(),
                                    hour: '0-23',
                                  });
                                  workflow.setWorkflowDetails({
                                    scheduleInput: {
                                      ...workflowData.scheduleInput,
                                      hour_interval: event.target
                                        .value as number,
                                    },
                                  });
                                }}
                                value={minute}
                              />
                              {minute === 0 || minute === 1 ? (
                                <Typography>
                                  {t('createWorkflow.scheduleWorkflow.min')}
                                </Typography>
                              ) : (
                                <Typography>
                                  {t('createWorkflow.scheduleWorkflow.mins')}
                                </Typography>
                              )}
                            </div>
                          </div>
                        )}
                        <FormControlLabel
                          value={constants.recurringEveryDay}
                          control={
                            <Radio
                              classes={{
                                root: classes.radio,
                                checked: classes.checked,
                              }}
                            />
                          }
                          label={t('createWorkflow.scheduleWorkflow.every.day')}
                        />
                        {valueDef === constants.recurringEveryDay && (
                          <div>
                            <div className={classes.scRandom}>
                              <Typography className={classes.scRandsub1}>
                                {t('createWorkflow.scheduleWorkflow.at')}
                              </Typography>
                              <CustomTime
                                handleDateChange={(date: Date | null) => {
                                  setSelectedTime(date);
                                  setCronValue({
                                    ...cronValue,
                                    minute: date?.getMinutes().toString(),
                                    hour: date?.getHours().toString(),
                                    day_week: '0-6',
                                  });
                                  workflow.setWorkflowDetails({
                                    scheduleInput: {
                                      ...workflowData.scheduleInput,
                                      time: date,
                                    },
                                  });
                                }}
                                value={selectedTime}
                                ampm
                                disabled={false}
                              />
                            </div>
                          </div>
                        )}
                        <FormControlLabel
                          value={constants.recurringEveryWeek}
                          control={
                            <Radio
                              classes={{
                                root: classes.radio,
                                checked: classes.checked,
                              }}
                            />
                          }
                          label={t(
                            'createWorkflow.scheduleWorkflow.every.week'
                          )}
                        />
                        {valueDef === constants.recurringEveryWeek && (
                          <div>
                            <div className={classes.scRandom}>
                              <Typography className={classes.scRandsub1}>
                                {t('createWorkflow.scheduleWorkflow.on')}
                              </Typography>
                              <FormControl className={classes.formControlDT}>
                                <Select
                                  className={classes.select}
                                  disableUnderline
                                  value={days}
                                  onChange={(e) => {
                                    setCronValue({
                                      ...cronValue,
                                      month: '*',
                                      day_week: (
                                        e.target.value as unknown as string
                                      ).slice(0, 3),
                                    });
                                    setDays(
                                      e.target.value as unknown as string
                                    );
                                    workflow.setWorkflowDetails({
                                      scheduleInput: {
                                        ...workflowData.scheduleInput,
                                        weekday: e.target
                                          .value as unknown as string,
                                      },
                                    });
                                  }}
                                  label="days"
                                  inputProps={{
                                    name: 'days',
                                    style: {
                                      fontSize: '0.75rem',
                                      height: 7,
                                    },
                                  }}
                                >
                                  {weekdays.map((day) => (
                                    <option
                                      key={day}
                                      className={classes.opt}
                                      value={day}
                                    >
                                      {day}
                                    </option>
                                  ))}
                                </Select>
                              </FormControl>
                              <Typography className={classes.scRandsub1}>
                                {t('createWorkflow.scheduleWorkflow.at')}
                              </Typography>
                              <CustomTime
                                handleDateChange={(date: Date | null) => {
                                  reccuringDateChange(date);
                                }}
                                value={selectedTime}
                                ampm
                                disabled={false}
                              />
                            </div>
                          </div>
                        )}
                        <FormControlLabel
                          value={constants.recurringEveryMonth}
                          control={
                            <Radio
                              classes={{
                                root: classes.radio,
                                checked: classes.checked,
                              }}
                            />
                          }
                          label={t(
                            'createWorkflow.scheduleWorkflow.every.month'
                          )}
                        />
                        {valueDef === constants.recurringEveryMonth && (
                          <div>
                            <div className={classes.scRandom}>
                              <Typography className={classes.scRandsub1}>
                                {t('createWorkflow.scheduleWorkflow.on')}
                              </Typography>
                              <SetTime
                                data={names}
                                handleChange={(event) => {
                                  setCronValue({
                                    ...cronValue,
                                    day_month: (
                                      event.target.value as number
                                    ).toString(),
                                  });
                                  setDates(event.target.value as number);
                                  workflow.setWorkflowDetails({
                                    scheduleInput: {
                                      ...workflowData.scheduleInput,
                                      day: event.target.value as number,
                                    },
                                  });
                                }}
                                value={dates}
                              />
                              <Typography className={classes.scRandsub1}>
                                {t('createWorkflow.scheduleWorkflow.at')}
                              </Typography>
                              <CustomTime
                                handleDateChange={(date: Date | null) => {
                                  reccuringDateChange(date);
                                }}
                                value={selectedTime}
                                ampm
                                disabled={false}
                              />
                            </div>
                          </div>
                        )}
                      </RadioGroup>
                    </FormControl>
                  </div>
                </div>
              )}
            </RadioGroup>
          </FormControl>
        </div>
      </div>
    </div>
  );
});

export default ScheduleWorkflow;
