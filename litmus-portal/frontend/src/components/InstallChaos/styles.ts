import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '95%',
    fontSize: '1.125rem',
    color: theme.palette.text.primary,
    margin: theme.spacing(2, 2),
  },

  title: {
    fontSize: '1rem',
    marginBottom: theme.spacing(2),
    fontWeight: 'bold',
    margin: theme.spacing(1, 0),
  },

  description: {
    margin: theme.spacing(1, 0),
    fontSize: '1rem',
    marginBottom: theme.spacing(2),
  },

  rowDiv: {
    display: 'flex',
    flexDirection: 'row',
  },

  copyBtnImg: {
    paddingRight: '0.625rem',
  },

  linkBox: {
    border: `1px solid ${theme.palette.border.main} `,
    padding: theme.spacing(3.75),
    borderRadius: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
    wordWrap: 'break-word',
    justifyContent: 'space-between',
  },

  buttonBox: {
    padding: theme.spacing(1.25),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  yamlLink: {
    width: '90%',
    whiteSpace: 'pre-wrap',
    paddingTop: theme.spacing(1),
    fontSize: '0.9375rem',
  },

  done: {
    color: theme.palette.text.primary,
    paddingRight: theme.spacing(0.625),
  },

  btnImg: {
    paddingRight: theme.spacing(1.25),
  },
}));
export default useStyles;
