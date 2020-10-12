import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  // Editor

  statusHeadingInModal: {
    marginTop: theme.spacing(-2.5),
    fontSize: '1rem',
    marginLeft: theme.spacing(2.5),
    fontWeight: 500,
    lineHeight: '130%',
    paddingTop: theme.spacing(-4),
  },

  statusHeadingOutModal: {
    marginTop: theme.spacing(-2.5),
    fontSize: '1rem',
    marginLeft: theme.spacing(2.5),
    fontWeight: 500,
    lineHeight: '130%',
    paddingTop: theme.spacing(4),
  },

  statusDescription: {
    width: '95%',
    marginTop: theme.spacing(1.875),
    fontSize: '0.875rem',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    lineHeight: '160%',
  },

  editorBackgroundFull: {
    backgroundColor: theme.palette.editorBackground,
    color: theme.palette.secondary.contrastText,
    width: '100%',
  },

  horizontalLineWhite: {
    marginTop: theme.spacing(4),
    backgroundColor: theme.palette.customColors.white(0.2),
  },

  widthManager: {
    width: '98.5%',
  },

  editorButtonGrid: {
    marginTop: theme.spacing(3),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  editorContainer: {
    marginTop: theme.spacing(4),
  },

  editorGrid: {
    overflow: 'auto',
    height: '50vh',
    width: '100%',
    '&::-webkit-scrollbar': {
      width: '0.2em',
    },
    '&::-webkit-scrollbar-track': {
      webkitBoxShadow: `inset 0 0 6px ${theme.palette.common.black}`,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.secondary.dark,
    },
    [theme.breakpoints.down('xl')]: {
      height: '84vh',
    },
    [theme.breakpoints.down('lg')]: {
      height: '56vh',
    },
    [theme.breakpoints.down('md')]: {
      height: '49vh',
    },

    [theme.breakpoints.down('sm')]: {
      height: '40vh',
    },
    [theme.breakpoints.down('xs')]: {
      height: '30vh',
    },
  },

  extraSpace: {
    backgroundColor: theme.palette.editorBackground,
    height: '2rem',
    width: '100%',
  },

  editorButtons: {
    borderRadius: 3,
    backgroundColor: theme.palette.editorBackground,
    boxSizing: 'border-box',
    color: theme.palette.secondary.contrastText,
    borderColor: theme.palette.customColors.white(0.2),
    paddingLeft: theme.spacing(3.125),
    width: '4rem',
    height: '2.75rem',
    marginLeft: theme.spacing(1.25),
  },

  editorButtonGotoCopyUnfold: {
    [theme.breakpoints.down('xs')]: {
      marginLeft: 0,
      marginTop: theme.spacing(1.5),
    },
  },

  editorButtonFind: {
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(4.25),
    },
    [theme.breakpoints.down('xs')]: {
      marginLeft: theme.spacing(0.1),
      marginTop: theme.spacing(1.5),
    },
  },

  editorButtonFold: {
    [theme.breakpoints.down('xs')]: {
      marginLeft: theme.spacing(2.5),
      marginTop: theme.spacing(1.5),
    },
  },

  editorButtonUndo: {
    marginLeft: theme.spacing(2.5),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(4.25),
    },
    [theme.breakpoints.down('xs')]: {
      marginLeft: theme.spacing(0.1),
    },
  },

  editorButtonDownload: {
    marginLeft: theme.spacing(6.25),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(1.5),
    },
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(1),
    },
  },

  editorButtonReplace: {
    marginLeft: theme.spacing(15.625),
    [theme.breakpoints.down('xs')]: {
      marginLeft: theme.spacing(-0.5),
      marginTop: theme.spacing(1.5),
    },
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(1.3),
    },
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
    [theme.breakpoints.down('lg')]: {
      marginLeft: theme.spacing(5),
    },
  },

  editorButtonSelectAll: {
    marginLeft: theme.spacing(7.5),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(1.4),
    },
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(1),
    },
    [theme.breakpoints.down('lg')]: {
      marginRight: theme.spacing(2.5),
    },
    [theme.breakpoints.down('xs')]: {
      marginLeft: theme.spacing(1.5),
      marginTop: theme.spacing(1.5),
    },
    [theme.breakpoints.down('xl')]: {
      marginRight: theme.spacing(2),
    },
  },

  editorButtonFullScreen: {
    borderRadius: 3,
    backgroundColor: theme.palette.editorBackground,
    boxSizing: 'border-box',
    color: theme.palette.customColors.white(0.2),
    borderColor: theme.palette.editorBackground,
    paddingLeft: theme.spacing(3.75),
    paddingBottom: theme.spacing(1.875),
    marginTop: theme.spacing(-2),
    width: '1.875rem',
    height: '1.875rem',
    marginLeft: theme.spacing(-7.5),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(-2),
      width: 0,
      height: 0,
      padding: 0,
      border: 0,
    },
    [theme.breakpoints.down('xl')]: {
      width: 0,
      height: 0,
      padding: 0,
      border: 0,
      marginLeft: theme.spacing(-7.5),
    },
    [theme.breakpoints.down('lg')]: {
      width: 0,
      height: 0,
      padding: 0,
      border: 0,
      marginLeft: theme.spacing(-7.5),
    },
    [theme.breakpoints.down('md')]: {
      width: 0,
      height: 0,
      padding: 0,
      border: 0,
      marginLeft: theme.spacing(-7.5),
    },
  },

  saved: {
    width: '25rem',
    marginTop: theme.spacing(6),
    fontFamily: 'Ubuntu',
    fontSize: '1rem',
    color: theme.palette.secondary.dark,
    display: 'inline',
  },

  markStyleCorrect: {
    display: 'inline-block',
    fontFamily: 'Ubuntu',
    fontSize: '1rem',
    color: theme.palette.primary.dark,
  },

  markStyleWrong: {
    display: 'inline-block',
    fontFamily: 'Ubuntu',
    fontSize: '1rem',
    color: theme.palette.error.dark,
  },

  fullScreenGrid: {
    width: 0,
  },

  fullWidth: {
    width: '100%',
  },

  // Validations

  validationError: {
    position: 'absolute',
    background: 'rgba(202, 44, 44, 0.2)',
  },
}));

export default useStyles;
