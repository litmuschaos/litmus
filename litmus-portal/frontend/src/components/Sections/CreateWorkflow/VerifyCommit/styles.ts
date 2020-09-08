import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    width: '80%',
    margin: '0 auto',
    border: 1,
    borderColor: theme.palette.text.disabled,
    borderRadius: 3,
    padding: theme.spacing(2),
  },
  suHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-even',
  },
  headerText: {
    marginTop: theme.spacing(1.25),
    fontSize: '1.5625rem',
  },
  description: {
    marginTop: theme.spacing(3.25),
    marginBottom: theme.spacing(7.5),
    fontSize: '1.0625rem',
  },
  suBody: {
    width: '40%',
  },
  bfinIcon: {
    width: '7rem',
    height: '6.31rem',
    marginTop: theme.spacing(5),
    marginLeft: theme.spacing(25),
  },
  outerSum: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
  },
  summaryDiv: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginTop: theme.spacing(3),
  },
  innerSumDiv: {
    width: '7.625rem',
  },
  sumText: {
    marginTop: theme.spacing(7.5),
    marginBottom: theme.spacing(3),
    fontSize: '1.5rem',
  },
  col1: {
    fontSize: '1rem',
    color: theme.palette.secondary.dark,
  },
  col2: {
    marginLeft: theme.spacing(5),
  },
  schCol2: {
    marginLeft: theme.spacing(5),
    display: 'flex',
    flexDirection: 'row',
  },
  editButton1: {
    marginLeft: theme.spacing(43.75),
  },
  link: {
    fontSize: '0.875rem',
    color: theme.palette.secondary.dark,
  },
  adjWeights: {
    display: 'flex',
    flexDirection: 'row',
  },
  config: {
    height: '3rem',
    fontSize: '0.9375rem',
    color: theme.palette.text.disabled,
    width: '30rem',
    marginTop: theme.spacing(3.75),
    marginLeft: theme.spacing(30),
  },
  typoCol2: {
    fontSize: '1rem',
  },
  textEdit: {
    marginTop: theme.spacing(7.5),
  },
  buttonOutlineText: {
    padding: theme.spacing(1.5),
  },
  errorText: {
    fontSize: '1rem',
    color: 'red',
    marginLeft: theme.spacing(5),
  },
  yamlFlex: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(5),
  },
  yamlButton: {
    width: theme.spacing(1.5),
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(-2),
  },
  progress: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: theme.spacing(5),
    width: theme.spacing(79.5),
  },
}));
export default useStyles;
