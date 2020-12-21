import * as d3 from 'd3';
import dagreD3, { GraphLabel, Node } from 'dagre-d3';
import React, { Component, createRef } from 'react';

interface GraphProps {
  nodes: d3Node[];
  links: d3Link[];
  zoomable?: boolean;
  fitBoundaries?: boolean;
  height?: string;
  width?: string;
  config?: GraphLabel;
  animate?: number;
  className?: string;
  shape?: shapes;
  onNodeClick?: nodeClick;
  onRelationshipClick?: relationshipClick;
}
type shapes = 'rect' | 'circle' | 'ellipse';
type labelType = 'html' | 'svg' | 'string';

type nodeClick = (nodeData: {
  d3node: Node;
  original: d3Node | undefined;
}) => void;

type relationshipClick = (nodeData: {
  d3source: Node;
  source: d3Node | undefined;
  d3target: Node;
  target: d3Node | undefined;
}) => void;

export type d3Node = {
  id: any;
  label: string | SVGElement;
  class?: string;
  labelType?: labelType;
  config?: object;
};
export type d3Link = {
  source: string;
  target: string;
  class?: string;
  label?: string;
  config?: object;
};
type Relationship = {
  v: any;
  w: any;
};

class DagreGraph extends Component<GraphProps> {
  svg = createRef<SVGSVGElement>();
  innerG = createRef<SVGSVGElement>();

  static defaultProps = {
    zoomable: false,
    fitBoundaries: false,
    className: 'dagre-d3-react',
  };
  componentDidMount() {
    this._drawChart();
  }
  componentDidUpdate() {
    this._drawChart();
  }

  _drawChart = () => {
    const {
      nodes,
      links,
      zoomable,
      fitBoundaries,
      config,
      animate,
      shape,
      onNodeClick,
      onRelationshipClick,
    } = this.props;
    const g = new dagreD3.graphlib.Graph().setGraph(config || {});

    nodes.forEach((node) =>
      g.setNode(node.id, {
        label: node.label,
        class: node.class || '',
        labelType: node.labelType || 'string',
        ...node.config,
      })
    );

    if (shape) {
      g.nodes().forEach((v) => {
        g.node(v).shape = shape;
      });
    }

    links.forEach((link) => {
      g.setEdge(link.source, link.target, {
        label: link.label || '',
        class: link.class || '',
        ...link.config,
      });
    });

    const render = new dagreD3.render();
    const svg: any = d3.select(this.svg.current);
    const inner: any = d3.select(this.innerG.current);

    const zoom = d3
      .zoom()
      .on('zoom', () => inner.attr('transform', d3.event.transform));

    if (zoomable) {
      svg.call(zoom);
    }
    if (animate) {
      g.graph().transition = function transition(selection) {
        return selection.transition().duration(animate || 1000);
      };
    }

    render(inner, g);

    if (fitBoundaries) {
      // @BertCh recommendation for fitting boundaries
      const { width, height, x, y } = inner.node().getBBox();
      const parent = inner.node().parentElement || inner.node().parentNode;
      const fullWidth = parent.clientWidth || parent.parentNode.clientWidth;
      const fullHeight = parent.clientHeight || parent.parentNode.clientHeight;
      const midX = x + width / 2;
      const midY = y + height / 2;

      if (width === 0 || height === 0) return; // nothing to fit
      const scale = 0.9 / Math.max(width / fullWidth, height / fullHeight);
      const translate = [
        fullWidth / 2 - scale * midX,
        fullHeight / 2 - scale * midY,
      ];
      const transform = d3.zoomIdentity
        .translate(translate[0], translate[1])
        .scale(scale);

      svg
        .transition()
        .duration(animate || 0) // milliseconds
        .call(zoom.transform, transform);
    }

    if (onNodeClick) {
      svg.selectAll('g.node').on('click', (id: any) => {
        const _node: Node = g.node(id);
        const _original = this._getNodeData(id);
        onNodeClick({ d3node: _node, original: _original });
      });
    }
    if (onRelationshipClick) {
      svg
        .selectAll('g.edgeLabel, g.edgePath')
        .on('click', (id: Relationship) => {
          const _source = g.node(id.v);
          const _original_source = this._getNodeData(id.v);

          const _target = g.node(id.w);
          const _original_target = this._getNodeData(id.w);
          onRelationshipClick({
            d3source: _source,
            source: _original_source,
            d3target: _target,
            target: _original_target,
          });
        });
    }
  };

  _getNodeData(id: any) {
    const { nodes } = this.props;
    return nodes.find((node) => node.id === id);
  }

  render() {
    const { width, height, className } = this.props;
    return (
      <svg
        width={width}
        height={height}
        ref={this.svg}
        className={className || ''}
      >
        <g ref={this.innerG} />
      </svg>
    );
  }
}

export default DagreGraph;
