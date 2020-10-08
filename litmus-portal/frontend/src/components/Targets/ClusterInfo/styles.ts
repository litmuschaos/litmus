import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  header: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(2),
  },
  mainDiv: {
    width: '95%',
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(4),
    marginTop: theme.spacing(4),
    marginButtom: theme.spacing(2),
    border: '1px solid ',
    borderColor: theme.palette.customColors.black(0.07),
    backgroundColor: theme.palette.common.white,
    borderRadius: '0.1875rem',
    paddingBottom: theme.spacing(4),
  },
  detailsDiv: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(5),
    marginTop: theme.spacing(5),
  },
  Signed: {
    minWidth: '2.625rem',
    minHeight: '0.8125rem',
    background: 'rgba(16, 155, 103, 0.1)',
    marginRight: theme.spacing(2.5),
    borderRadius: '0.1875rem',
    color: theme.palette.primary.dark,
    fontSize: '0.625rem',
    paddingRight: theme.spacing(1.18),
    paddingLeft: theme.spacing(1.18),
    paddingTop: theme.spacing(0.834),
    paddingBottom: theme.spacing(0.834),
  },
  firstCol: {
    display: 'flex',
    alignItems: 'center',
    paddingRight: theme.spacing(12),
    justifyContent: 'space-between',
  },
  backBotton: {
    paddingTop: theme.spacing(5),
    marginLeft: theme.spacing(2),
  },
  checkCluster: {
    marginRight: theme.spacing(2),
  },
  version: {
    marginTop: theme.spacing(2),
  },
  NotSigned: {
    minWidth: '2.625rem',
    minHeight: '0.8125rem',
    background: 'rgba(202, 44, 44, 0.1)',
    marginRight: theme.spacing(2.5),
    fontSize: '0.625rem',
    padding: theme.spacing(0.834),
    borderRadius: '0.1875rem',
    color: '#CA2C2C',
  },
  aboutDiv: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(5),
    marginTop: theme.spacing(4),
  },
  status: {
    display: 'flex',
    flexDirection: 'row',
  },
  expDiv: {
    display: 'flex',
    flexDirection: 'row',
    cursor: 'pointer',
  },
  btnImg: {
    width: '0.8125rem',
    height: '0.8125rem',
    marginTop: theme.spacing(0.375),
  },
  btnText: {
    paddingLeft: theme.spacing(1.625),
  },
  //
  rightMargin: {
    marginRight: theme.spacing(8),
  },
  connectdevice: {
    fontSize: '1rem',
    lineHeight: '175%',
    fontWeight: 'bold',
    color: theme.palette.common.black,
  },
  stepsDiv: {
    marginLeft: theme.spacing(8),
    marginTop: theme.spacing(2),
    width: '50rem',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
}));

export default useStyles;
