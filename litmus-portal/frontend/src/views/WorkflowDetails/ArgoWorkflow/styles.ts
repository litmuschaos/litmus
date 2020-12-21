import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  dagreGraph: {
    width: '100%',
    height: '90%',

    // Styles for nodes
    '& g g.nodes': {
      '& g.node': {
        cursor: 'pointer',
        fill: 'none',
        '& g.label g': {
          transform: 'translate(0, 0)',
        },
        '& circle:after': {
          content: 'hello',
          display: 'inline-block',
        },
        '& text': {
          fill: theme.palette.text.primary,
        },
      },
      '& g.Succeeded': {
        '& circle': {
          fill: theme.palette.primary.dark,
        },
      },
      '& g.Running': {
        '& circle': {
          fill: theme.palette.warning.main,
        },
      },
      '& g.Pending': {
        '& circle': {
          fill: theme.palette.customColors.gray,
        },
      },
      '& g.Failed': {
        '& circle': {
          fill: theme.palette.error.dark,
        },
      },
      '& g.StepGroup': {
        fill: theme.palette.customColors.gray,
        cursor: 'default',
        '& rect': {
          x: -1.5,
          y: -1.5,
          width: '0.2rem',
          height: '0.2rem',
          rx: '0.625rem !important',
          ry: '0.625rem !important',
        },
      },
    },

    // Styles for edges
    '& g g.edgePaths': {
      stroke: theme.palette.customColors.gray,
    },
  },
}));

export default useStyles;
