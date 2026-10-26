import { defaultTo, throttle } from 'lodash-es';
import { NodeType, PipelineGraphState, SVGPathRecord, KVPair, ExecutionStatusEnum } from '../types';

const INITIAL_ZOOM_LEVEL = 1;
const ZOOM_INC_DEC_LEVEL = 0.1;
const toFixed = (num: number): number => Number(num.toFixed(2));
const getScaledValue = (value: number, scalingFactor: number): number => {
  let finalValue;

  if (scalingFactor === 1.0) {
    finalValue = value;
  } else if (scalingFactor > 1) {
    finalValue = value / scalingFactor;
  } else {
    finalValue = value * (1 / scalingFactor);
  }
  return toFixed(finalValue);
};
interface DrawSVGPathOptions {
  isParallelNode?: boolean;
  parentElement?: HTMLDivElement;
  direction?: 'rtl' | 'ltl' | 'rtr';
  styles?: React.CSSProperties;
  nextNode?: string;
  parentNode?: string;
  scalingFactor?: number;
  dataProps?: KVPair;
}
/**
 * Direction of SVG Path (Only supported for straight horizontal lines)
 * 'rtl' ---> Right of Element1 to Left of Element2
 * 'ltl' ---> Left of Element1 to Left of Element2
 * 'rtr' ---> Left of Element1 to Right of Element2
 **/
const getFinalSVGArrowPath = (id1 = '', id2 = '', options?: DrawSVGPathOptions): SVGPathRecord => {
  const scalingFactor = defaultTo(options?.scalingFactor, 1);
  const node1 = getComputedPosition(id1, options?.parentElement);
  const node2 = getComputedPosition(id2, options?.parentElement);
  if (!node1 || !node2) {
    return { [id1]: { pathData: '', dataProps: options?.dataProps } };
  }
  let finalSVGPath = '';
  const node1VerticalMid = getScaledValue(node1.top + node1.height / 2, scalingFactor);
  const node2VerticalMid = getScaledValue(node2.top + node2.height / 2, scalingFactor);

  const startPoint = `${getScaledValue(node1.right, scalingFactor)},${node1VerticalMid}`;
  const horizontalMid = Math.abs((node1.right + node2.left) / 2);
  const endPoint = `${getScaledValue(node2.left, scalingFactor)},${node2VerticalMid}`;
  const node1Y = Math.round(node1.y);
  const node2Y = Math.round(node2.y);

  if (node2Y < node1Y) {
    //  child node is at top
    const curveLeftToTop = `Q${horizontalMid},${node1VerticalMid} ${horizontalMid},${node1VerticalMid - 20}`;
    const curveBottomToRight = `Q${horizontalMid},${node2VerticalMid} ${horizontalMid + 20},${node2VerticalMid}`;
    finalSVGPath = `M${startPoint} L${horizontalMid - 20},${node1VerticalMid} ${curveLeftToTop} 
    L${horizontalMid},${node2VerticalMid + 20} ${curveBottomToRight} L${endPoint}`;
  } else if (node1Y === node2Y) {
    // both nodes are at same level vertically
    if (options?.direction === 'ltl') {
      const startPointLeft = `${node1.left},${node1VerticalMid}`;
      finalSVGPath = `M${startPointLeft}  L${endPoint}`;
    } else if (options?.direction === 'rtr') {
      const endPointRight = `${getScaledValue(node2.right, scalingFactor)},${node2VerticalMid}`;
      finalSVGPath = `M${startPoint}  L${endPointRight}`;
    } else {
      finalSVGPath = `M${startPoint}  L${endPoint}`;
    }
  } else {
    //  child node is at bottom
    const curveLeftToBottom = `Q${horizontalMid},${node1VerticalMid} ${horizontalMid},${node1VerticalMid + 20}`;

    const curveTopToRight = `Q${horizontalMid},${node2VerticalMid} ${horizontalMid + 20},${node2VerticalMid}`;

    if (options?.isParallelNode) {
      const updatedStart = getScaledValue(node1.left, scalingFactor) - 45; // new start point
      const parallelLinkStart = `${
        updatedStart // half of link length
      },${node1VerticalMid}`;

      const curveLBparallel = `Q${updatedStart + 20},${node1VerticalMid} ${updatedStart + 20},${
        node1VerticalMid + 20
      } `;
      const curveTRparallel = `Q${updatedStart + 20},${node2VerticalMid} ${updatedStart + 40},${node2VerticalMid}`;

      const firstCurve = `M${parallelLinkStart} 
      ${curveLBparallel} 
      L${updatedStart + 20},${node2VerticalMid - 20} 
      ${curveTRparallel} 
      L${getScaledValue(node1.left, scalingFactor)},${node2VerticalMid}`;

      let secondCurve = '';
      if (options?.nextNode && options?.parentNode) {
        const nextNode = getComputedPosition(options.nextNode, options?.parentElement);
        const parentNode = getComputedPosition(options.parentNode, options?.parentElement);
        if (!nextNode || !parentNode) {
          return { [id1]: { pathData: '', dataProps: options?.dataProps } };
        }
        const childEl = document.getElementById(options.parentNode);
        const parentGraphNodeContainer = getComputedPosition(
          childEl?.closest('.pipeline-graph-node') as HTMLElement,
          options?.parentElement
        ) as DOMRect;
        const newRight = getScaledValue(
          parentGraphNodeContainer?.right > node2.right ? parentGraphNodeContainer?.right : node2.right,
          scalingFactor
        );
        const nextNodeVerticalMid = getScaledValue(nextNode.top + nextNode.height / 2, scalingFactor);

        secondCurve = `M${getScaledValue(node2.right, scalingFactor)},${node2VerticalMid}
        L${newRight + 10},${node2VerticalMid}
        Q${newRight + 25},${node2VerticalMid} ${newRight + 25},${node2VerticalMid - 20}
        L${newRight + 25},${nextNodeVerticalMid + 20}
        Q${newRight + 25},${nextNodeVerticalMid} ${newRight + 40},${nextNodeVerticalMid}`;
      } else {
        secondCurve = `M${getScaledValue(node2.right, scalingFactor)},${node2VerticalMid}
        L${getScaledValue(node2.right, scalingFactor) + 10},${node2VerticalMid}
        Q${getScaledValue(node2.right, scalingFactor) + 25},${node2VerticalMid} ${
          getScaledValue(node2.right, scalingFactor) + 25
        },${node2VerticalMid - 20}
        L${getScaledValue(node2.right, scalingFactor) + 25},${node1VerticalMid + 20}
        Q${getScaledValue(node2.right, scalingFactor) + 25},${node1VerticalMid} ${
          getScaledValue(node2.right, scalingFactor) + 40
        },${node1VerticalMid}`;
      }
      finalSVGPath = firstCurve + secondCurve;
      return {
        [id1]: { pathData: firstCurve, dataProps: options?.dataProps },
        [id2]: { pathData: secondCurve, dataProps: options?.dataProps }
      };
    } else {
      finalSVGPath = `M${startPoint} L${horizontalMid - 20},${node1VerticalMid} ${curveLeftToBottom} 
    L${horizontalMid},${node2VerticalMid - 20} ${curveTopToRight} L${endPoint}`;
    }
  }
  return { [id1]: { pathData: finalSVGPath, dataProps: options?.dataProps } };
};

const getComputedPosition = (childId: string | HTMLElement, parentElement?: HTMLDivElement): DOMRect | null => {
  try {
    const childEl = typeof childId === 'string' ? (document.getElementById(childId) as HTMLDivElement) : childId;
    const childPos = childEl?.getBoundingClientRect() as DOMRect;
    const parentPos = defaultTo(parentElement, childEl.closest('#tree-container'))?.getBoundingClientRect() as DOMRect;

    const updatedTop = childPos.top - parentPos.top;

    const updatedLeft = childPos.left - parentPos.left;

    const updatedRight = updatedLeft + childPos.width;

    const updatedBottom = updatedTop + childPos.height;

    const updatedPos: DOMRect = {
      ...childPos,
      left: getScaledValue(updatedLeft, 1),
      top: getScaledValue(updatedTop, 1),
      right: getScaledValue(updatedRight, 1),
      bottom: updatedBottom,
      width: childPos.height,
      height: childPos.height,
      x: childPos.x,
      y: childPos.y
    };
    return updatedPos;
  } catch (e) {
    return null;
  }
};

export const scrollZoom = (
  container: HTMLElement,
  max_scale: number,
  factor: number,
  callback: (newScale: number) => void
): void => {
  let scale = 1;
  container.style.transformOrigin = '0 0';
  container.onwheel = scrolled;

  function scrolled(e: any): void {
    if (!e.ctrlKey) return;
    e.preventDefault();
    let delta = e.delta || e.wheelDelta;
    if (delta === undefined) {
      //we are on firefox
      delta = e.detail;
    }
    delta = Math.max(-1, Math.min(1, delta)); // cap the delta to [-1,1] for cross browser consistency
    // apply zoom
    scale += delta * factor * scale;
    scale = Math.min(max_scale, scale);
    callback(scale);
  }
};

const setupDragEventListeners = (draggableParent: HTMLElement, overlay: HTMLElement): void => {
  draggableParent.onmousedown = function (event) {
    if (event?.target !== draggableParent) {
      return;
    }
    const initialX = event.pageX;
    const initialY = event.pageY;
    const overlayPosition = getComputedPosition(overlay, draggableParent as HTMLDivElement) as DOMRect;
    const moveAt = (pageX: number, pageY: number): void => {
      const newX = overlayPosition?.left + pageX - initialX;
      const newY = overlayPosition?.top + pageY - initialY;
      overlay.style.transform = `translate(${newX}px,${newY}px)`;
    };

    const onMouseMove = throttle((e: MouseEvent): void => {
      moveAt(e.pageX, e.pageY);
    }, 16);

    draggableParent.addEventListener('mousemove', onMouseMove);
    draggableParent.onmouseup = function () {
      draggableParent.removeEventListener('mousemove', onMouseMove);
      draggableParent.onmouseup = null;
    };
    draggableParent.onmouseleave = function () {
      draggableParent.removeEventListener('mousemove', onMouseMove);
    };
  };
};

const getSVGLinksFromPipeline = (
  states?: PipelineGraphState[],
  parentElement?: HTMLDivElement,
  resultArr: SVGPathRecord[] = [],
  endNodeId?: string,
  scalingFactor?: number
): SVGPathRecord[] => {
  let prevElement: PipelineGraphState;

  states?.forEach((state, index) => {
    if (state?.children?.length) {
      const nextNodeId = states?.[index + 1]?.id || endNodeId;
      getParallelNodeLinks(state?.children, state, resultArr, parentElement, nextNodeId, state.id, scalingFactor);
    }
    if (prevElement) {
      resultArr.push(
        getFinalSVGArrowPath(prevElement.id, state.id, {
          isParallelNode: false,
          parentElement,
          scalingFactor,
          dataProps: {
            'data-link-executed': String(state.status !== ExecutionStatusEnum.NotStarted)
          }
        })
      );
    }
    prevElement = state;
  });
  return resultArr;
};

const getParallelNodeLinks = (
  stages: PipelineGraphState[],
  firstStage: PipelineGraphState | undefined,
  resultArr: SVGPathRecord[] = [],
  parentElement?: HTMLDivElement,
  nextNode?: string,
  parentNode?: string,
  scalingFactor?: number
): void => {
  stages?.forEach(stage => {
    resultArr.push(
      getFinalSVGArrowPath(firstStage?.id as string, stage?.id, {
        isParallelNode: true,
        parentElement,
        nextNode,
        parentNode,
        scalingFactor,
        dataProps: {
          'data-link-executed': String(stage.status !== ExecutionStatusEnum.NotStarted)
        }
      })
    );
  });
};

const getScaleToFitValue = (
  elm: HTMLElement,
  containerEl?: HTMLElement,
  paddingHorizontal = 0,
  paddingVertical = 20
): number => {
  const width = elm.scrollWidth;
  const height = elm.scrollHeight;
  const container = containerEl ? containerEl : document.body;
  return (
    1 /
    Math.max(
      width / (container.offsetWidth - paddingHorizontal),
      height / (container.offsetHeight - container.offsetTop - paddingVertical)
    )
  );
};

const NodeTypeToNodeMap: Record<string, string> = {
  Deployment: NodeType.Default,
  CI: NodeType.Default,
  Pipeline: NodeType.Default,
  Custom: NodeType.Default,
  Approval: NodeType.Default
};

const getTerminalNodeLinks = ({
  firstNodeId = '',
  lastNodeId = '',
  createNodeId,
  startNodeId,
  endNodeId,
  readonly = false,
  scalingFactor
}: {
  startNodeId: string;
  endNodeId: string;
  firstNodeId?: string;
  lastNodeId?: string;
  createNodeId?: string;
  readonly?: boolean;
  scalingFactor?: number;
}): SVGPathRecord[] => {
  const finalNodeLinks: SVGPathRecord[] = [];
  if (firstNodeId && !readonly) {
    finalNodeLinks.push(
      ...[
        getFinalSVGArrowPath(startNodeId, firstNodeId, { scalingFactor }),
        getFinalSVGArrowPath(lastNodeId, createNodeId, { scalingFactor }),
        getFinalSVGArrowPath(createNodeId, endNodeId, { scalingFactor })
      ]
    );
  }
  if (firstNodeId && readonly) {
    finalNodeLinks.push(
      ...[
        getFinalSVGArrowPath(startNodeId, firstNodeId, { scalingFactor }),
        getFinalSVGArrowPath(lastNodeId, endNodeId, { scalingFactor })
      ]
    );
  }
  if (!firstNodeId && !readonly) {
    finalNodeLinks.push(
      ...[
        getFinalSVGArrowPath(startNodeId, createNodeId, { scalingFactor }),
        getFinalSVGArrowPath(createNodeId, endNodeId, { scalingFactor })
      ]
    );
  }
  return finalNodeLinks;
};
export interface RelativeBounds {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const getRelativeBounds = (parentElement: HTMLElement, targetElement: HTMLElement): RelativeBounds => {
  const parentPos = parentElement.getBoundingClientRect();
  const childPos = targetElement.getBoundingClientRect();
  const relativePos: RelativeBounds = { top: 0, right: 0, bottom: 0, left: 0 };

  relativePos.top = childPos.top - parentPos.top;
  relativePos.right = childPos.right - parentPos.right;
  relativePos.bottom = childPos.bottom - parentPos.bottom;
  relativePos.left = childPos.left - parentPos.left;
  return relativePos;
};

const dispatchCustomEvent = (type: string, data: KVPair): void => {
  const event = new Event(type, data);
  document.dispatchEvent(event);
};
const CANVAS_CLICK_EVENT = 'CANVAS_CLICK_EVENT';
export {
  ZOOM_INC_DEC_LEVEL,
  INITIAL_ZOOM_LEVEL,
  CANVAS_CLICK_EVENT,
  NodeTypeToNodeMap,
  getScaleToFitValue,
  getComputedPosition,
  getFinalSVGArrowPath,
  setupDragEventListeners,
  getSVGLinksFromPipeline,
  getTerminalNodeLinks,
  getRelativeBounds,
  dispatchCustomEvent
};
