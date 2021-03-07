import { makeStyles } from '@material-ui/core';

interface StyleProps {
  isDisabled?: boolean;
}

const useStyles = makeStyles((theme) => ({
  createCardRoot: {
    height: '100%',
    width: '100%',

    pointerEvents: (props: StyleProps) => (props.isDisabled ? 'none' : 'all'),
    boxShadow: (props: StyleProps) =>
      props.isDisabled ? '' : `0px 4px 12px ${theme.palette.highlight}40`,
    border: (props: StyleProps) =>
      props.isDisabled
        ? `1px solid ${theme.palette.text.disabled}`
        : `1px solid ${theme.palette.highlight}`,
    boxSizing: 'border-box',
  },
  createCardAction: {
    position: 'relative',
    color: (props: StyleProps) =>
      props.isDisabled
        ? theme.palette.text.disabled
        : theme.palette.text.primary,
    borderRadius: '0.2',
    padding: theme.spacing(4),
    widht: '100%',
    height: '100%',
  },

  createCardTitle: {
    verticalAlign: 'middle',
    color: (props: StyleProps) =>
      props.isDisabled ? theme.palette.text.disabled : theme.palette.highlight,
    fontWeight: 700,
    fontSize: '1.5rem',
    lineHeight: '1.8rem',
  },

  createCardHeading: {
    position: 'absolute',
    top: theme.spacing(6),
    fontSize: '0.875rem',
  },

  arrowForwardIcon: {
    position: 'absolute',
    color: theme.palette.highlight,
    float: 'right',

    bottom: theme.spacing(4),
    right: theme.spacing(4),
  },
}));

export default useStyles;
