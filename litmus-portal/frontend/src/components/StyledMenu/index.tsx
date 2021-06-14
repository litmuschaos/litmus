import Menu, { MenuProps } from '@material-ui/core/Menu';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';

export const StyledMenu = withStyles({
  paper: {
    boxShadow:
      '0px 0.6px 1.8px rgba(0, 0, 0, 0.1), 2px 3.2px 7.2px rgba(0, 0, 0, 0.13)',
    borderRadius: 3,
  },
})((props: MenuProps) => <Menu {...props} />);
