import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  UMDiv: {
    marginTop: theme.spacing(6.65),
  },
  headerText: {
    fontSize: '1.5625rem',
  },
  myProjectText: {
    marginBottom: theme.spacing(1.5),
    color: theme.palette.primary.main,
  },
  members: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: theme.spacing(2.625),
    marginBottom: theme.spacing(1.875),
    color: theme.palette.secondary.dark,
  },
  descText: {
    marginBottom: theme.spacing(3.75),
    fontSize: '1rem',
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
    marginTop: theme.spacing(-0.25),
    height: '3.5rem',
    borderTop: `1px solid ${theme.palette.border.main}`,
  },
  toolbar: {
    height: '6.125rem',
    border: `1px solid ${theme.palette.cards.background}`,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    justifyContent: 'space-between',
    Width: '90%',
  },
  filter: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(0.5),
    marginLeft: theme.spacing(5),
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
    paddingLeft: theme.spacing(8),

    height: '4.8125rem',
    '& p': {
      fontWeight: 'bold',
      fontSize: '0.8125rem',
    },
    '& th': {
      fontWeight: 'bold',
      fontSize: '0.8125rem',
      paddingLeft: theme.spacing(5),
      backgroundColor: theme.palette.background.paper,
    },
  },
  firstTC: {
    borderRight: `1px solid ${theme.palette.border.main}`,
    borderBottom: `1px solid ${theme.palette.border.main}`,
    maxWidth: '17.56rem',
  },
  firstCol: {
    display: 'flex',
    alignItems: 'center',
    maxWidth: '17.56rem',
  },
  otherTC: {
    maxWidth: '15.375rem',
    borderBottom: `1px solid ${theme.palette.border.main}`,
    paddingLeft: theme.spacing(5),
    height: '6.625rem',
  },
  buttonTC: {
    borderBottom: `1px solid ${theme.palette.border.main}`,
    height: '6.625rem',
  },
  lastCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  styledTC: {
    borderBottom: `1px solid ${theme.palette.border.main}`,
    paddingLeft: theme.spacing(5),
  },

  styledTCHeading: {
    borderRight: `1px solid ${theme.palette.border.main}`,
    borderBottom: `1px solid ${theme.palette.border.main}`,
    paddingLeft: theme.spacing(5),
  },
  userRole: {
    fontSize: '0.625rem',
    color: theme.palette.text.disabled,
  },
  toolbarFirstCol: {
    display: 'flex',
    alignItems: 'center',
  },
  buttonDiv: {
    marginRight: theme.spacing(1),
    display: 'flex',
  },
  optionBtn: {
    marginLeft: 'auto',
  },
  avatarBackground: {
    backgroundColor: theme.palette.primary.main,
    width: '2.56rem',
    height: '2.56rem',
    color: theme.palette.text.primary,
    alignContent: 'right',
    marginRight: theme.spacing(2.5),
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
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(10),
  },

  // styles for text
  text: {
    width: '31.93rem',
    [theme.breakpoints.up('lg')]: {
      height: '5.875rem',
      marginTop: theme.spacing(3.75),
      marginBottom: theme.spacing(3.75),
    },
  },
  typo: {
    fontSize: '2rem',
  },
  textSecond: {
    width: '29.06rem',
    height: '1.6875rem',
    marginTop: theme.spacing(1.875),
    marginBottom: theme.spacing(3.75),
  },
  typoSub: {
    fontSize: '1rem',
  },
  // for yes or no buttons
  buttonGroup: {
    display: 'flex',
    width: '12.75rem',
    height: '2.75rem',
    marginTop: theme.spacing(2.5),
    justifyContent: 'space-between',
  },
  input: {
    '&:-webkit-autofill': {
      WebkitTextFillColor: theme.palette.text.secondary,
      WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
      maxWidth: '15.75rem',
    },
  },
  myProject: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.cards.header,
    padding: theme.spacing(0, 5.3, 0, 5.3),
  },
  project: {
    margin: theme.spacing(3.875, 'auto', 2.5, 'auto'),
    display: 'flex',
    alignItems: 'center',
  },
  projectName: {
    margin: theme.spacing(0, 0, 0, 1.56),
    textTransform: 'uppercase',
    fontWeight: 500,
    fontSize: '1rem',
  },

  active: {
    textTransform: 'capitalize',
    color: theme.palette.primary.main,
    fontWeight: 500,
    fontSize: '1rem',
  },
  inActive: {
    textTransform: 'capitalize',
    fontWeight: 500,
    fontSize: '1rem',
    color: theme.palette.text.hint,
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
    minWidth: '35%',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    background: theme.palette.cards.header,
  },
  projectInfoProjectStats: {
    display: 'flex',
    paddingBottom: theme.spacing(1),
    '& p:first-child': {
      fontSize: '5.625rem',
      color: theme.palette.text.hint,
    },
    '& p:nth-child(2)': {
      display: 'flex',
      alignItems: 'flex-end',
      fontSize: '1.875rem',
      padding: theme.spacing(0, 0, 3.5, 2.5),
    },
  },
  displayFlex: {
    display: 'flex',
    '& p': {
      display: 'flex',
      alignItems: 'center',
    },
    '& p:nth-child(2)': {
      padding: theme.spacing(0.5, 0, 0, 1),
      fontSize: '1rem',
      color: theme.palette.text.hint,
    },
  },
  projectInfoBoldText: {
    fontSize: '1.25rem',
    fontWeight: 700,
  },
  teamInfo: {
    minWidth: '65%',
    background: theme.palette.cards.background,
    padding: theme.spacing(5),
    '& p': {
      maxWidth: '24rem',
      fontSize: '1rem',
      color: theme.palette.text.hint,
    },
  },
  invitationButton: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  invitationButtonFlex: {
    borderRadius: '0.1875rem',
    border: `1px solid ${theme.palette.warning.main}`,
    padding: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    '& p': {
      fontSize: '1.25rem',
      color: theme.palette.warning.main,
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
    maxWidth: '2.8rem',
    background: theme.palette.warning.light,
    marginLeft: theme.spacing(1.0),
    borderRadius: '0.1875rem',
    color: theme.palette.warning.main,
    fontSize: '0.625rem',
    padding: theme.spacing(0.5, 0.5, 0.5, 0.5),
  },
  declined: {
    maxWidth: '2.8rem',
    marginLeft: theme.spacing(1.0),
    borderRadius: '0.1875rem',
    fontSize: '0.625rem',
    padding: theme.spacing(0.5, 0.5, 0.5, 0.5),
    color: theme.palette.error.dark,
    background: theme.palette.error.light,
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
    display: 'flex',
    alignItems: 'center',
    '& p': {
      marginRight: theme.spacing(1),
      color: theme.palette.disabledBackground,
    },
    '& button': {
      color: theme.palette.disabledBackground,
      borderColor: theme.palette.disabledBackground,
      maxWidth: '1.375rem',
      minWidth: '1.375rem',
      maxHeight: '1.375rem',
    },
  },
}));
export default useStyles;
