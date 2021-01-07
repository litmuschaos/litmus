import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  modalContainer: (props: any) => ({
    height: '85%',
    width: '70%',
    padding: '1rem',
    margin: '2rem auto',
    background: props.isDarkBg
      ? theme.palette.common.black
      : theme.palette.common.white,
    borderRadius: 3,
    textAlign: props.textAlign ?? 'center',
    outline: 'none',
    overflowX: 'hidden',
    overflowY: 'auto',
  }),

  modalContainerClose: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: theme.spacing(1),
  },

  closeButton: (props: any) => ({
    fontSize: '1rem',
    fontWeight: 1000,
    minHeight: 0,
    minWidth: 0,
    borderRadius: 3,
    color: props.isDarkBg
      ? theme.palette.secondary.contrastText
      : theme.palette.text.primary,
    border: '1px solid',
    borderColor: props.isDarkBg
      ? theme.palette.secondary.contrastText
      : theme.palette.background.paper,
  }),

  uniModalStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.palette.background.default,
  },
}));

export default useStyles;
