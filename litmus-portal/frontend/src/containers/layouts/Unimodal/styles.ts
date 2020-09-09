import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  modalContainer: (props: any) => ({
    height: '85%',
    width: '70%',
    padding: '1rem',
    margin: '2rem auto',
    background: props.isDark ? '#1C1C1C' : theme.palette.common.white,
    borderRadius: 3,
    textAlign: props.textAlign ? props.textAlign : 'center',
    outline: 'none',
    overflowX: 'hidden',
    overflowY: 'auto',
  }),

  modalContainerClose: {
    paddingLeft: theme.spacing(72),
    paddingRight: theme.spacing(0),
    paddingBottom: theme.spacing(0),
  },

  closeButton: (props: any) => ({
    fontSize: '1rem',
    fontWeight: 1000,
    display: 'inline-block',
    padding: `${theme.spacing(0.375)} ${theme.spacing(1.5)}`,
    minHeight: 0,
    minWidth: 0,
    borderRadius: 3,
    color: props.isDark
      ? theme.palette.secondary.contrastText
      : 'rgba(0, 0, 0, 0.4)',
    border: props.isDark
      ? '1px solid rgba(255, 255, 255, 0.2)'
      : '1px solid rgba(0, 0, 0, 0.4)',
    marginLeft: props.isDark ? '82.5%' : '60%',
    marginTop: theme.spacing(5),
  }),
}));

export default useStyles;
