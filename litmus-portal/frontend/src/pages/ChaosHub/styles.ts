import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    margin: '0 auto',
  },
  mainDiv: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginTop: theme.spacing(3),
  },
  header: {
    width: '100%',
    color: theme.palette.text.primary,
    margin: theme.spacing(1, 0, 2.5, 0),
    display: 'flex',
    justifyContent: 'space-between',
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
  chartsGroup: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mainCardDiv: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cardDiv: {
    maxWidth: '12.5rem',
    border: `1px dashed ${theme.palette.border.main}`,
    borderRadius: '0.25rem',
    height: '100%',
    margin: theme.spacing(2),
  },
  cardDivChart: {
    '&:hover': {
      border: `1.1px solid ${theme.palette.primary.light}`,
      cursor: 'pointer',
    },
    borderRadius: theme.spacing(0.375),
    margin: theme.spacing(2, 2, 2, 0),
  },
  connected: {
    height: '1.625rem',
    width: '5.5rem',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.secondary,
    fontSize: '0.625rem',
    borderRadius: theme.spacing(0.375),
  },
  error: {
    padding: theme.spacing(0.375, 1.25, 0.375, 1.25),
    backgroundColor: theme.palette.error.dark,
    color: theme.palette.text.secondary,
    fontSize: '0.625rem',
    borderRadius: theme.spacing(0.375),
    marginBottom: theme.spacing(1),
  },
  connectHub: {
    fontSize: '1.125rem',
  },
  connectNewHub: {
    marginRight: theme.spacing(5),
  },
  noHub: {
    marginTop: theme.spacing(2.5),
  },
  iconButton: {
    marginTop: theme.spacing(-0.75),
    marginLeft: theme.spacing(8.125),
  },
  hubImage: {
    maxHeight: '70px',
    maxWidth: '70px',
  },
  cardMenu: {
    display: 'flex',
    flexDirection: 'row',
  },
  editImg: {
    marginRight: theme.spacing(1.25),
  },
  disconnectImg: {
    marginRight: theme.spacing(1.25),
    width: '0.9375rem',
    height: '0.9375rem',
    marginTop: theme.spacing(0.375),
  },
  disconnectText: {
    color: theme.palette.error.dark,
  },
  disconnectHeader: {
    fontSize: '2.125rem',
    fontWeight: 400,
    marginBottom: theme.spacing(2.5),
    marginTop: theme.spacing(2.5),
    width: '31.25rem',
  },
  disconnectConfirm: {
    fontSize: '1.25rem',
    marginBottom: theme.spacing(5),
    width: '31.25rem',
  },
  modalDiv: {
    display: 'flex',
    flexDirection: 'column',
    height: '25rem',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disconnectBtns: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '16rem',
  },
  cardOption: {
    color: theme.palette.text.primary,
    opacity: 0.6,
  },
  refreshImg: {
    width: '0.9375rem',
    height: '0.9375rem',
    marginRight: theme.spacing(1.25),
    marginTop: theme.spacing(0.375),
  },
  cardHeader: {
    margin: 'auto',
    display: 'block',
  },
  statusText: {
    fontSize: '0.75rem',
    textAlign: 'center',
  },
  cardContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hubName: {
    fontSize: '0.9375rem',
    marginTop: theme.spacing(1.25),
  },
  totalExp: {
    fontSize: '0.8125rem',
    marginTop: theme.spacing(0.625),
    color: theme.palette.text.hint,
  },
  syncText: {
    textAlign: 'center',
    fontSize: '0.813rem',
    marginTop: theme.spacing(0.625),
  },
  lastSyncDiv: {
    marginTop: theme.spacing(3.75),
  },
  lastSyncText: {
    fontSize: '0.75rem',
    color: theme.palette.text.hint,
  },
}));

export default useStyles;
