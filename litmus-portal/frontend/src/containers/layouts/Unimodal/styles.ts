import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  modalContainer: (props: any) => ({
    height: '85%',
    width: '70%',
    padding: '1rem',
    margin: '2rem auto',
    background: props.isDarkBg
      ? theme.palette.editorBackground
      : theme.palette.common.white,
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
    color: props.isDarkBg
      ? theme.palette.secondary.contrastText
      : theme.palette.customColors.black(0.4),
    border: '1px solid',
    borderColor: props.isDarkBg
      ? theme.palette.customColors.white(0.2)
      : theme.palette.customColors.black(0.4),
    marginLeft: props.isDarkBg ? '82.5%' : '60%',
    marginTop: theme.spacing(5),
  }),

  uniModalStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.palette.customColors.black(0.8),
  },
}));

export default useStyles;
