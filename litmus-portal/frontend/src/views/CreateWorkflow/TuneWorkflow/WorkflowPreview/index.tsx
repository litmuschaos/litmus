import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import DagreGraph, { d3Link, d3Node } from '../../../../components/DagreGraph';
import { Steps } from '../../../../models/redux/customyaml';
import { RootState } from '../../../../redux/reducers';
import { extractSteps } from '../ExtractSteps';
import { createLabel } from './createLabel';
import useStyles from './styles';

interface GraphData {
  nodes: d3Node[];
  links: d3Link[];
}

interface WorkflowPreviewProps {
  isCustom: boolean;
}

const WorkflowPreview: React.FC<WorkflowPreviewProps> = ({ isCustom }) => {
  let steps: Steps[][] = [];
  const updatedSteps: Steps[][] = [];

  const manifest = useSelector(
    (state: RootState) => state.workflowManifest.manifest
  );

  // Graph orientation
  const horizontal = false;
  const classes = useStyles({ horizontal });

  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });

  if (manifest !== '') {
    steps = extractSteps(isCustom, manifest);
  }

  useEffect(() => {
    const data: GraphData = {
      nodes: [],
      links: [],
    };

    for (let i = 0; i < steps.length; i++) {
      updatedSteps.push(steps[i]);
      if (i !== steps.length - 1) {
        updatedSteps.push([
          {
            name: 'StepGroup',
            template: 'StepGroup',
          },
        ]);
      }
    }

    for (let i = 0; i < steps.length; i++) {
      if (steps[i].length > 1) {
        for (let j = 0; j < steps[i].length; j++) {
          data.nodes.push({
            id: i.toString(),
            class: `${'succeeded'} ${'steps'}`,
            label: createLabel({
              label: steps[i][j].name,
              tooltip: steps[i][j].name,
              phase: 'succeeded',
              horizontal,
            }),
            labelType: steps[i][j].name !== 'StepGroup' ? 'svg' : 'string',
            config: { fullName: steps[i][j].name },
          });
        }
      } else {
        data.nodes.push({
          id: i.toString(),
          class: `${'succeeded'} ${'steps'}`,
          label: createLabel({
            label: steps[i][0].name,
            tooltip: steps[i][0].name,
            phase: 'succeeded',
            horizontal,
          }),
          labelType: steps[i][0].name !== 'StepGroup' ? 'svg' : 'string',
          config: { fullName: steps[i][0].name },
        });
      }
    }

    for (let i = 0; i < steps.length - 1; i++) {
      if (steps[i].length > 1) {
        for (let j = 0; j < steps[i].length; j++) {
          data.links.push({
            source: i.toString(),
            target: (i + 1).toString(),
            class: 'succeeded',
            config: {
              arrowhead:
                steps[i][0].name === 'StepGroup' ? 'undirected' : 'vee',
            },
          });
        }
      } else {
        data.links.push({
          source: i.toString(),
          target: (i + 1).toString(),
          class: 'succeeded',
          config: {
            arrowhead: steps[i][0].name === 'StepGroup' ? 'undirected' : 'vee',
          },
        });
      }
    }

    setGraphData({
      nodes: [...data.nodes],
      links: [...data.links],
    });
  }, [manifest]);

  return graphData.nodes.length ? (
    <DagreGraph
      className={classes.dagreGraph}
      nodes={graphData.nodes}
      links={graphData.links}
      config={{
        rankdir: horizontal ? 'LR' : 'TB',
        // align: 'UR',
        ranker: 'tight-tree',
      }}
      animate={1000}
      shape="rect"
      fitBoundaries
      zoomable
    />
  ) : (
    <div className={classes.load}>Visualizing your Workflow</div>
  );
};

export default WorkflowPreview;
