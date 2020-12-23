import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  mainDiv: {
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid ',
    borderColor: theme.palette.customColors.black(0.07),
    backgroundColor: theme.palette.common.white,
    borderRadius: '0.1875rem',
    paddingBottom: theme.spacing(4),
    marginLeft: theme.spacing(4),
    marginTop: theme.spacing(4),
    marginButtom: theme.spacing(2),
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(2.5),
    marginLeft: theme.spacing(2),
  },
  backBotton: {
    paddingTop: theme.spacing(5),
    marginLeft: theme.spacing(2),
  },
  mark: {
    marginTop: theme.spacing(14),
    textAlign: 'center',
  },
  heading: {
    fontSize: '2rem',
    textalign: 'center',
    color: theme.palette.common.black,
  },
  headWorkflow: {
    fontsize: '3rem',
    lineheight: '170%',
    textalign: 'center',
    color: theme.palette.common.black,
    marginTop: theme.spacing(4),
  },
  connectTarget: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(8),
    marginRight: theme.spacing(8),
  },
  loader: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(6),
    textalign: 'center',
    marginLeft: theme.spacing(10),
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
  buttonModal: {
    display: 'flex',
    marginTop: theme.spacing(6),
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  loaderMargin: {
    marginRight: theme.spacing(2),
  },
  rightMargin: {
    paddingTop: theme.spacing(4),
    marginRight: theme.spacing(8),
  },
  /* back Button */
  backButon: {
    display: 'flex',
    flexDirection: 'row',
    textTransform: 'none',
  },
  arrow: {
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(0.3),
  },
  text: {
    marginRight: theme.spacing(1),
    opacity: 0.5,
  },
}));

export default useStyles;
