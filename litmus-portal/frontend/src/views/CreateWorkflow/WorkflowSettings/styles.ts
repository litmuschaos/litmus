import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    padding: theme.spacing(0, 2),
    margin: '0 auto',
    width: '98%',
    height: '100%',
    flexDirection: 'column',
    [theme.breakpoints.up('lg')]: {
      width: '99%',
    },
    backgroundImage: 'url(./icons/experiment-settings.svg)',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right top',
  },
  // Inner Container
  innerContainer: {
    margin: theme.spacing(4, 'auto'),
    width: '95%', // Inner width of the container
  },
  header: {
    fontSize: '1.2rem',
    [theme.breakpoints.up('lg')]: {
      fontSize: '1.4rem',
    },
    fontWeight: 700,
  },
  modalHeaderFont: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginTop: theme.spacing(2.5),
  },
  description: {
    fontSize: '1rem',
    fontWeight: 500,
    width: '70%',
    marginTop: theme.spacing(1.25),
  },
  avatar: {
    width: '5rem',
    height: '5rem',
    borderRadius: 4,
    marginBottom: theme.spacing(2.5),
    '& img': {
      objectFit: 'contain',
    },
  },
  avatarImgDiv: {
    marginTop: theme.spacing(3.75),
  },
  selectAvatar: {
    width: '6.25rem',
    height: '6.25rem',
    margin: theme.spacing(1.25),
    borderRadius: 4,
    backgroundColor: theme.palette.disabledBackground,
    border: `1px solid ${theme.palette.border.main}`,
    '& img': {
      padding: theme.spacing(2),
      objectFit: 'contain',
    },
  },
  modalDescriptionFont: {
    textAlign: 'center',
    fontSize: '1rem',
    fontWeight: 500,
    marginTop: theme.spacing(1.25),
  },
  avatarDiv: {
    display: 'flex',
    flexDirection: 'row',
    padding: theme.spacing(2.25),
  },
  editText: {
    color: theme.palette.primary.light,
    textAlign: 'center',
    cursor: 'pointer',
  },
  inputDiv: {
    width: '80%',
    marginLeft: theme.spacing(6.25),
    marginTop: theme.spacing(6),
  },
  avatarModalDiv: {
    padding: theme.spacing(5),
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSelection: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '31.25rem',
    justifyContent: 'center',
    marginTop: theme.spacing(3.75),
  },
  modalButton: {
    marginTop: theme.spacing(3.75),
  },
  imgNotChanged: {
    fontSize: '1.5rem',
    padding: theme.spacing(3.75),
  },
  continue: {
    fontSize: '1.25rem',
    marginBottom: theme.spacing(5),
  },
  nsInput: {
    marginLeft: theme.spacing(2.5),
  },
  mainDiv: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  descDiv: {
    marginTop: theme.spacing(6),
  },
}));

export default useStyles;
