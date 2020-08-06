import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    width: '80%',
    margin: '0 auto',
    border: 1,
    borderColor: theme.palette.text.disabled,
    borderRadius: 3,
  },

  suHeader: {
    paddingLeft: theme.spacing(3.75),
    paddingRight: theme.spacing(3.75),
    paddingTop: theme.spacing(3.75),
    paddingBottom: theme.spacing(3.75),
  },

  suSegments: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-even',
  },
  headerText: {
    marginTop: theme.spacing(1.25),
    fontSize: '1.5625rem',
  },
  description: {
    width: '32.18rem',
    marginTop: theme.spacing(3.25),
    marginBottom: theme.spacing(7.5),
    fontSize: '1.0625rem',
  },
  suBody: {
    width: '32.18rem',
  },
  bfinIcon: {
    width: '7rem',
    height: '6.31rem',
    marginTop: theme.spacing(5),
    marginLeft: theme.spacing(25),
  },
  innerDiv2: {
    marginTop: theme.spacing(5),
  },
  outerSum: {
    display: 'flex',
    flexDirection: 'column',
  },
  summaryDiv: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  innerSumDiv: {
    width: '7.625rem',
    marginTop: theme.spacing(7.5),
  },
  sumText: {
    marginTop: theme.spacing(7.5),
    fontSize: '1.5rem',
  },
  col1: {
    fontSize: '1rem',
    color: theme.palette.secondary.dark,
  },
  col2: {
    marginLeft: theme.spacing(5),
    marginTop: theme.spacing(7.5),
  },
  schCol2: {
    width: '45.25rem',
    marginLeft: theme.spacing(5),
    marginTop: theme.spacing(3.75),
    display: 'flex',
    flexDirection: 'row',
  },
  yamlCol2: {
    width: '45.25rem',
    marginLeft: theme.spacing(8.125),
    marginTop: theme.spacing(7.5),
  },
  editButton1: {
    marginTop: theme.spacing(1.25),
    marginLeft: theme.spacing(43.75),
  },
  editButton2: {
    marginTop: theme.spacing(3.75),
    marginLeft: theme.spacing(4.875),
  },
  yamlButton: {
    marginTop: theme.spacing(5),
    marginRight: theme.spacing(2.5),
    marginBottom: theme.spacing(5),
  },
  margin: {
    margin: theme.spacing(1),
  },
  link: {
    fontSize: '0.875rem',
    color: theme.palette.secondary.dark,
  },
  adjWeights: {
    display: 'flex',
    flexDirection: 'column',

    marginTop: theme.spacing(3.75),
  },
  progress: {
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

  modalContainer: {
    width: '61.25rem',
    height: '29rem',
    marginLeft: '20%',
    marginTop: '5.5%',
    background: '#161616',
    outline: 'none',
  },

  modalContainerClose: {
    paddingLeft: theme.spacing(115),
  },

  errorText: {
    marginTop: theme.spacing(7.5),
    fontSize: '1rem',
    color: 'red',
  },

  closeButtonStyle: {
    fontSize: '1rem',
    fontWeight: 1000,
    display: 'inline-block',
    paddingTop: theme.spacing(0.375),
    paddingBottom: theme.spacing(0.375),
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    minHeight: 0,
    minWidth: 0,
    borderRadius: 3,
    color: 'rgba(255, 255, 255, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    marginTop: theme.spacing(2.5),
  },
}));
export default useStyles;
