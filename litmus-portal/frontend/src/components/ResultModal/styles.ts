import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  testHeading: {
    marginTop: theme.spacing(6.25),
    fontSize: '1.5625rem',
  },
  testType: {
    fontSize: '1.0625rem',
    paddingRight: theme.spacing(1.25),
  },
  testResult: {
    color: theme.palette.primary.dark,
    fontSize: '1.0625rem',
    paddingLeft: theme.spacing(1.25),
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    width: '65.625rem',
    maxHeight: '50rem',
    backgroundColor: theme.palette.background.paper,
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
    outline: 'none',
    borderRadius: 3,
  },
  table: {
    marginTop: theme.spacing(4),
    width: '59.375rem',
    alignItems: 'center',
    border: '0.0625 solid ',
    borderColor: '#E5E5E5',
  },
  tableHeader: {
    width: '50rem',
    marginTop: theme.spacing(7.5),
  },
  headingModal: {
    marginTop: theme.spacing(1.25),
    fontSize: '1.5625rem',
  },
  tableHeading: {
    fontSize: '1.125rem',
    color: theme.palette.common.black,
    opacity: 0.6,
  },
  tableData: {
    fontSize: '1.125rem',
    color: theme.palette.common.black,
    fontWeight: 'bold',
  },
  tableWeight: {
    fontSize: '1.125rem',
    color: theme.palette.primary.dark,
    fontWeight: 'bold',
  },
  tablePoints: {
    fontSize: '1.125rem',
    color: theme.palette.common.black,
    fontWeight: 'bold',
  },
  tableResult: {
    color: theme.palette.primary.dark,
    fontSize: '1.125rem',
  },
  testInfo: {
    fontSize: '0.9375rem',
    opacity: 0.4,
    width: '30rem',
  },
  buttonDiv: {
    marginTop: theme.spacing(5),
    marginLeft: theme.spacing(48),
    marginBottom: theme.spacing(5),
  },
  resultDiv: {
    display: 'flex',
    flexDirection: 'column',
    marginRight: theme.spacing(8.75),
  },
  resultText: {
    fontSize: '1.125rem',
    color: theme.palette.common.black,
    opacity: 0.6,
    width: '8.75rem',
  },
  resultTextInfo: {
    fontSize: '1.125rem',
    color: theme.palette.common.black,
    opacity: 0.6,
    width: '15.625rem',
  },
  totalScore: {
    fontSize: '2.25rem',
    color: '#F6B92B',
  },
  reliabilityScore: {
    fontSize: '2.25rem',
    color: theme.palette.secondary.dark,
  },
  testTips: {
    width: '28.125',
    height: '4.0625',
    fontSize: '0.875',
  },
}));

export default useStyles;
