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

  button: {
    background: 'none',
    boxShadow: 'none',
    padding: 0,
    '&:hover': {
      background: 'none',
      boxShadow: 'none',
      cursor: 'pointer !important',
    },
  },

  chaosHelperText: {
    fontWeight: 500,
    fontSize: '1rem',
    color: theme.palette.primary.main,
  },

  tableDropIcon: {
    width: '1.75rem',
    height: '1.75rem',
    color: theme.palette.primary.main,
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
      cursor: 'default',
      minHeight: '1rem !important',
      height: '2.75rem',
      paddingTop: theme.spacing(0.5),
    },
    '& .MuiAccordionSummary-root': {
      cursor: 'default',
      minHeight: '1rem !important',
      height: '2.75rem',
      paddingTop: theme.spacing(0.5),
    },
    '& .MuiButtonBase-root:hover': {
      cursor: 'default',
    },
  },
}))(MuiAccordion);

export const AccordionSummary = withStyles({
  content: {
    flexGrow: 0,
  },
})(MuiAccordionSummary);

export const StyledAccordionDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(0, 0, 1),
  },
}))(AccordionDetails);

export default useStyles;
