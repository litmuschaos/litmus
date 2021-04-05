import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  tableMain: {
    background: theme.palette.cards.header,
    maxHeight: '30rem',
    '&::-webkit-scrollbar': {
      width: '0.2em',
    },
    '&::-webkit-scrollbar-track': {
      webkitBoxShadow: `inset 0 0 6px ${theme.palette.common.black}`,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.primary.main,
    },
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '& td': {
      borderBottom: `1px solid ${theme.palette.border.main}`,
    },
  },

  tableBody: {
    background: theme.palette.cards.header,
  },

  tableHead: {
    background: theme.palette.cards.header,
  },

  nameHead: {
    color: theme.palette.text.hint,
    margin: theme.spacing(2, 0, 1.5),
    fontSize: '0.875rem',
    lineHeight: '150%',
    fontWeight: 500,
    letterSpacing: '0.02em',
  },

  tableObjects: {
    paddingLeft: theme.spacing(1),
    color: theme.palette.text.primary,
    height: '1.75rem',
    marginTop: theme.spacing(2),
    fontSize: '0.875rem',
    lineHeight: '130%',
  },

  headSpacing: {
    paddingLeft: theme.spacing(2.5),
  },

  nameContent: {
    color: theme.palette.text.primary,
    display: 'flex',
    flexDirection: 'row',
    fontSize: '0.8rem',
  },

  checkbox: {
    paddingLeft: theme.spacing(2.5),
    paddingTop: theme.spacing(0.5),
  },

  noRecords: {
    height: '10rem',
    display: 'flex',
    padding: theme.spacing(5, 3),
    justifyContent: 'center',
  },

  cloudIcon: {
    height: '5rem',
    width: '5rem',
  },

  noRecordsText: {
    color: theme.palette.text.hint,
    padding: theme.spacing(2),
    fontSize: '1.5rem',
  },

  passColor: {
    color: theme.palette.success.main,
  },

  failColor: {
    color: theme.palette.error.main,
  },

  awaitedColor: {
    color: theme.palette.text.hint,
  },

  colorBar: {
    height: '0.45rem',
    width: '2.75rem',
    marginTop: theme.spacing(0.75),
    marginLeft: theme.spacing(0.75),
  },
}));

export default useStyles;
