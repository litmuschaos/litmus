import { createStyles, fade, makeStyles, Theme } from '@material-ui/core';

const useStylesLitmus = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      border: (props) =>
        props !== true
          ? `1px solid ${theme.palette.input.disabled}`
          : `1px solid ${theme.palette.primary.dark}`,
      borderRadius: '0.25rem',
      overflow: 'hidden',
      color: 'inherit',
      backgroundColor: theme.palette.homePageCardBackgroundColor,
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
      transition: theme.transitions.create(['border-color', 'box-shadow']),
      '&$error': {
        backgroundColor: theme.palette.homePageCardBackgroundColor,
      },
      '&:hover': {
        backgroundColor: theme.palette.homePageCardBackgroundColor,
        borderColor: (props) =>
          props !== true ? theme.palette.secondary.dark : '',
        boxShadow: (props) =>
          props !== true
            ? `${fade(theme.palette.secondary.dark, 0.5)} 0 0.3rem 0.4rem 0`
            : 'none',
      },
      '&$selected': {
        backgroundColor: theme.palette.homePageCardBackgroundColor,
        color: 'inherit',
      },
      '&$focused': {
        backgroundColor: theme.palette.homePageCardBackgroundColor,
        color: 'inherit',
      },
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
      '&$focused': {
        backgroundColor: theme.palette.homePageCardBackgroundColor,
        borderColor: theme.palette.error.main,
        color: theme.palette.error.main,
      },
      '&:hover': {
        borderColor: theme.palette.error.main,
        boxShadow: '',
      },
    },
    disabled: {
      backgroundColor: theme.palette.inputFieldDisabled,
    },
  })
);

const useStyles = makeStyles((theme) => ({
  error: {
    border: '0.0625rem solid',
    borderColor: theme.palette.error.main,
  },
  success: {
    border: '0.0625rem solid',
    borderColor: theme.palette.secondary.dark,
  },
  inputArea: {
    borderRadius: 3,
    marginTop: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    textDecoration: 'none',
    width: 'inherit',
  },
  passwordDiv: {
    margin: 0,
    padding: 0,
  },
}));

export { useStyles, useStylesLitmus };
