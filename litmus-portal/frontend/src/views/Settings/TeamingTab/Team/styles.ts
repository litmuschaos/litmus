import { TableCell } from '@material-ui/core';
import {
  createStyles,
  makeStyles,
  Theme,
  withStyles,
} from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  UMDiv: {
    marginTop: theme.spacing(6.65),
  },
  headerText: {
    fontSize: '1.5625rem',
  },
  myProjectText: {
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(1.5),
  },
  members: {
    color: theme.palette.secondary.dark,
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(1.875),
    marginTop: theme.spacing(2.625),
  },
  descText: {
    fontSize: '1rem',
    marginBottom: theme.spacing(3.75),
  },
  memTypo: {
    fontSize: '1rem',
  },
  root: {
    backgroundColor: theme.palette.background.paper,
    color: 'inherit',
    margin: theme.spacing(-3),
  },
  table: {
    backgroundColor: theme.palette.background.paper,
    height: '25.125rem',
    '&::-webkit-scrollbar': {
      width: '0.2em',
    },
    '&::-webkit-scrollbar-track': {
      webkitBoxShadow: `inset 0 0 6px ${theme.palette.common.black}`,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.secondary.dark,
    },
  },
  tablePagination: {
    borderTop: `1px solid ${theme.palette.border.main}`,
    height: '3.5rem',
    marginTop: theme.spacing(-0.25),
  },
  toolbar: {
    width: '90%',
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.cards.background}`,
    display: 'flex',
    height: '6.125rem',
    justifyContent: 'space-between',
  },
  filter: {
    alignItems: 'center',
    display: 'flex',
    marginLeft: theme.spacing(5),
    paddingBottom: theme.spacing(0.5),
  },
  formControl: {
    margin: theme.spacing(0, 3, 0, 2),
    minWidth: '9rem',
    '& fieldset': {
      height: '3.1875rem',
    },
  },
  selectText: {
    height: '2.5rem',
    padding: theme.spacing(0.5),
  },
  TR: {
    borderBottom: `1px solid ${theme.palette.border.main}`,

    height: '4.8125rem',
    paddingLeft: theme.spacing(8),
    '& p': {
      fontSize: '0.8125rem',
      fontWeight: 'bold',
    },
    '& th': {
      backgroundColor: theme.palette.background.paper,
      fontSize: '0.8125rem',
      fontWeight: 'bold',
      paddingLeft: theme.spacing(5),
    },
  },
  firstTC: {
    borderBottom: `1px solid ${theme.palette.border.main}`,
    borderRight: `1px solid ${theme.palette.border.main}`,
    maxWidth: '17.56rem',
  },
  firstCol: {
    alignItems: 'center',
    display: 'flex',
    maxWidth: '17.56rem',
  },
  otherTC: {
    borderBottom: `1px solid ${theme.palette.border.main}`,
    height: '6.625rem',
    maxWidth: '15.375rem',
    paddingLeft: theme.spacing(5),
  },
  buttonTC: {
    borderBottom: `1px solid ${theme.palette.border.main}`,
    height: '6.625rem',
  },
  lastCell: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
  },
  styledTC: {
    borderBottom: `1px solid ${theme.palette.border.main}`,
    paddingLeft: theme.spacing(5),
  },

  styledTCHeading: {
    borderBottom: `1px solid ${theme.palette.border.main}`,
    borderRight: `1px solid ${theme.palette.border.main}`,
    paddingLeft: theme.spacing(5),
  },
  userRole: {
    color: theme.palette.text.disabled,
    fontSize: '0.625rem',
  },
  toolbarFirstCol: {
    alignItems: 'center',
    display: 'flex',
  },
  buttonDiv: {
    display: 'flex',
    marginRight: theme.spacing(1),
  },
  optionBtn: {
    marginLeft: 'auto',
  },
  avatarBackground: {
    alignContent: 'right',
    backgroundColor: theme.palette.primary.main,
    height: '2.56rem',
    marginRight: theme.spacing(2.5),
    width: '2.56rem',
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(2.5),
    },
  },
  menuHeader: {
    fontSize: '0.75rem',
  },
  menuDesc: {
    fontSize: '0.625rem',
  },
  menuOpt: {
    '&:hover': {
      background: theme.palette.highlight,
    },
  },
  menuDiv: {
    display: 'flex',
    flexDirection: 'column',
  },
  calIcon: {
    marginRight: theme.spacing(1.25),
  },
  dateDiv: {
    display: 'flex',
  },
  body: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: theme.spacing(10),
  },

  // styles for text
  text: {
    width: '31.93rem',
    [theme.breakpoints.up('lg')]: {
      height: '5.875rem',
      marginBottom: theme.spacing(3.75),
      marginTop: theme.spacing(3.75),
    },
  },
  typo: {
    fontSize: '2rem',
  },
  textSecond: {
    height: '1.6875rem',
    marginBottom: theme.spacing(3.75),
    marginTop: theme.spacing(1.875),
    width: '29.06rem',
  },
  typoSub: {
    fontSize: '1rem',
  },
  // for yes or no buttons
  buttonGroup: {
    display: 'flex',
    height: '2.75rem',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2.5),
    width: '12.75rem',
  },
  input: {
    '&:-webkit-autofill': {
      webkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
      maxWidth: '15.75rem',
      webkitTextFillColor: theme.palette.text.secondary,
    },
  },
  myProject: {
    backgroundColor: theme.palette.cards.header,
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(0, 5.3, 0, 5.3),
  },
  project: {
    alignItems: 'center',
    display: 'flex',
    margin: theme.spacing(3.875, 'auto', 2.5, 'auto'),
  },
  projectName: {
    fontSize: '1rem',
    fontWeight: 500,
    margin: theme.spacing(0, 0, 0, 1.56),
    textTransform: 'uppercase',
  },

  active: {
    color: theme.palette.primary.main,
    fontSize: '1rem',
    fontWeight: 500,
    textTransform: 'capitalize',
  },
  inActive: {
    color: theme.palette.text.hint,
    fontSize: '1rem',
    fontWeight: 500,
    textTransform: 'capitalize',
  },
  invitationCount: {
    fontSize: '3.75rem',
    fontWeight: 300,
  },
  resendButton: {
    marginRight: theme.spacing(-2),
  },

  row1: {
    display: 'flex',
    marginTop: theme.spacing(5),
    minHeight: '12.8125rem',
  },
  projectInfo: {
    alignItems: 'center',
    background: theme.palette.cards.header,
    display: 'flex',
    justifyContent: 'space-around',
    minWidth: '35%',
  },
  projectInfoProjectStats: {
    display: 'flex',
    paddingBottom: theme.spacing(1),
    '& p:first-child': {
      color: theme.palette.text.hint,
      fontSize: '5.625rem',
    },
    '& p:nth-child(2)': {
      alignItems: 'flex-end',
      display: 'flex',
      fontSize: '1.875rem',
      padding: theme.spacing(0, 0, 3.5, 2.5),
    },
  },
  displayFlex: {
    display: 'flex',
    '& p': {
      alignItems: 'center',
      display: 'flex',
    },
    '& p:nth-child(2)': {
      color: theme.palette.text.hint,
      fontSize: '1rem',
      padding: theme.spacing(0.5, 0, 0, 1),
    },
  },
  projectInfoBoldText: {
    fontSize: '1.25rem',
    fontWeight: 700,
  },
  teamInfo: {
    background: theme.palette.cards.background,
    minWidth: '65%',
    padding: theme.spacing(5),
    '& p': {
      color: theme.palette.text.hint,
      fontSize: '1rem',
      maxWidth: '24rem',
    },
  },
  invitationButton: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  invitationButtonFlex: {
    alignItems: 'center',
    border: `1px solid ${theme.palette.warning.main}`,
    borderRadius: '0.1875rem',
    display: 'flex',
    padding: theme.spacing(1),
    '& p': {
      color: theme.palette.warning.main,
      fontSize: '1.25rem',
      padding: theme.spacing(0, 0, 0, 1),
    },
  },
  invitations: {
    margin: theme.spacing(5, 0, 0, 0),
    padding: theme.spacing(5, 5, 5, 5),
  },
  inviteHeading: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
  },
  inviteText: {
    fontSize: '0.875rem',
    margin: theme.spacing(2.5, 0, 3.375, 0),
  },
  pending: {
    background: theme.palette.warning.light,
    borderRadius: '0.1875rem',
    color: theme.palette.warning.main,
    fontSize: '0.625rem',
    marginLeft: theme.spacing(1.0),
    maxWidth: '2.8rem',
    padding: theme.spacing(0.5, 0.5, 0.5, 0.5),
  },
  declined: {
    background: theme.palette.error.light,
    borderRadius: '0.1875rem',
    color: theme.palette.error.dark,
    fontSize: '0.625rem',
    marginLeft: theme.spacing(1.0),
    maxWidth: '2.8rem',
    padding: theme.spacing(0.5, 0.5, 0.5, 0.5),
  },
  dropDown: {
    paddingTop: theme.spacing(1.0),
  },
  yesButton: {
    marginLeft: theme.spacing(2.5),
  },
  userName: {
    fontStyle: 'italic',
  },
  closeModal: {
    alignItems: 'center',
    display: 'flex',
    '& p': {
      color: theme.palette.disabledBackground,
      marginRight: theme.spacing(1),
    },
    '& button': {
      borderColor: theme.palette.disabledBackground,
      color: theme.palette.disabledBackground,
      maxHeight: '1.375rem',
      maxWidth: '1.375rem',
      minWidth: '1.375rem',
    },
  },
}));

// StyledTableCell used to create custom table cell
export const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.disabled,
      borderBottom: `1px solid ${theme.palette.border.main}`,
    },
    body: {
      backgroundColor: theme.palette.background.paper,
      fontSize: '0.875rem',
    },
  })
)(TableCell);

export default useStyles;
