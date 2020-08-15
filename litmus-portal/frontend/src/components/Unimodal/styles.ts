import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  modalContainer: {
    height: '85%',
    width: '70%',
    margin: '2rem auto',
    background: theme.palette.common.white,
    borderRadius: 3,
    textAlign: 'center',
    outline: 'none',
  },

  modalContainerClose: {
    paddingLeft: theme.spacing(72),
    paddingRight: theme.spacing(0),
    paddingBottom: theme.spacing(0),
  },

  closeButton: {
    fontSize: '1rem',
    fontWeight: 1000,
    display: 'inline-block',
    padding: `${theme.spacing(0.375)} ${theme.spacing(1.5)}`,
    minHeight: 0,
    minWidth: 0,
    borderRadius: 3,
    color: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(0, 0, 0, 0.4)',
    marginLeft: '60%',
    marginTop: theme.spacing(5),
  },
}));

export default useStyles;
