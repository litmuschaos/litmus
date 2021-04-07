import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  horizontalLine: {
    background: theme.palette.border.main,
  },
  title: {
    padding: theme.spacing(0, 2),
    fontSize: '2rem',
    [theme.breakpoints.up('lg')]: {
      fontSize: '2.3rem',
    },
  },
  root: {
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    padding: theme.spacing(1, 2),
    margin: '1rem auto',
    width: '100%',
    flexDirection: 'column',
  },

  // Inner Container
  innerContainer: {
    margin: theme.spacing(4, 'auto'),
    width: '95%', // Inner width of the container
  },

  suHeader: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: '1.2rem',
    [theme.breakpoints.up('lg')]: {
      fontSize: '1.4rem',
    },
  },
  description: {
    marginTop: theme.spacing(3.25),
    marginBottom: theme.spacing(7.5),
    fontSize: '1rem',
  },
  bfinIcon: {
    width: '7rem',
    height: '6.31rem',
  },

  // Body
  outerSum: {
    display: 'flex',
    flexDirection: 'column',
  },
  summaryDiv: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'baseline',
    margin: theme.spacing(1, 0),
  },
  innerSumDiv: {
    alignContent: 'center',
    display: 'table-cell',
    verticalAlign: 'middle',
    width: '20%',
    [theme.breakpoints.up('lg')]: {
      width: '10%',
    },
  },
  sumText: {
    width: '100%',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3),
    fontSize: '1.2rem',
    [theme.breakpoints.up('lg')]: {
      fontSize: '1.4rem',
    },
  },
  col1: {
    alignContent: 'center',
    color: theme.palette.highlight,
    fontSize: '1rem',
    paddingTop: theme.spacing(0.5),
    verticalAlign: 'middle',
  },
  schedule: {
    fontSize: '0.85rem',
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(0.75),
  },
  col2: {
    color: theme.palette.text.primary,
    marginLeft: theme.spacing(5),
    width: '75%',
  },
  schCol2: {
    width: '75%',
    marginLeft: theme.spacing(5),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clusterName: {
    fontSize: '0.85rem',
    marginLeft: theme.spacing(7),
    paddingTop: theme.spacing(0.5),
  },
  editButton: {
    height: '1rem',
  },
  editIcon: {
    color: theme.palette.text.primary,
    height: '0.8rem',
  },
  link: {
    fontSize: '0.875rem',
    color: theme.palette.secondary.dark,
  },
  adjWeights: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',

    width: '80%',
    [theme.breakpoints.up('lg')]: {
      width: '90%',
    },
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
    color: theme.palette.error.main,
    fontSize: '1rem',
    marginLeft: theme.spacing(5),
  },
  yamlFlex: {
    display: 'flex',
    flexDirection: 'column',
    width: '75%',
    marginLeft: theme.spacing(5),
  },
  progress: {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: 1,
    marginLeft: theme.spacing(5),
  },
  buttomPad: {
    paddingBottom: theme.spacing(3.75),
  },
  closeBtn: {
    color: theme.palette.secondary.contrastText,
    marginTop: theme.spacing(-6),
    marginRight: theme.spacing(-2.5),
  },
  buttonDiv: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },

  // Modal
  modal: {
    [theme.breakpoints.up('lg')]: {
      padding: theme.spacing(10),
    },
    padding: theme.spacing(3),
  },
  heading: {
    fontSize: '2rem',
    textalign: 'center',
    marginTop: theme.spacing(3),
    color: theme.palette.text.primary,
  },
  headWorkflow: {
    fontsize: '2rem',
    textalign: 'center',
    color: theme.palette.text.primary,
    marginTop: theme.spacing(3),
  },
  button: {
    color: theme.palette.text.primary,
    textAlign: 'center',
    marginTop: theme.spacing(5),
  },
  closeButton: {
    borderColor: theme.palette.border.main,
  },
  successful: {
    fontSize: '2.2rem',
    fontWeight: 'bold',
  },
}));
export default useStyles;
