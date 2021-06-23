import { makeStyles, Theme } from '@material-ui/core/styles';

interface StyleProps {
  horizontal: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  // Graph options
  graphOptions: {
    color: theme.palette.text.disabled,
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
  },
  layoutButton: {
    minWidth: 0,
    borderColor: theme.palette.text.hint,
    marginRight: theme.spacing(2),
    '& svg': {
      fill: theme.palette.text.disabled,
    },
  },

  // Workflow Graph
  dagreGraph: {
    width: '100%',
    minHeight: '25%',
    height: '100%',
    cursor: 'grab',

    // Styles for nodes
    '& g g.nodes': {
      '& g.node': {
        cursor: 'pointer',
        fill: 'none',
        '& g.label g': {
          transform: (props: StyleProps) =>
            props.horizontal ? 'translate(0, 0)' : 'translate(0, -5px)',
          '& path': {
            fill: theme.palette.common.white,
          },
        },
        '& text': {
          fill: theme.palette.text.primary,
        },
      },
      '& path.pendingIcon': {
        transform: (props: StyleProps) =>
          `scale(1.8) translate(-5px, ${props.horizontal ? -5.6 : -2.8}px)`,
      },
      '& path.runningIcon': {
        transformOrigin: '6.05px 6.55px',
        animation: 'runningNodeSpinAnimation 2s ease-in-out infinite',
      },
      '& path.succeededIcon': {
        transform: (props: StyleProps) =>
          `scale(1.8) translate(-5px, ${props.horizontal ? -3.6 : -1}px)`,
      },
      '& path.failedIcon': {
        transform: (props: StyleProps) =>
          `scale(1.5) translate(-5px, ${props.horizontal ? -5.5 : -2.5}px)`,
      },
      '& path.errorIcon': {
        transform: (props: StyleProps) =>
          `scale(1.8) translate(-8px, ${props.horizontal ? -8.5 : -5.8}px)`,
      },
      '& path.omittedIcon': {
        transform: (props: StyleProps) =>
          `scale(1.8) translate(-8.5px, ${props.horizontal ? -9 : -6}px)`,
      },
      '& path.skippedIcon': {
        transform: (props: StyleProps) =>
          `scale(1.8) translate(-8px, ${props.horizontal ? -8 : -5}px)`,
      },
      '& g.Succeeded': {
        '& circle': {
          fill: theme.palette.success.main,
        },
        '& circle.selected': {
          strokeDasharray: '5,2',
          stroke: theme.palette.success.main,
          fill: 'none',
          strokeWidth: '1.5',
        },
      },
      '& g.Running': {
        '& circle': {
          fill: theme.palette.highlight,
        },
        '& circle.selected': {
          strokeDasharray: '5,2',
          stroke: theme.palette.highlight,
          fill: 'none',
          strokeWidth: '1.5',
        },
      },
      '& g.Pending': {
        '& circle': {
          fill: theme.palette.horizontalStepper.completed,
        },
        '& circle.selected': {
          strokeDasharray: '5,2',
          stroke: theme.palette.horizontalStepper.completed,
          fill: 'none',
          strokeWidth: '1.5',
        },
      },
      '& g.Failed': {
        '& circle': {
          fill: theme.palette.status.experiment.failed,
        },
        '& circle.selected': {
          strokeDasharray: '5,2',
          stroke: theme.palette.status.experiment.failed,
          fill: 'none',
          strokeWidth: '1.5',
        },
      },
      '& g.Omitted': {
        '& circle': {
          fill: '#A93DDB',
        },
        '& circle.selected': {
          strokeDasharray: '5,2',
          stroke: '#A93DDB',
          fill: 'none',
          strokeWidth: '1.5',
        },
      },
      '& g.Skipped': {
        '& circle': {
          fill: '#0098DD',
        },
        '& circle.selected': {
          strokeDasharray: '5,2',
          stroke: '#0098DD',
          fill: 'none',
          strokeWidth: '1.5',
        },
      },
      '& g.Error': {
        '& circle': {
          fill: '#FFA600',
        },
        '& circle.selected': {
          strokeDasharray: '5,2',
          stroke: '#FFA600',
          fill: 'none',
          strokeWidth: '1.5',
        },
      },
      '& g.StepGroup': {
        fill: theme.palette.status.experiment.completed,
        cursor: 'default',
        '& rect': {
          x: '-1.5px',
          y: '-1.5px',
          width: '0.2rem',
          height: '0.2rem',
          rx: '0.625rem !important',
          ry: '0.625rem !important',
        },
      },
    },

    // Styles for edges
    '& g g.edgePaths': {
      '& g.link': {
        fill: theme.palette.status.experiment.completed,
        stroke: theme.palette.status.experiment.completed,
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
}));

export default useStyles;
