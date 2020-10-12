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
import { useTranslation } from 'react-i18next';
import ButtonFilled from '../../components/Button/ButtonFilled';
import ButtonOutline from '../../components/Button/ButtonOutline';
import CustomDate from '../../components/DateTime/CustomDate/index';
import CustomTime from '../../components/DateTime/CustomTime/index';
import Scaffold from '../../containers/layouts/Scaffold';
import SetTime from './SetTime/index';
import useStyles from './styles';

const SchedulePage: React.FC = () => {
  const { t } = useTranslation();
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
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(
    new Date(Date.now())
  );

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };
  return (
    <Scaffold>
      <div className={classes.rootContainer}>
        <Typography className={classes.mainHeader}>
          {t('schedule.heading')}
        </Typography>
        <Typography className={classes.headerDesc}>
          {t('schedule.headingDesc')}
        </Typography>
        <div className={classes.root}>
          <div className={classes.scHeader}>
            {/* Upper segment */}
            <div className={classes.scSegments}>
              <div>
                <Typography className={classes.headerText}>
                  <strong>{t('schedule.headingText')}</strong>
                </Typography>

                <div className={classes.schBody}>
                  <Typography align="left" className={classes.description}>
                    {t('schedule.description')}
                  </Typography>
                </div>
              </div>
              <img
                src="./icons/calendar.svg"
                alt="calendar"
                className={classes.calIcon}
              />
            </div>
            <Divider />

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
                        {t('schedule.scheduleNow')}
                      </Typography>
                    }
                  />

                  <FormControlLabel
                    value="afterSometime"
                    control={<Radio />}
                    label={
                      <Typography className={classes.radioText}>
                        {t('schedule.scheduleAfter')}
                      </Typography>
                    }
                  />
                  {value === 'afterSometime' ? (
                    <div className={classes.schLater}>
                      <Typography className={classes.captionText}>
                        {t('schedule.scheduleAfterSometime')}
                      </Typography>
                      <div className={classes.wtDateTime}>
                        <Typography
                          variant="body2"
                          className={classes.captionText}
                        >
                          {t('schedule.after')}
                        </Typography>

                        <SetTime
                          start={start}
                          end={end}
                          interval={interval}
                          label="Days"
                          type="days"
                        />
                        <CustomTime
                          handleDateChange={handleDateChange}
                          value={selectedDate}
                          ampm
                          disabled={false}
                        />
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
                        {t('schedule.scheduleSpecificTime')}
                      </Typography>
                    }
                  />

                  {value === 'specificTime' ? (
                    <div className={classes.schLater}>
                      <Typography className={classes.captionText}>
                        {t('schedule.scheduleFuture')}
                      </Typography>
                      <div className={classes.innerSpecific}>
                        <CustomDate
                          selectedDate={selectedDate}
                          handleDateChange={handleDateChange}
                          disabled={false}
                        />
                        <CustomTime
                          handleDateChange={handleDateChange}
                          value={selectedDate}
                          ampm
                          disabled={false}
                        />
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
                        {t('schedule.scheduleRecurring')}
                      </Typography>
                    }
                  />
                  {value === 'recurringScedule' ? (
                    <div className={classes.schLater}>
                      <Typography className={classes.captionText}>
                        {t('schedule.scheduleRecurringTime')}
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
                                    {t('schedule.At')}
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
                                    {t('schedule.At')}
                                  </Typography>
                                  <CustomTime
                                    handleDateChange={handleDateChange}
                                    value={selectedDate}
                                    ampm
                                    disabled={false}
                                  />
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
                                    {t('schedule.scheduleOn')}
                                  </Typography>
                                  <FormControl
                                    className={classes.formControlDT}
                                  >
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
                                        <option
                                          className={classes.opt}
                                          value={day}
                                        >
                                          {day}
                                        </option>
                                      ))}
                                    </Select>
                                  </FormControl>
                                  <Typography className={classes.scRandsub1}>
                                    {t('schedule.at')}
                                  </Typography>
                                  <CustomTime
                                    handleDateChange={handleDateChange}
                                    value={selectedDate}
                                    ampm
                                    disabled={false}
                                  />
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
                                    {t('schedule.scheduleOn')}
                                  </Typography>
                                  <FormControl
                                    className={classes.formControlMonth}
                                  >
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
                                    {t('schedule.at')}
                                  </Typography>
                                  <CustomTime
                                    handleDateChange={handleDateChange}
                                    value={selectedDate}
                                    ampm
                                    disabled={false}
                                  />
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
            <Divider />
            <div className={classes.submitDiv}>
              <ButtonOutline isDisabled={false} handleClick={() => {}}>
                <Typography>Cancel</Typography>
              </ButtonOutline>
              <div style={{ marginLeft: 'auto' }}>
                <ButtonFilled isPrimary handleClick={() => {}}>
                  <Typography>{t('schedule.save')}</Typography>
                </ButtonFilled>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Scaffold>
  );
};

export default SchedulePage;
