import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  horizontalLine: {
    background: theme.palette.border.main,
  },
  root: {
    backgroundColor: theme.palette.background.paper,
    borderColor: theme.palette.text.disabled,
    borderRadius: '0.1875rem',
    flexDirection: 'column',
    height: '100%',
    margin: '0 auto',
    padding: theme.spacing(3.75, 6, 3.75, 3.75),
    width: '80%',
  },
  suHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-even',
  },
  headerText: {
    marginTop: theme.spacing(2.75),
    fontSize: '1.5625rem',
  },
  description: {
    marginTop: theme.spacing(3.25),
    marginBottom: theme.spacing(7.5),
    fontSize: '1.0625rem',
  },
  suBody: {
    width: '65%',
  },
  bfinIcon: {
    width: '7rem',
    height: '6.31rem',
    marginTop: theme.spacing(5),
    marginLeft: theme.spacing(12),
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
    alignItems: 'baseline',
    marginTop: theme.spacing(3),
  },
  innerSumDiv: {
    alignContent: 'center',
    display: 'table-cell',
    height: '100%',
    verticalAlign: 'middle',
    width: '20%',
  },
  sumText: {
    width: '100%',
    marginTop: theme.spacing(4.5),
    marginBottom: theme.spacing(3),
    fontSize: '1.5rem',
  },
  col1: {
    alignContent: 'center',
    color: theme.palette.highlight,
    fontSize: '1rem',
    paddingTop: theme.spacing(0.5),
    verticalAlign: 'middle',
  },
  schedule: {
    fontSize: '1rem',
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(0.75),
  },
  col2: {
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(5),
    width: '75%',
  },
  schCol2: {
    marginLeft: theme.spacing(5),
    display: 'flex',
    flexDirection: 'row',
  },
  clusterName: {
    fontSize: '1rem',
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
    fontSize: '0.875rem',
    color: theme.palette.secondary.dark,
  },
  adjWeights: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: theme.spacing(2),
    width: '80%',
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
    marginLeft: theme.spacing(7),
  },
  yamlButton: {
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(1),
    width: theme.spacing(1.5),
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
