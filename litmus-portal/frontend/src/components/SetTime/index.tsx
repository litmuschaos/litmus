import {
  Button,
  Fade,
  FormControl,
  Menu,
  MenuItem,
  TextField,
} from '@material-ui/core';
import React from 'react';
import useStyles from './styles';

interface SetTimeProps {
  start: number;
  end: number;
  interval: number;
  label: string;
  type: string;
}

// dropdown menu component for setting time
const SetTime: React.FC<SetTimeProps> = ({
  start,
  end,
  interval,
  label,
  type,
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [age, setAge] = React.useState(0);
  const open = Boolean(anchorEl);
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setAge((event.target.value as unknown) as number);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const size = (end - start) / interval;

  const names: number[] = [start];
  for (let i = 1; i <= size; i += 1) {
    names[i] = names[i - 1] + interval;
  }

  return (
    <div>
      <FormControl>
        <TextField
          className={classes.textField}
          id="outlined-basic"
          variant="outlined"
          value={age}
          onChange={handleChange}
          color="secondary"
          inputProps={{
            style: {
              fontSize: '0.75rem',
              color: '#000000',
              paddingLeft: 27,
              height: '0.425rem',
            },
            'aria-label': 'change-time',
          }}
        />
      </FormControl>
      <Button
        className={classes.button}
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
        }}
        endIcon={<img src="./icons/down-arrow.svg" alt="arrow" />}
        disableRipple
        disableFocusRipple
      >
        {label}
      </Button>
      <Menu
        id="fade-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        {names.map((name) => (
          <MenuItem
            key={name}
            value={name}
            onClick={() => {
              setAge(name);
              setAnchorEl(null);
            }}
          >
            {name} {type}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};
export default SetTime;
