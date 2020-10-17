import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  mainDiv: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    marginTop: theme.spacing(3),
  },
  root: {
    width: 450,
    marginLeft: 'auto',
  },
  header: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    color: theme.palette.text.primary,
    margin: theme.spacing(4.5, 1.5, 2.5, 1.5),
  },
  noGithubAccount: {
    margin: 'auto',
    height: '100%',
    width: 400,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noGitHubText: {
    textAlign: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  githubConfirmed: {
    display: 'flex',
    flexDirection: 'column',
  },
  detailsDiv: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    padding: 40,
  },
  cardDiv: {
    width: 200,
    border: '1px dashed #434343',
    borderRadius: 4,
  },
  cardContent: {
    height: 240,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  videoDescription: {
    marginTop: -50,
    marginLeft: 45,
    width: 300,
    marginBottom: 40,
    fontSize: '16px',
  },
}));

export default useStyles;
