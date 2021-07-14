import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  rootContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  mainDiv: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  expInfoDiv: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: theme.spacing(2.5),
    paddingRight: theme.spacing(2.5),
    width: '100%',
  },
  info: {
    margin: '0 auto',
    marginLeft: 'auto',
    width: '30%',
  },
  note: {
    marginTop: theme.spacing(4),
    fontWeight: 'bold',
    fontSize: '1rem',
    marginBottom: theme.spacing(2),
    color: theme.palette.common.black,
  },
  installLinks: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2.25),
  },
  headerDiv: {
    marginLeft: theme.spacing(0, 625),
    marginTop: theme.spacing(3.75),
  },
  expMain: {
    marginBottom: theme.spacing(2),
  },
  linkText: {
    fontSize: '1rem',
  },
  developerDiv: {
    marginLeft: theme.spacing(2.5),
    marginTop: theme.spacing(4.25),
  },
  detailDiv: {
    backgroundColor: theme.palette.common.white,
    border: `1px solid ${theme.palette.border.main}`,
    borderRadius: '0.1875rem',
    padding: theme.spacing(3.75),
    paddingTop: theme.spacing(6.25),
  },
  expInfo: {
    display: 'flex',
    flexDirection: 'row',
  },
  horizontalLine: {
    marginTop: theme.spacing(5),
    marginRight: theme.spacing(12.5),
    border: `0.5px solid ${theme.palette.border.main}`,
    boxSizing: 'border-box',
  },
  installExp: {
    marginTop: 'auto',
    marginBottom: theme.spacing(5),
  },
}));
export default useStyles;
