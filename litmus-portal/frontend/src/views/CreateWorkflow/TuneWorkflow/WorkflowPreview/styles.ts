import { makeStyles, Theme } from '@material-ui/core/styles';

interface StyleProps {
  horizontal: boolean;
  isSequence: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  // Workflow Graph
  dagreGraph: {
    cursor: 'grab',
    height: (props: StyleProps) => (props.isSequence ? '30rem' : '23rem'),
    width: '100%',

    // Styles for nodes
    '& g g.nodes': {
      '& g.node': {
        cursor: 'pointer',
        fill: 'none',
        '& circle': {
          fill: theme.palette.status.experiment.completed,
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
      '& g.StepGroup.Succeeded': {
        fill: theme.palette.status.experiment.completed,
      },
    },

    // Styles for edges
    '& g g.edgePaths': {
      '& g.succeeded': {
        fill: theme.palette.status.experiment.completed,
        stroke: theme.palette.status.experiment.completed,
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
