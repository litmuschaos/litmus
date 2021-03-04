import { makeStyles, Theme } from '@material-ui/core';

interface StyleProps {
  isDisabled?: boolean;
}
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: theme.spacing(1, 0),
    padding: theme.spacing(1, 1),
    display: 'flex',
    width: '100%',
    height: '100%',
    minWidth: '30rem',
  },

  textSection: {
    height: 'fit-content',
    width: '60%',
    margin: theme.spacing(0, 3),
    alignSelf: 'center',
  },

  heading: (props: StyleProps) => ({
    fontSize: '1.4rem',
    width: '95%',
    display: 'inline-block',
    marginBottom: theme.spacing(5),
    color: props.isDisabled
      ? theme.palette.warning.main
      : theme.palette.highlight,
  }),

  description: {
    display: 'inline-block',
    color: theme.palette.text.hint,
    fontSize: '0.9rem',
    maxWidth: '95%',
  },
  configurationIcon: (props: StyleProps) => ({
    fill: props.isDisabled
      ? theme.palette.warning.main
      : theme.palette.primary.light,

    stroke: props.isDisabled
      ? theme.palette.warning.main
      : theme.palette.primary.light,
    '& path': {
      opacity: props.isDisabled ? 0.7 : 1,
    },
    '& circle': {
      opacity: props.isDisabled ? 0.2 : 0.7,
    },

    padding: theme.spacing(6),
    width: '40%',
    height: '100%',
  }),
}));

export default useStyles;
