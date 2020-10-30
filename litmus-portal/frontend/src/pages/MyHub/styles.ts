import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  mainDiv: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    marginTop: theme.spacing(3),
  },
  header: {
    width: '100%',
    color: theme.palette.text.primary,
    margin: theme.spacing(4.5, 1.5, 2.5, 1.5),
  },
  backdrop: {
    background: theme.palette.input.disabled,
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
  noGitHubText: {
    textAlign: 'center',
    paddingTop: theme.spacing(2.5),
    paddingBottom: theme.spacing(2.5),
  },
  githubConfirmed: {
    display: 'flex',
    flexDirection: 'column',
  },
  detailsDiv: {
    flexGrow: 1,
    backgroundColor: theme.palette.common.white,
    border: `1px solid ${theme.palette.customColors.black(0.05)}`,
    padding: theme.spacing(5),
  },
  chartsGroup: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cardDiv: {
    maxWidth: '12.5rem',
    border: `1px dashed ${theme.palette.customColors.black(0.5)}`,
    borderRadius: '0.25rem',
    height: '100%',
    margin: theme.spacing(2),
  },
  cardDivChart: {
    width: '12.5rem',
    border: `1px solid ${theme.palette.customColors.black(0.2)}`,
    '&:hover': {
      border: `1.1px solid ${theme.palette.secondary.dark}`,
      cursor: 'pointer',
      borderRadius: theme.spacing(0.375),
    },
    borderRadius: theme.spacing(0.375),
    margin: theme.spacing(2),
  },
  cardContent: {
    height: '17.625rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    margin: '0 auto',
    backgroundColor: theme.palette.common.white,
  },
  connected: {
    marginLeft: 'auto',
    padding: theme.spacing(0.375, 1.25, 0.375, 1.25),
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.common.white,
    fontSize: '0.625rem',
    borderRadius: theme.spacing(0.375),
    marginBottom: theme.spacing(1),
  },
  error: {
    marginLeft: 'auto',
    padding: theme.spacing(0.375, 1.25, 0.375, 1.25),
    backgroundColor: theme.palette.error.dark,
    color: theme.palette.common.white,
    fontSize: '0.625rem',
    borderRadius: theme.spacing(0.375),
    marginBottom: theme.spacing(1),
  },
  videoDescription: {
    marginTop: theme.spacing(-6.25),
    marginLeft: theme.spacing(5.625),
    width: '18.75rem',
    marginBottom: theme.spacing(5),
    fontSize: '1rem',
  },
  horizontalLine: {
    border: `1px solid  ${theme.palette.customColors.black(0.3)}`,
    width: '95%',
    marginTop: theme.spacing(1.25),
    marginBottom: theme.spacing(1.25),
  },
  failedBtn: {
    backgroundColor: theme.palette.error.dark,
    color: theme.palette.common.white,
    textTransform: 'none',
    width: '100%',
    height: '2.8125rem',
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  },
  totalExp: {
    fontSize: '0.75rem',
  },
  connectHub: {
    fontSize: '0.875rem',
  },
  noHub: {
    marginTop: theme.spacing(2.5),
  },
  quickActionDiv: {
    marginLeft: theme.spacing(5.625),
  },
  root: {
    minWidth: '28.125rem',
    marginLeft: 'auto',
  },
  hubName: {
    marginTop: theme.spacing(1.25),
  },
  hubBranch: {
    fontSize: '0.875rem',
  },
}));

export default useStyles;
