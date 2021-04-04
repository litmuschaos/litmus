import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  rootContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '90%',
  },
  mainDiv: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  expInfoDiv: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
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
    color: theme.palette.common.black,
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(4),
  },
  installLinks: {
    marginLeft: theme.spacing(2.25),
    marginTop: theme.spacing(2),
  },
  headerDiv: {
    marginLeft: theme.spacing(0, 625),
    marginTop: theme.spacing(3.75),
  },
  expMain: {
    marginLeft: theme.spacing(1.25),
  },
  linkText: {
    fontSize: '1rem',
  },
  developerDiv: {
    marginLeft: theme.spacing(2.5),
    marginTop: theme.spacing(6.25),
  },
  detailDiv: {
    backgroundColor: theme.palette.common.white,
    border: `1px solid ${theme.palette.border.main}`,
    borderRadius: '0.1875rem',
    marginLeft: theme.spacing(2.5),
    padding: theme.spacing(3.75),
    paddingTop: theme.spacing(6.25),
  },
  expInfo: {
    display: 'flex',
    flexDirection: 'row',
  },
  horizontalLine: {
    border: `0.5px solid ${theme.palette.border.main}`,
    boxSizing: 'border-box',
    marginRight: theme.spacing(12.5),
    marginTop: theme.spacing(5),
  },
  installExp: {
    marginBottom: theme.spacing(5),
    marginTop: 'auto',
  },
}));
export default useStyles;
