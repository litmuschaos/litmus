import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.common.white,
    padding: theme.spacing(3, 3, 3, 6.5),
  },
  headingDiv: {
    justifyContent: 'space-between',
    display: 'flex',
    alignItems: 'center',
    width: '90%',
  },
  header: {
    fontSize: '1.25rem',
    fontWeight: 500,
  },
  headerDesc: {
    fontSize: '1rem',
    fontWeight: 400,
    color: theme.palette.text.hint,
  },
  closeBtn: {
    float: 'right',
  },
  tuneDiv: {
    marginTop: theme.spacing(2.5),
  },
  tuneName: {
    fontSize: '1rem',
    fontWeight: 500,
  },
  tuneDesc: {
    fontSize: '0.875rem',
    color: theme.palette.text.hint,
    width: '90%',
  },
  tunePropDiv: {
    marginTop: theme.spacing(3.75),
    display: 'flex',
    alignItems: 'center',
  },
  tuneHeaderDiv: {
    width: '90%',
    justifyContent: 'space-between',
    display: 'flex',
    alignItems: 'center',
  },
  hrDiv: {
    border: `1px solid ${theme.palette.text.hint}`,
    margin: theme.spacing(2.5, 0),
    width: '90%',
  },
  tunePropText: {
    marginRight: theme.spacing(2.5),
    width: '5rem',
  },
  podGCText: {
    marginRight: theme.spacing(2.5),
  },
  podGCSelect: {
    marginTop: theme.spacing(-2),
  },
  saveChangesBtn: {
    marginTop: theme.spacing(5),
  },
  hostName: {
    marginRight: theme.spacing(2.5),
  },
}));
export default useStyles;
