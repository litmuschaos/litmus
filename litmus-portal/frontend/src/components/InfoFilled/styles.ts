import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  mainDiv: {
    backgroundColor: (props: { color: string }) => props.color,
    width: '10.625rem',
    height: '12.1875rem',
    marginBottom: theme.spacing(5),
    marginRight: theme.spacing(5),
    borderRadius: 3,
  },
  value: {
    textAlign: 'center',
    paddingTop: theme.spacing(5),
    fontFamily: 'Ubuntu',
    fontSize: '2.5rem',
    color: theme.palette.common.white,
    fontWeight: 500,
  },
  statType: {
    textAlign: 'center',
    fontSize: '1.125rem',
    color: theme.palette.common.white,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  horizontalLine: {
    width: 120,
    opacity: 0.5,
  },
}));

export default useStyles;
