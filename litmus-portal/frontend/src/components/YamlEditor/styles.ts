import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  // Editor

  statusHeading: {
    marginTop: theme.spacing(-2.5),
    fontFamily: 'Ubuntu',
    fontSize: '1rem',
    marginLeft: theme.spacing(2),
  },

  statusDescription: {
    width: '100%',
    marginTop: theme.spacing(1.875),
    fontFamily: 'Ubuntu',
    fontSize: '0.875rem',
    marginLeft: theme.spacing(2),
  },

  editorBackgroundFull: {
    backgroundColor: '#161616',
    color: theme.palette.secondary.contrastText,
    width: '100%',
  },

  horizontalLineWhite: {
    marginTop: theme.spacing(4),
    backgroundColor: theme.palette.secondary.contrastText,
  },

  editorButtonGrid: {
    marginTop: theme.spacing(3),
    width: '100%',
  },

  editorContainer: {
    marginTop: theme.spacing(4),
  },

  editorGrid: {
    overflow: 'auto',
    maxHeight: '34.5rem',
    width: '92%',
  },

  extraSpace: {
    backgroundColor: '#161616',
    height: '2rem',
    width: '100%',
  },

  editorButtons: {
    borderRadius: 3,
    backgroundColor: '#161616',
    boxSizing: 'border-box',
    color: theme.palette.secondary.contrastText,
    borderColor: theme.palette.secondary.contrastText,
    paddingLeft: theme.spacing(3.125),
    width: '4rem',
    height: '2.75rem',
    marginLeft: theme.spacing(1.25),
  },

  editorButtonUndo: {
    borderRadius: 3,
    backgroundColor: '#161616',
    boxSizing: 'border-box',
    color: theme.palette.secondary.contrastText,
    borderColor: theme.palette.secondary.contrastText,
    paddingLeft: theme.spacing(3.125),
    width: '4rem',
    height: '2.75rem',
    marginLeft: theme.spacing(2.5),
  },

  editorButtonDownload: {
    borderRadius: 3,
    backgroundColor: '#161616',
    boxSizing: 'border-box',
    color: theme.palette.secondary.contrastText,
    borderColor: theme.palette.secondary.contrastText,
    paddingLeft: theme.spacing(3.125),
    width: '4rem',
    height: '2.75rem',
    marginLeft: theme.spacing(6.25),
  },

  editorButtonReplace: {
    borderRadius: 3,
    backgroundColor: '#161616',
    boxSizing: 'border-box',
    color: theme.palette.secondary.contrastText,
    borderColor: theme.palette.secondary.contrastText,
    paddingLeft: theme.spacing(3.125),
    width: '4rem',
    height: '2.75rem',
    marginLeft: theme.spacing(15.625),
  },

  editorButtonSelectAll: {
    borderRadius: 3,
    backgroundColor: '#161616',
    boxSizing: 'border-box',
    color: theme.palette.secondary.contrastText,
    borderColor: theme.palette.secondary.contrastText,
    paddingLeft: theme.spacing(3.125),
    width: '4rem',
    height: '2.75rem',
    marginLeft: theme.spacing(7.5),
  },

  editorButtonFullScreen: {
    borderRadius: 3,
    backgroundColor: '#161616',
    boxSizing: 'border-box',
    color: theme.palette.secondary.contrastText,
    borderColor: '#161616',
    paddingLeft: theme.spacing(3.75),
    paddingBottom: theme.spacing(1.875),
    width: '1.875rem',
    height: '1.875rem',
    marginLeft: theme.spacing(1.25),
  },

  saved: {
    width: '25rem',
    marginTop: theme.spacing(6),
    fontFamily: 'Ubuntu',
    fontSize: '1rem',
    color: theme.palette.secondary.dark,
    display: 'inline-block',
  },

  markStyle: {
    display: 'inline-block',
    fontFamily: 'Ubuntu',
    fontSize: '1rem',
  },

  fullScreenGrid: {
    width: '8%',
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
