import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '95%',
    fontSize: '1rem',
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(8),
    marginTop: theme.spacing(4),
  },
  linkBox: {
    border: '1px solid ',
    borderColor: theme.palette.customColors.black(0.07),
    backgroundColor: theme.palette.common.white,
    borderRadius: '0.1875rem',
    padding: theme.spacing(6),
    paddingRight: theme.spacing(9),
    display: 'flex',
    flexDirection: 'row',
    wordWrap: 'break-word',
    justifyContent: 'space-between',
  },
  copiedDiv: {
    textalign: 'center',
    backgroundColor: theme.palette.primary.dark,
  },
  buttonBox: {
    display: 'flex',
    paddingLeft: theme.spacing(3),
    paddingTop: theme.spacing(2.5),
  },
  copyText: {
    display: 'flex',
  },
  yamlLink: {
    width: '90%',
    whiteSpace: 'pre-wrap',
    paddingTop: '10px',
    fontSize: '1rem',
  },
  done: {
    color: theme.palette.text.primary,
    paddingRight: theme.spacing(1),
  },
  copying: {
    paddingRight: theme.spacing(1),
  },
}));

export default useStyles;
