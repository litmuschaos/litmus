import { makeStyles, withStyles } from '@material-ui/core';
import MuiAccordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';

const useStyles = makeStyles((theme) => ({
  accordionSummary: {
    display: 'flex',
    justifyItems: 'center',
    background: theme.palette.disabledBackground,
  },

  accordionDetails: {
    width: '100%',
  },

  chaosHelperText: {
    fontWeight: 500,
    fontSize: '1rem',
    color: theme.palette.primary.main,
  },

  tableDropIcon: {
    width: '1.75rem',
    height: '1.75rem',
    marginTop: theme.spacing(-0.15),
    color: theme.palette.primary.main,
  },

  accordionHeader: {
    display: 'flex',
  },

  editIconButton: {
    marginTop: theme.spacing(-0.75),
  },
}));

export const Accordion = withStyles((theme) => ({
  root: {
    border: 0,
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
    '& .MuiAccordionSummary-root.Mui-expanded': {
      minHeight: '1rem !important',
      height: '2.75rem',
      paddingTop: theme.spacing(0.5),
    },
    '& .MuiAccordionSummary-root': {
      minHeight: '1rem !important',
      height: '2.75rem',
      paddingTop: theme.spacing(0.5),
    },
  },
}))(MuiAccordion);

export const AccordionSummary = withStyles({
  content: {
    flexGrow: 0,
  },
})(MuiAccordionSummary);

export const StyledAccordionDetails = withStyles({
  root: {
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
})(AccordionDetails);

export default useStyles;
