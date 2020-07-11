import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  rootContainer: {
    marginLeft: '20rem',
    marginRight: '20rem',
    marginTop: '8rem',
    marginBottom: '8rem',
    paddingBottom: '6rem',
    background: theme.palette.common.white,
    borderRadius: 3,
    textAlign: 'center',
    outline: 'none',
  },
  mark: {
    marginTop: 80,
    textAlign: 'center',
  },
  heading: {
    fontfamily: 'Ubuntu',
    fontstyle: 'normal',
    fontweight: 'normal',
    fontSize: '40px',
    textalign: 'center',
    marginTop: '2rem',
    color: theme.palette.common.black,
  },
  headWorkflow: {
    fontfamily: 'Ubuntu',
    fontstyle: 'normal',
    fontweight: 'normal',
    fontsize: '16px',
    lineheight: '170%',
    textalign: 'center',
    color: theme.palette.common.black,
    marginTop: '2.5rem',
  },

  button: {
    color: 'white',
    textAlign: 'center',
    marginTop: '2rem',
  },
}));

export default useStyles;
