import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import DagreGraph, { d3Link, d3Node } from '../../../../components/DagreGraph';
import { Steps } from '../../../../models/redux/customyaml';
import { RootState } from '../../../../redux/reducers';
import { extractSteps } from '../ExtractSteps';
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
      if (steps[i].length > 1) {
        for (let j = 0; j < steps[i].length; j++) {
          data.nodes.push({
            id: i.toString(),
            label: steps[i][j].name,
            config: { fullName: steps[i][j].name },
          });
        }
      } else {
        data.nodes.push({
          id: i.toString(),
          label: steps[i][0].name,
          config: { fullName: steps[i][0].name },
        });
      }
    }

    for (let i = 0; i < steps.length - 1; i++) {
      data.links.push({
        source: i.toString(),
        target: (i + 1).toString(),
      });
    }

    setGraphData({
      nodes: [...data.nodes],
      links: [...data.links],
    });
  }, [manifest]);

  return (
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
  );
};

export default WorkflowPreview;
