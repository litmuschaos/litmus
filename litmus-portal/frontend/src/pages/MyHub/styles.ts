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
    // background: theme.palette.modal.backdrop,
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
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.cards.background}`,
    padding: theme.spacing(5),
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
    height: '1.875rem',
  },
  cardDiv: {
    maxWidth: '12.5rem',
    border: `1px dashed ${theme.palette.border.main}`,
    borderRadius: '0.25rem',
    height: '100%',
    margin: theme.spacing(2),
  },
  cardDivChart: {
    width: '12.5rem',
    border: `1px solid ${theme.palette.cards.background}`,
    '&:hover': {
      border: `1.1px solid ${theme.palette.primary.light}`,
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
    backgroundColor: theme.palette.background.paper,
    alignItems: 'center',
    flexDirection: 'column',
    margin: '0 auto',
  },
  connected: {
    padding: theme.spacing(0.375, 1.25, 0.375, 1.25),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.secondary,
    fontSize: '0.625rem',
    borderRadius: theme.spacing(0.375),
    marginBottom: theme.spacing(1),
  },
  error: {
    padding: theme.spacing(0.375, 1.25, 0.375, 1.25),
    backgroundColor: theme.palette.error.dark,
    color: theme.palette.text.secondary,
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
    border: `1px solid  ${theme.palette.border.main}`,
    width: '95%',
    marginTop: theme.spacing(1.25),
    marginBottom: theme.spacing(1.25),
  },
  failedBtn: {
    backgroundColor: theme.palette.error.dark,
    color: theme.palette.text.secondary,
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
}));

export default useStyles;
