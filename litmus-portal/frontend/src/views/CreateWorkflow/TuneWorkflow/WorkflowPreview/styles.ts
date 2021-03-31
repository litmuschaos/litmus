import { makeStyles, Theme } from '@material-ui/core/styles';

interface StyleProps {
  horizontal: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  // Workflow Graph
  dagreGraph: {
    cursor: 'grab',
    height: '20rem',
    width: '100%',

    // Styles for nodes
    '& g g.nodes': {
      '& g.node': {
        cursor: 'pointer',
        fill: 'none',
        '& circle': {
          fill: theme.palette.status.completed.text,
        },
        '& g.label g': {
          transform: (props: StyleProps) =>
            props.horizontal ? 'translate(0, 0)' : 'translate(0, -5px)',
          '& path': {
            fill: theme.palette.text.secondary,
          },
        },
        '& text': {
          fill: theme.palette.text.primary,
        },
      },
      '& path.succeededIcon': {
        transform: (props: StyleProps) =>
          `scale(1.8) translate(-5px, ${props.horizontal ? -3.6 : -1}px)`,
      },
      '& g.Succeeded': {
        '& circle': {
          fill: theme.palette.status.completed.text,
        },
      },
      '& g.StepGroup': {
        fill: theme.palette.status.pending.text,
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
      '& g.StepGroup.Succeeded': {
        fill: theme.palette.status.completed.text,
      },
    },

    // Styles for edges
    '& g g.edgePaths': {
      '& g.succeeded': {
        fill: theme.palette.status.completed.text,
        stroke: theme.palette.status.completed.text,
      },
    },
  },
  '@global': {
    '@keyframes runningNodeSpinAnimation': {
      from: {
        transform: (props: StyleProps) =>
          `scale(1.5) translate(-4px, ${
            props.horizontal ? -4.3 : -1
          }px) rotate(0deg)`,
      },
      to: {
        transform: (props: StyleProps) =>
          `scale(1.5) translate(-4px, ${
            props.horizontal ? -4.3 : -1
          }px) rotate(360deg)`,
      },
    },
  },
  load: {
    textAlign: 'center',
    marginTop: '50%',
    height: '10rem',
  },
}));

export default useStyles;
