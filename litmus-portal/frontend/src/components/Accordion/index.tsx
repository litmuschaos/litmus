import MuiAccordion from '@material-ui/core/Accordion';
import { withStyles } from '@material-ui/core/styles';

const Accordion = withStyles({
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
      height: '2.5rem',
    },
    '& .MuiAccordionSummary-root': {
      minHeight: '1rem !important',
      height: '2.5rem',
    },
  },
  expanded: {},
})(MuiAccordion);

export { Accordion };
