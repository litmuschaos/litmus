import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.customColors.black(0.03),
    borderRadius: '3px',
    borderLeft: `6px solid ${theme.palette.secondary.dark} `,
    marginBottom: theme.spacing(1.25),
  },
  rootContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  mainDiv: {
    padding: theme.spacing(2.5, 0, 2.5, 2.5),
  },
  mainText: {
    fontWeight: 'bold',
    fontSize: '1.25rem',
    color: theme.palette.common.black,
  },
  textDesc: {
    fontSize: '1rem',
    paddingTop: theme.spacing(1.25),
    color: theme.palette.common.black,
  },
  guideLink: {
    color: theme.palette.common.black,
    paddingLeft: theme.spacing(1.5),
    paddingTop: theme.spacing(-1.25),
  },
  closeIcon: {
    color: theme.palette.common.black,
  },
  imgDiv: {
    display: 'block',
    paddingTop: theme.spacing(3.125),
  },
  iconDiv: {
    marginLeft: 'auto',
  },
}));

export default useStyles;
