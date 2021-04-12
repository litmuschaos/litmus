import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  agentInfoContainer: {
    marginTop: theme.spacing(3.25),
    padding: theme.spacing(3.125, 6.5),
    display: 'flex',
    alignItems: 'center',
  },
  agentInfoBlock: {
    flexGrow: 1,
  },
  agentInfoData: {
    display: 'flex',
    padding: theme.spacing(1),
    maxWidth: '25.5625rem',
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',

    '& div': {
      display: 'flex',
      alignItems: 'baseline',

      '& #agentCount': {
        color: theme.palette.primary.light,
        fontSize: '3.875rem',
      },

      '& #agentDesc': {
        color: theme.palette.text.hint,
        marginLeft: theme.spacing(10.625),
      },

      '& p:nth-child(2)': {
        fontSize: '1.125rem',
        fontWeight: 500,
        marginLeft: theme.spacing(1),
      },
    },
  },
  infoContainerButton: {
    '& svg': {
      margin: theme.spacing(0, 1, -0.625, 0),
    },
  },
}));

export default useStyles;
