import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  mainDiv: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginTop: theme.spacing(3),
  },
  header: {
    width: '100%',
    color: theme.palette.text.primary,
    margin: theme.spacing(4.5, 0, 2.5, 0),
  },
  backdrop: {
    background: theme.palette.disabledBackground,
    display: 'flex',
    flexDirection: 'column',
  },
  noGithubAccount: {
    margin: 'auto',
    height: '100%',
    width: '25rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    width: '100%',
    height: '5.625rem',
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.common.white,
  },
  search: {
    fontSize: '1rem',
    marginRight: 'auto',
    borderBottom: `1px solid ${theme.palette.border.main}`,
    marginLeft: theme.spacing(6.25),
  },
  noGitHubText: {
    textAlign: 'center',
    paddingTop: theme.spacing(2.5),
    paddingBottom: theme.spacing(2.5),
  },
  githubConfirmed: {
    display: 'flex',
    flexDirection: 'column',
  },
  chartsGroup: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing(3),
    paddingTop: theme.spacing(2),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.palette.common.white,
  },
  cardDiv: {
    width: '12.5rem',
    height: '12.5rem',
    border: '1px solid rgba(0, 0, 0, 0.2)',
    '&:hover': {
      border: `1.8px solid ${theme.palette.primary.light}`,
      cursor: 'pointer',
    },
    borderRadius: theme.spacing(0.5),
    margin: theme.spacing(2),
  },
  cardContent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: theme.palette.common.white,
  },
  cardImage: {
    marginTop: theme.spacing(1.5),
    width: '5rem',
    height: '5rem',
  },
  categoryName: {
    marginTop: theme.spacing(2),
    fontSize: '1rem',
    color: theme.palette.primary.dark,
  },
  expName: {
    fontSize: '0.875rem',
  },
  lastSyncText: {
    marginTop: theme.spacing(1.875),
    fontSize: '0.875rem',
  },
  MuiAccordionroot: {
    '&.MuiAccordion-root:before': {
      backgroundColor: theme.palette.common.white,
    },
  },
  noExp: {
    margin: theme.spacing(6),
  },
  chartAccordion: {
    marginTop: theme.spacing(2.5),
  },
  appBar: {
    background: 'transparent',
    boxShadow: 'none',
    marginBottom: theme.spacing(1),
  },
  noExpImage: {
    width: '5rem',
    height: '5rem',
  },
}));

export default useStyles;
