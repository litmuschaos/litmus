import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  // Styles for Header
  appBar: {
    backgroundColor: '#F5F6F8',
    height: '5rem',
    position: 'sticky',
  },
  toolBar: {
    height: '5rem',
    display: 'flex',
    padding: theme.spacing(0, 7.5),
    '& nav': {
      flexGrow: 1,
    },
  },
  projectDropdown: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.common.black,
    '& button': {
      marginTop: theme.spacing(0.25),
    },
  },
}));

export default useStyles;
