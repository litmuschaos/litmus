import { Grid, Switch, Typography } from '@material-ui/core';
import { createStyles, Theme, withStyles } from '@material-ui/core/styles';
import React from 'react';

const AntSwitch = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 28,
      height: 16,
      padding: 0,
      display: 'flex',
    },
    switchBase: {
      padding: 2,
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
      width: 12,
      height: 12,
      boxShadow: 'none',
    },
    track: {
      border: `1px solid ${theme.palette.grey[500]}`,
      borderRadius: 16 / 2,
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
