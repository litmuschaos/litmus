import { makeStyles } from '@material-ui/core';

interface StyleProps {
  isDisabled?: boolean;
}

const useStyles = makeStyles((theme) => ({
  createCardAction: {
    width: '15.375rem',
    color: (props: StyleProps) =>
      props.isDisabled
        ? theme.palette.text.disabled
        : theme.palette.text.primary,
    borderRadius: '0.1875rem',
    padding: theme.spacing(3.75),
    height: '22.5rem',
  },

  createCardTitle: {
    color: (props: StyleProps) =>
      props.isDisabled ? theme.palette.text.disabled : theme.palette.highlight,
    fontWeight: 700,
    marginTop: theme.spacing(10),
    fontSize: '1.5rem',
    lineHeight: '130%',
  },

  createCardHeading: {
    fontSize: '0.875rem',
  },

  createCard: {
    marginLeft: theme.spacing(5),
    pointerEvents: (props: StyleProps) => (props.isDisabled ? 'none' : 'all'),
    boxShadow: (props: StyleProps) =>
      props.isDisabled ? '' : `0px 4px 12px ${theme.palette.highlight}40`,
    border: (props: StyleProps) =>
      props.isDisabled
        ? `1px solid ${theme.palette.text.disabled}`
        : `1px solid ${theme.palette.highlight}`,
    boxSizing: 'border-box',
  },

  arrowForwardIcon: {
    color: theme.palette.highlight,
    marginLeft: theme.spacing(17.5),
    marginTop: theme.spacing(12.5),
  },
}));

export default useStyles;
