import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  // Editor
  editor: {
    width: '100%',
    height: 'fit-content',
    paddingTop: theme.spacing(1.5),

    '&::-webkit-scrollbar': {
      width: '0.2em',
    },
    '&::-webkit-scrollbar-track': {
      webkitBoxShadow: `inset 0 0 6px ${theme.palette.common.black}`,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.primary.main,
    },

    '& #prom-query-editor': {
      overflowY: 'auto',
      width: '100%',
      height: '100%',
      position: 'relative',
      border: `1.5px solid ${theme.palette.border.main}`,
      borderRadius: '0.25rem',
      margin: 0,
    },
  },

  heading: {
    color: theme.palette.text.hint,
    fontSize: '0.7rem',
    lineHeight: '160%',
    zIndex: 2,
    position: 'relative',
    background: theme.palette.background.paper,
    width: 'fit-content',
    margin: theme.spacing(0, 0, -1, 1.25),
    padding: theme.spacing(0, 0.5),
  },
}));

export default useStyles;
