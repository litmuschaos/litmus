import {
  Divider,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Select,
  Typography,
} from '@material-ui/core';
import React from 'react';
import calendar from '../../assets/icons/calendar.png';
import CustomDate from '../DateTime/CustomDate/index';
import CustomTime from '../DateTime/CustomTime/index';
import SetTime from '../SetTime/index';
import useStyles from './styles';

const ScheduleWorkflow: React.FC = () => {
  const start = 0;
  const end = 10;
  const interval = 2;

  const classes = useStyles();
  // controls radio buttons
  const [value, setValue] = React.useState('now');
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  // controls inner radio buttons of recurring schedule
  const [valueDef, setValueDef] = React.useState('');
  const handleChangeInstance = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValueDef(event.target.value);
  };

  // sets weekdays
  const [days, setDays] = React.useState('Monday');

  // sets dates
  const [dates, setDates] = React.useState(1);

  // stores dates in an array
  const names: number[] = [1];
  for (let i = 1; i <= 30; i += 1) {
    names[i] = i + 1;
  }

  const weekdays: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  return (
    <div className={classes.root}>
      <div className={classes.scHeader}>
        {/* Upper segment */}
        <div className={classes.scSegments}>
          <div>
            <Typography className={classes.headerText}>
              <strong>Choose a chaos schedule</strong>
            </Typography>

            <div className={classes.schBody}>
              <Typography align="left" className={classes.description}>
                Choose the right time to start your first workflow. Below your
                first workflow. Below you can find any option convenient for
                you.
              </Typography>
            </div>
          </div>
          <img src={calendar} alt="calendar" className={classes.calIcon} />
        </div>
        <Divider className={classes.divider} />

        {/* Lower segment */}
        <div className={classes.scFormControl}>
          <FormControl component="fieldset" className={classes.formControl}>
            <RadioGroup
              aria-label="schedule"
              name="schedule"
              value={value}
              onChange={handleChange}
            >
              {/* options to choose schedule */}
              <FormControlLabel
                value="now"
                control={<Radio />}
                label={
                  <Typography className={classes.radioText}>
                    Schedule now
                  </Typography>
                }
              />

              <FormControlLabel
                value="afterSometime"
                control={<Radio />}
                label={
                  <Typography className={classes.radioText}>
                    Schedule after some time
                  </Typography>
                }
              />
              {value === 'afterSometime' ? (
                <div className={classes.schLater}>
                  <Typography className={classes.captionText}>
                    Choose the minutes, hours, or days when you want to start
                    workflow
                  </Typography>
                  <div className={classes.wtDateTime}>
                    <Typography variant="body2" className={classes.captionText}>
                      After
                    </Typography>

                    <SetTime
                      start={start}
                      end={end}
                      interval={interval}
                      label="Days"
                      type="days"
                    />
                    <CustomTime ampm disabled={false} />
                  </div>
                </div>
              ) : (
                <></>
              )}
              <FormControlLabel
                value="specificTime"
                control={<Radio />}
                label={
                  <Typography className={classes.radioText}>
                    Schedule at a specific time
                  </Typography>
                }
              />

              {value === 'specificTime' ? (
                <div className={classes.schLater}>
                  <Typography className={classes.captionText}>
                    Select date and time to start workflow in future
                  </Typography>
                  <div className={classes.innerSpecific}>
                    <CustomDate disabled={false} />
                    <CustomTime ampm disabled={false} />
                  </div>
                </div>
              ) : (
                <></>
              )}
              <FormControlLabel
                value="recurringScedule"
                control={<Radio />}
                label={
                  <Typography className={classes.radioText}>
                    Recurring Schedule
                  </Typography>
                }
              />
              {value === 'recurringScedule' ? (
                <div className={classes.schLater}>
                  <Typography className={classes.captionText}>
                    Choose the right recurring time to start your workflow
                  </Typography>

                  {/* options to select time of recurring schedule */}
                  <div className={classes.innerRecurring}>
                    <FormControl component="fieldset">
                      <RadioGroup
                        aria-label="instanceDef"
                        name="instanceDef"
                        value={valueDef}
                        onChange={handleChangeInstance}
                      >
                        <FormControlLabel
                          value="everyHr"
                          control={<Radio />}
                          label="Every Hour"
                        />
                        {valueDef === 'everyHr' ? (
                          <div>
                            <div className={classes.scRandom}>
                              <Typography className={classes.scRandsub1}>
                                At
                              </Typography>
                              <SetTime
                                start={start}
                                end={end}
                                interval={interval}
                                label="th"
                                type=""
                              />
                            </div>
                          </div>
                        ) : (
                          <></>
                        )}
                        <FormControlLabel
                          value="everyDay"
                          control={<Radio />}
                          label="Every Day "
                        />
                        {valueDef === 'everyDay' ? (
                          <div>
                            <div className={classes.scRandom}>
                              <Typography className={classes.scRandsub1}>
                                At
                              </Typography>
                              <CustomTime ampm disabled={false} />
                            </div>
                          </div>
                        ) : (
                          <></>
                        )}
                        <FormControlLabel
                          value="everyWeek"
                          control={<Radio />}
                          label="Every Week "
                        />
                        {valueDef === 'everyWeek' ? (
                          <div>
                            <div className={classes.scRandom}>
                              <Typography className={classes.scRandsub1}>
                                On
                              </Typography>
                              <FormControl className={classes.formControlDT}>
                                <Select
                                  className={classes.select}
                                  disableUnderline
                                  value={days}
                                  onChange={(e) => {
                                    setDays(
                                      (e.target.value as unknown) as string
                                    );
                                  }}
                                  label="days"
                                  inputProps={{
                                    name: 'days',

                                    id: 'outlined-age-native-simple',
                                    style: {
                                      fontSize: '0.75rem',
                                      height: 7,
                                    },
                                  }}
                                >
                                  {weekdays.map((day) => (
                                    <option className={classes.opt} value={day}>
                                      {day}
                                    </option>
                                  ))}
                                </Select>
                              </FormControl>
                              <Typography className={classes.scRandsub1}>
                                at
                              </Typography>
                              <CustomTime ampm disabled={false} />
                            </div>
                          </div>
                        ) : (
                          <></>
                        )}
                        <FormControlLabel
                          value="everyMonth"
                          control={<Radio />}
                          label="Every Month"
                        />
                        {valueDef === 'everyMonth' ? (
                          <div>
                            <div className={classes.scRandom}>
                              <Typography className={classes.scRandsub1}>
                                On
                              </Typography>
                              <FormControl className={classes.formControlMonth}>
                                <Select
                                  className={classes.select}
                                  disableUnderline
                                  value={dates}
                                  onChange={(e) => {
                                    setDates(
                                      (e.target.value as unknown) as number
                                    );
                                  }}
                                  label="dates"
                                  inputProps={{
                                    name: 'dates',
                                    id: 'outlined-age-native-simple',
                                    style: {
                                      fontSize: '0.75rem',
                                      height: 7,
                                    },
                                  }}
                                >
                                  {names.map((date) => (
                                    <option
                                      className={classes.opt}
                                      value={date}
                                    >
                                      {date}
                                    </option>
                                  ))}
                                </Select>
                              </FormControl>
                              <Typography className={classes.scRandsub1}>
                                at
                              </Typography>
                              <CustomTime ampm disabled={false} />
                            </div>
                          </div>
                        ) : (
                          <></>
                        )}
                      </RadioGroup>
                    </FormControl>
                  </div>
                </div>
              ) : (
                <></>
              )}
            </RadioGroup>
          </FormControl>
        </div>
      </div>
    </div>
  );
};

export default ScheduleWorkflow;
