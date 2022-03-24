import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  logs: {
    overflowY: 'auto',
    [theme.breakpoints.up('lg')]: {
      height: '100%',
    },
    height: '100%',
    background: theme.palette.text.primary,
    color: theme.palette.common.white,
    marginTop: theme.spacing(0.3),
    borderRadius: '0.5rem',
    textAlign: 'left',
  },
  title: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    padding: theme.spacing(1, 0),
  },
  text: {
    fontSize: '0.875rem',
    padding: theme.spacing(2.5),
  },
  probeStatus: {
    marginLeft: theme.spacing(3),
  },
  tabBar: {
    borderBottom: `1px solid ${theme.palette.border.main}`,
  },
  subText: {
    color: theme.palette.text.hint,
  },
  line: {
    border: 'none',
    backgroundColor: theme.palette.text.hint,
    height: '0.1rem',
    marginBottom: theme.spacing(3),
  },
  btn: {
    backgroundColor: `${theme.palette.common.white} !important`,
    float: 'right',
    position: 'absolute',
    right: 0,
    color: theme.palette.highlight,
    margin: theme.spacing(2.5),
    zIndex: 99,
  },

  // Accordion
  accordion: {
    backgroundColor: 'transparent !important',
    color: theme.palette.common.white,

    '& .MuiAccordionSummary-root': {
      marginTop: '-1rem',
      padding: 0,
    },
    '& .MuiAccordionDetails-root': {
      margin: '-1rem 0',
    },
    '& .MuiAccordion-root.Mui-expanded': {
      margin: 0,
    },
  },
  summary: {
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIcon.Mui-expanded': {
      transform: 'rotate(90deg) !important',
    },
    '& .MuiAccordionSummary-content': {
      marginLeft: theme.spacing(1),
    },
  },

  // Status
  success: {
    color: theme.palette.success.main,
  },
  failed: {
    color: theme.palette.error.main,
  },
}));

export default useStyles;
