import { fade, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
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

  // Header Div
  header: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: '1.2rem',
    [theme.breakpoints.up('lg')]: {
      fontSize: '1.4rem',
    },
  },
  subtitle: {
    margin: theme.spacing(2, 0),
    [theme.breakpoints.up('lg')]: {
      fontSize: '1rem',
      margin: theme.spacing(4, 0),
    },
  },

  // Divider
  divider: {
    backgroundColor: theme.palette.disabledBackground,
    border: 'none',
    height: '0.1rem',
  },

  // Selection Radio Buttons
  m5: {
    marginTop: theme.spacing(5),
  },
  accordion: {
    border: 'none',
    boxShadow: 'none',
    '& .MuiAccordionSummary-root': {
      border: 'none',
      height: '0.5rem',
      marginLeft: '-1rem',
    },

    '& .MuiAccordionDetails-root': {
      border: 'none',
      marginLeft: '-1rem',
      position: 'relative',
    },
    '& .MuiAccordion-root:before': {
      backgroundColor: 'transparent',
    },
  },

  // Accordion Expanded Body [Content]
  predefinedWorkflowDiv: {
    height: window.screen.height < 1080 ? '15rem' : '20rem',
    overflowY: 'scroll',
  },
  MuiAccordionroot: {
    '&.MuiAccordion-root:before': {
      backgroundColor: 'white',
    },
  },
  predefinedWorkflowCard: {
    backgroundColor: theme.palette.cards.background,
    lineHeight: '5rem', // Making the div content vertically aligned
    margin: theme.spacing(1, 0),
    padding: theme.spacing(0, 5),

    '& #body': {
      display: 'flex',
      justifyContent: 'space-between',
      width: '40rem',
    },

    '& #left-div': {
      display: 'flex',
      marginLeft: theme.spacing(2),
      width: '15rem',
    },

    '& #right-div': {
      display: 'flex',
      width: '20rem',
    },
  },
  experimentIcon: {
    height: '3rem',
    width: '3rem',
  },
  predefinedWorkflowName: {
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(1.5),
  },
  blur: {
    background: theme.palette.background.paper,
    bottom: 0,
    filter: 'blur(1rem)',
    height: '4rem',
    opacity: '0.8',
    position: 'absolute',
    width: '100%',
  },

  // Upload button styles
  uploadYAMLDiv: {
    backgroundColor: theme.palette.background.paper,
    border: `1px dashed ${theme.palette.border.main}`,
    borderRadius: theme.spacing(1.25),
    margin: 'auto',
    marginTop: theme.spacing(1),
    padding: theme.spacing(3.75),
    width: '95%',
  },
  uploadYAMLText: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    margin: 'auto',
    paddingTop: theme.spacing(1),
    width: '31.25rem',
  },
  uploadImage: {
    marginBottom: theme.spacing(2.5),
  },
  orText: {
    marginBottom: theme.spacing(1.25),
    marginTop: theme.spacing(1.25),
  },
  uploadBtn: {
    border: `2px solid ${theme.palette.primary.light}`,
    borderRadius: theme.spacing(0.5),
    fontSize: '0.7rem',
    height: '2.8125rem',
    textTransform: 'none',
    width: 'fit-content',
    '&:hover': {
      backgroundColor: theme.palette.background.paper,
      borderColor: (props) =>
        props !== true ? theme.palette.primary.light : '',
      boxShadow: (props) =>
        props !== true
          ? `${fade(theme.palette.primary.light, 0.5)} 0 0.3rem 0.4rem 0`
          : 'none',
    },
  },
  uploadSuccessDiv: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    margin: '0 auto',
    maxWidth: '31.25rem',
    paddingTop: theme.spacing(1.875),
  },
  uploadSuccessImg: {
    height: '3.125rem',
    paddingBottom: theme.spacing(1),
    verticalAlign: 'middle',
    width: '3.125rem',
  },
  uploadSuccessText: {
    display: 'inline-block',
    fontSize: '1rem',
    marginBottom: theme.spacing(1.25),
    marginLeft: theme.spacing(2.5),
  },

  // Select MyHub Option Styles
  inputDiv: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    margin: theme.spacing(2.5),
  },
  formControl: {
    marginLeft: theme.spacing(1),
    minWidth: '9rem',
  },
  label: {
    color: theme.palette.common.black,
  },
}));

export default useStyles;

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

export const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
};
