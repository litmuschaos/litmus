import { Grid, Switch, Typography } from '@material-ui/core';
import { createStyles, Theme, withStyles } from '@material-ui/core/styles';
import React from 'react';

const AntSwitch = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '1.75rem',
      height: '1rem',
      padding: 0,
      display: 'flex',
    },
    switchBase: {
      padding: '0.125rem',
      color: theme.palette.grey[500],
      '&$checked': {
        transform: 'translateX(12px)',
        color: theme.palette.common.white,
        '& + $track': {
          opacity: 1,
          backgroundColor: theme.palette.secondary.dark,
          borderColor: theme.palette.secondary.dark,
        },
      },
    },
    thumb: {
      width: '0.75rem',
      height: '0.75rem',
      boxShadow: 'none',
    },
    track: {
      border: `1px solid ${theme.palette.grey[500]}`,
      borderRadius: 'calc(1rem / 0.125rem)',
      opacity: 1,
      backgroundColor: theme.palette.common.white,
    },
    checked: {},
  })
)(Switch);

interface BinarySwitchProps {
  handleChange:
    | ((event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void)
    | undefined;
  checked: boolean;
  leftLabel: string;
  rightLabel: string;
}

const BinarySwitch: React.FC<BinarySwitchProps> = ({
  handleChange,
  checked,
  leftLabel,
  rightLabel,
}) => {
  return (
    <Typography component="div">
      <Grid
        component="label"
        container
        alignItems="center"
        justify="center"
        spacing={1}
      >
        <Grid item>{leftLabel}</Grid>
        <Grid item>
          <AntSwitch
            checked={checked}
            onChange={handleChange}
            name="checkedC"
          />
        </Grid>
        <Grid item>{rightLabel}</Grid>
      </Grid>
    </Typography>
  );
};

export default BinarySwitch;
