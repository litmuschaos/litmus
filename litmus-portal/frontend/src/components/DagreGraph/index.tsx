/* eslint-disable */
import * as d3 from 'd3';
import dagreD3, { GraphLabel } from 'dagre-d3';
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
  onNodeClick?: Function;
  onRelationshipClick?: Function;
}
type shapes = 'rect' | 'circle' | 'ellipse';
type labelType = 'html' | 'svg' | 'string';

type d3Node = {
  id: any;
  label: string;
  class?: string;
  labelType?: labelType;
  config?: object;
};
type d3Link = {
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

  _getNodeData(id: any) {
    return this.props.nodes.find((node) => node.id === id);
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
    let g = new dagreD3.graphlib.Graph().setGraph(config || {});

    nodes.forEach((node) =>
      g.setNode(node.id, {
        label: node.label,
        class: node.class || '',
        labelType: node.labelType || 'string',
        ...node.config,
      })
    );

    if (shape) {
      g.nodes().forEach((v) => (g.node(v).shape = shape));
    }

    links.forEach((link) =>
      g.setEdge(link.source, link.target, {
        label: link.label || '',
        class: link.class || '',
        ...link.config,
      })
    );

    let render = new dagreD3.render();
    let svg: any = d3.select(this.svg.current);
    let inner: any = d3.select(this.innerG.current);

    let zoom = d3
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
      //@BertCh recommendation for fitting boundaries
      const bounds = inner.node().getBBox();
      const parent = inner.node().parentElement || inner.node().parentNode;
      const fullWidth = parent.clientWidth || parent.parentNode.clientWidth;
      const fullHeight = parent.clientHeight || parent.parentNode.clientHeight;
      const width = bounds.width;
      const height = bounds.height;
      const midX = bounds.x + width / 2;
      const midY = bounds.y + height / 2;
      if (width === 0 || height === 0) return; // nothing to fit
      var scale = 0.9 / Math.max(width / fullWidth, height / fullHeight);
      var translate = [
        fullWidth / 2 - scale * midX,
        fullHeight / 2 - scale * midY,
      ];
      var transform = d3.zoomIdentity
        .translate(translate[0], translate[1])
        .scale(scale);

      svg
        .transition()
        .duration(animate || 0) // milliseconds
        .call(zoom.transform, transform);
    }

    if (onNodeClick) {
      svg.selectAll('g.node').on('click', (id: any) => {
        let _node = g.node(id);
        let _original = this._getNodeData(id);
        onNodeClick({ d3node: _node, original: _original });
      });
    }
    if (onRelationshipClick) {
      svg
        .selectAll('g.edgeLabel, g.edgePath')
        .on('click', (id: Relationship) => {
          let _source = g.node(id.v);
          let _original_source = this._getNodeData(id.v);

          let _target = g.node(id.w);
          let _original_target = this._getNodeData(id.w);
          onRelationshipClick({
            d3source: _source,
            source: _original_source,
            d3target: _target,
            target: _original_target,
          });
        });
    }
  };

  render() {
    return (
      <svg
        width={this.props.width}
        height={this.props.height}
        ref={this.svg}
        className={this.props.className || ''}
      >
        <g ref={this.innerG} />
      </svg>
    );
  }
}

export default DagreGraph;
export type { d3Node, d3Link };
