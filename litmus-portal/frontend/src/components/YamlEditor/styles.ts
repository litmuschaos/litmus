import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  // Editor

  editorButtonGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '95%',
    margin: '0 auto',
  },

  editor: {
    width: '100%',
    height: '50vh',

    '&::-webkit-scrollbar': {
      width: '0.2em',
    },
    '&::-webkit-scrollbar-track': {
      webkitBoxShadow: `inset 0 0 6px ${theme.palette.common.black}`,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.primary.main,
    },

    '& #code': {
      padding: '1rem 0',
    },

    '& #yaml-editor': {
      overflowY: 'auto',
      width: '100%',
      height: '100%',
      position: 'relative',
    },
  },

  editorButtons: {
    width: '2rem',
    height: '1rem',
    margin: theme.spacing(0, 1, 0, 0),
  },
}));

export default useStyles;
