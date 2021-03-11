import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    padding: theme.spacing(4, 0),
    margin: '0 auto',
    width: '88%',
    height: '100%',
    [theme.breakpoints.up('lg')]: {
      width: '87%',
    },
  },

  // Header
  headerWrapper: {
    padding: theme.spacing(0, 4),
  },

  heading: {
    marginTop: theme.spacing(3),
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },

  headerBtn: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '30%',
  },

  descriptionWrapper: {
    padding: theme.spacing(3, 0),
    justifyContent: 'space-between',
  },

  description: {
    width: '70%',
    fontSize: '1rem',
  },

  // Header Buttons [View YAML, Add Exp]
  btn1: {
    border: 'none !important',
    color: theme.palette.highlight,
  },

  // Experiment Section
  experimentWrapper: {
    background: theme.palette.cards.header,
    padding: theme.spacing(2, 4),
  },

  // Modal
  closeButton: {
    borderColor: theme.palette.border.main,
  },

  modal: {
    [theme.breakpoints.up('lg')]: {
      padding: theme.spacing(10),
    },
    width: '100%',
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },

  // Styles for Add Experiment Modal
  addExpModal: {
    textAlign: 'left',
    padding: theme.spacing(5),
    display: 'flex',
    flexDirection: 'column',
  },
  doneBtn: {
    marginLeft: 'auto',
    marginTop: theme.spacing(2.5),
    marginRight: theme.spacing(2),
  },
  inputDiv: {
    display: 'flex',
    flexDirection: 'row',
    margin: theme.spacing(2.5),
    alignItems: 'center',
  },
  formControl: {
    height: '2.5rem',
    width: '20rem',
    marginTop: 20,
  },
  selectText: {
    height: '2.5rem',
    padding: theme.spacing(0.5),
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
