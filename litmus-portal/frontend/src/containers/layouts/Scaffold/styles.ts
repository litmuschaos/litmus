import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'fixed',
    overflow: 'hidden',
    height: '100vh',
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '20.5em auto',
    gridTemplateRows: '6.5em auto',
    gridTemplateAreas: '"header header" "sidebar content"',
    fontFamily: 'Ubuntu',

    '& ::-webkit-scrollbar': {
      width: '0.4rem',
      height: '0.4rem',
    },
    '& ::-webkit-scrollbar-track': {
      marginTop: theme.spacing(1),
      webkitBoxShadow: `inset 0 0 8px ${theme.palette.common.black}`,
      backgroundColor: theme.palette.border.main,
    },
    '& ::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.highlight,
      borderRadius: 8,
    },
    '& img': {
      userDrag: 'none',
    },
  },
  header: {
    gridArea: 'header',
  },
  content: {
    gridArea: 'content',
    padding: theme.spacing(5, 7.5),
    overflowY: 'scroll',
  },
  sidebar: {
    gridArea: 'sidebar',
  },
}));

export default useStyles;
