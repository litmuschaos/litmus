import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    display: 'flex',
  },
  usefulLinks: {
    textAlign: 'left',
  },
  heading: {
    fontSize: '1.125rem',
    marginBottom: theme.spacing(1.125),
    fontWeight: 'bold',
    color: theme.palette.common.black,
  },
  linkDiv: {
    display: 'flex',
    flexDirection: 'row',
  },
  createLinkText: {
    textDecoration: 'none',
  },
  linkType: {
    fontSize: '0.875rem',
    marginBottom: theme.spacing(1.25),
    color: theme.palette.primary.dark,
  },
  linkListBox: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  staticType: {
    fontSize: '0.875rem',
    marginBottom: theme.spacing(1.25),
    color: theme.palette.text.primary,
  },
  mainDiv: {
    padding: theme.spacing(3.75),
    justifyContent: 'space-around',
    borderRadius: theme.spacing(1.25),
    borderLeft: `1px solid ${theme.palette.border.main}`,
    paddingBottom: theme.spacing(2.5),
  },
  maintainerField: {
    borderRadius: theme.spacing(1.125),
  },
  maintainerlinks: {
    fontSize: '0.875rem',
    marginBottom: theme.spacing(0.875),
    color: theme.palette.primary.dark,
  },
}));
export default useStyles;
