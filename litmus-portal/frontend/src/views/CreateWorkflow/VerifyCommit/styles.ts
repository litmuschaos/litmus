import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  horizontalLine: {
    background: theme.palette.border.main,
  },
  root: {
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    flexDirection: 'column',
    height: '100%',
    margin: '0 auto',
    padding: theme.spacing(0, 2),
    width: '98%',
    [theme.breakpoints.up('lg')]: {
      width: '99%',
    },
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
    fontSize: '1rem',
    marginBottom: theme.spacing(7.5),
    marginTop: theme.spacing(3.25),
  },
  bfinIcon: {
    height: '6.31rem',
    width: '7rem',
  },
  outerSum: {
    display: 'flex',
    flexDirection: 'column',
  },
  summaryDiv: {
    alignItems: 'baseline',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
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
    fontSize: '1.2rem',
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(4.5),
    width: '100%',
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
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(5),
    width: '75%',
  },
  schCol2: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: theme.spacing(5),
  },
  clusterName: {
    fontSize: '0.85rem',
    marginLeft: theme.spacing(7),
    paddingTop: theme.spacing(0.5),
  },
  editButton1: {
    marginLeft: theme.spacing(1),
  },
  editbtn: {
    color: theme.palette.text.secondary,
  },
  link: {
    color: theme.palette.secondary.dark,
    fontSize: '0.875rem',
  },
  adjWeights: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: theme.spacing(2),
    width: '80%',
    [theme.breakpoints.up('lg')]: {
      width: '90%',
    },
  },
  config: {
    color: theme.palette.text.disabled,
    fontSize: '0.9375rem',
    height: '3rem',
    marginLeft: theme.spacing(30),
    marginTop: theme.spacing(3.75),
    width: '30rem',
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
    marginLeft: theme.spacing(7),
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
    marginRight: theme.spacing(-2.5),
    marginTop: theme.spacing(-6),
  },

  // Modal
  modal: {
    [theme.breakpoints.up('lg')]: {
      padding: theme.spacing(10),
    },
    padding: theme.spacing(3),
  },
  heading: {
    color: theme.palette.text.primary,
    fontSize: '2rem',
    marginTop: theme.spacing(3),
    textalign: 'center',
  },
  headWorkflow: {
    color: theme.palette.text.primary,
    fontsize: '2rem',
    marginTop: theme.spacing(3),
    textalign: 'center',
  },
  button: {
    color: theme.palette.text.primary,
    marginTop: theme.spacing(5),
    textAlign: 'center',
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
