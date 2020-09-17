import { createStyles, fade, makeStyles, Theme } from '@material-ui/core';

const useStylesLitmus = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      border: (props) =>
        props !== true
          ? `1px solid ${theme.palette.input.disabled}`
          : `1px solid ${theme.palette.primary.dark}`,
      overflow: 'hidden',
      borderRadius: 4,
      color: 'inherit',
      backgroundColor: theme.palette.common.white,
      transition: theme.transitions.create(['border-color', 'box-shadow']),
      '&$error': {
        backgroundColor: theme.palette.common.white,
      },
      '&:hover': {
        backgroundColor: theme.palette.common.white,
        borderColor: (props) =>
          props !== true ? theme.palette.secondary.dark : '',
        boxShadow: (props) =>
          props !== true
            ? `${fade(theme.palette.secondary.dark, 0.5)} 0 0.3rem 0.4rem 0`
            : 'none',
      },
      '&$selected': {
        backgroundColor: theme.palette.common.white,
      },
      '&$focused': {
        backgroundColor: theme.palette.common.white,
        color: 'inherit',
      },
    },
    focused: {
      borderColor: (props) =>
        props === true
          ? theme.palette.primary.dark
          : theme.palette.secondary.dark,
      color: (props) =>
        props !== true
          ? theme.palette.secondary.dark
          : theme.palette.primary.dark,
    },
    selected: {
      borderColor: (props) =>
        props === true
          ? theme.palette.primary.dark
          : theme.palette.secondary.dark,
      color: (props) =>
        props !== false
          ? theme.palette.secondary.dark
          : theme.palette.primary.dark,
    },
    error: {
      borderColor: theme.palette.error.main,
      '&:hover': {
        borderColor: theme.palette.error.main,
        boxShadow: '',
      },
      '&$focused': {
        backgroundColor: theme.palette.common.white,
        borderColor: theme.palette.error.main,
        color: theme.palette.error.main,
      },
    },
    disabled: {
      backgroundColor: theme.palette.input.disabled,
    },
  })
);

const useStyles = makeStyles((theme) => ({
  success: {
    border: '0.0625rem solid',
    borderColor: theme.palette.secondary.dark,
  },
  error: {
    border: '0.0625rem solid',
    borderColor: theme.palette.error.main,
  },
  inputArea: {
    width: 'inherit',
    marginTop: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    textDecoration: 'none',
    borderRadius: 3,
  },
  passwordDiv: {
    margin: 0,
    padding: 0,
  },
}));

export { useStyles, useStylesLitmus };
