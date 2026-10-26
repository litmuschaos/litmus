import React, { useRef, useState, useLayoutEffect, ForwardedRef } from 'react';
import { defaultTo, throttle } from 'lodash-es';
import classNames from 'classnames';
import GroupNode from '../Nodes/GroupNode/GroupNode';
import type {
  NodeCollapsibleProps,
  NodeDetails,
  NodeIds,
  PipelineGraphState,
  GetNodeMethod,
  BaseReactComponentProps,
  FireEventMethod
} from '../types';
import { NodeType } from '../types';
import { useNodeResizeObserver } from '../hooks/useResizeObserver';
import { getRelativeBounds } from './PipelineGraphUtils';
import { isFirstNodeAGroupNode, isNodeParallel, shouldAttachRef, shouldRenderGroupNode, showChildNode } from './utils';
import css from './PipelineGraph.module.scss';

const IS_RENDER_OPTIMIZATION_ENABLED = true;
export interface PipelineGraphRecursiveProps {
  nodes?: PipelineGraphState[];
  getNode: GetNodeMethod;
  getDefaultNode: GetNodeMethod;
  updateGraphLinks?: () => void;
  fireEvent?: FireEventMethod;
  selectedNode: string;
  uniqueNodeIds?: NodeIds;
  startEndNodeNeeded?: boolean;
  parentIdentifier?: string;
  collapsibleProps?: NodeCollapsibleProps;
  readonly?: boolean;
  isDragging?: boolean;
  optimizeRender?: boolean;
  parentSelector?: string;
  createNodeTitle?: string;
  showEndNode?: boolean;
}
export function PipelineGraphRecursive({
  nodes,
  getNode,
  selectedNode,
  fireEvent,
  uniqueNodeIds,
  startEndNodeNeeded = true,
  parentIdentifier,
  updateGraphLinks,
  collapsibleProps,
  getDefaultNode,
  readonly = false,
  isDragging,
  optimizeRender = true,
  parentSelector,
  createNodeTitle,
  showEndNode
}: PipelineGraphRecursiveProps): React.ReactElement {
  const StartNode: React.FC<BaseReactComponentProps> | undefined = getNode(NodeType.StartNode)?.component;
  const CreateNode: React.FC<BaseReactComponentProps> | undefined = getNode(NodeType.CreateNode)?.component;
  const EndNode: React.FC<BaseReactComponentProps> | undefined = getNode(NodeType.EndNode)?.component;
  const PipelineNodeComponent = optimizeRender ? PipelineGraphNodeObserved : PipelineGraphNodeBasic;
  return (
    <div id="tree-container" className={classNames(css.graphTree, css.common)}>
      {StartNode && startEndNodeNeeded && (
        <StartNode id={uniqueNodeIds?.startNode as string} className={classNames(css.graphNode)} />
      )}
      {nodes?.map((node, index) => {
        return (
          <PipelineNodeComponent
            getDefaultNode={getDefaultNode}
            parentIdentifier={parentIdentifier}
            fireEvent={fireEvent}
            selectedNode={selectedNode}
            data={node}
            index={index}
            key={index}
            getNode={getNode}
            isNextNodeParallel={isNodeParallel(nodes?.[index + 1])}
            isPrevNodeParallel={isNodeParallel(nodes?.[index - 1])}
            prevNodeIdentifier={nodes?.[index - 1]?.identifier}
            nextNode={nodes?.[index + 1]}
            prevNode={nodes?.[index - 1]}
            updateGraphLinks={updateGraphLinks}
            collapsibleProps={collapsibleProps}
            readonly={readonly}
            isDragging={isDragging}
            parentSelector={parentSelector}
          />
        );
      })}
      {CreateNode && startEndNodeNeeded && !readonly && (
        <CreateNode
          id={uniqueNodeIds?.createNode as string}
          identifier={uniqueNodeIds?.createNode}
          name={createNodeTitle || 'Add'}
          fireEvent={fireEvent}
          getNode={getNode}
        />
      )}
      {EndNode && showEndNode && startEndNodeNeeded && (
        <EndNode id={uniqueNodeIds?.endNode as string} className={classNames(css.graphNode)} />
      )}
      <div></div>
    </div>
  );
}

interface PipelineGraphNodeWithoutCollapseProps {
  className?: string;
  data: PipelineGraphState;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fireEvent?: (event: any) => void;
  getNode?: GetNodeMethod;
  selectedNode: string;
  setSelectedNode?: (nodeId: string) => void;
  isParallelNode?: boolean;
  isNextNodeParallel?: boolean;
  isPrevNodeParallel?: boolean;
  isLastChild?: boolean;
  prevNodeIdentifier?: string;
  parentIdentifier?: string;
  nextNode?: PipelineGraphState;
  prevNode?: PipelineGraphState;
  updateGraphLinks?: () => void;
  getDefaultNode(): NodeDetails | null;
  collapseOnIntersect?: boolean;
  intersectingIndex?: number;
  readonly?: boolean;
  parentSelector?: string;
}

const PipelineGraphNodeWithoutCollapse = React.forwardRef(
  (
    {
      fireEvent,
      getNode,
      data,
      className,
      isLastChild,
      selectedNode,
      isParallelNode,
      prevNodeIdentifier,
      isNextNodeParallel,
      isPrevNodeParallel,
      parentIdentifier,
      prevNode,
      nextNode,
      updateGraphLinks,
      collapseOnIntersect,
      getDefaultNode,
      intersectingIndex = -1,
      readonly
    }: PipelineGraphNodeWithoutCollapseProps,
    ref: ForwardedRef<HTMLDivElement>
  ): React.ReactElement | null => {
    const defaultNode = getDefaultNode()?.component;
    const NodeComponent: React.FC<BaseReactComponentProps> = defaultTo(
      getNode?.(data?.type)?.component,
      defaultNode
    ) as React.FC<BaseReactComponentProps>;

    const readOnlyValue = readonly || data.readonly;

    const refValue = React.useMemo((): React.ForwardedRef<HTMLDivElement> | null => {
      return intersectingIndex === 0 && data.children && collapseOnIntersect ? ref : null;
    }, [intersectingIndex, data.children, collapseOnIntersect, ref]);

    return (
      <div
        className={classNames(
          'pipeline-graph-node',
          { [css.nodeRightPadding]: isNextNodeParallel, [css.nodeLeftPadding]: isPrevNodeParallel },
          css.node
        )}
      >
        <>
          <div id={`ref_${data?.identifier}`} ref={refValue} key={data?.identifier} data-index={0}>
            {isFirstNodeAGroupNode(intersectingIndex, collapseOnIntersect, data?.children?.length) ? (
              <GroupNode
                key={data?.identifier}
                fireEvent={fireEvent}
                getNode={getNode}
                className={classNames(css.graphNode, className)}
                isSelected={selectedNode === data?.identifier}
                isParallelNode={true}
                allowAdd={true}
                prevNodeIdentifier={prevNodeIdentifier}
                intersectingIndex={intersectingIndex}
                readonly={readOnlyValue}
                updateGraphLinks={updateGraphLinks}
                selectedNodeId={selectedNode}
                {...data}
                id={data?.id}
              />
            ) : (
              <NodeComponent
                parentIdentifier={parentIdentifier}
                key={data?.identifier}
                getNode={getNode}
                fireEvent={fireEvent}
                getDefaultNode={getDefaultNode}
                className={classNames(css.graphNode, className)}
                isSelected={selectedNode === data?.identifier}
                isParallelNode={isParallelNode}
                allowAdd={(!data?.children?.length && !isParallelNode) || (isParallelNode && isLastChild)}
                isFirstParallelNode={true}
                prevNodeIdentifier={prevNodeIdentifier}
                prevNode={prevNode}
                nextNode={nextNode}
                updateGraphLinks={updateGraphLinks}
                readonly={readOnlyValue}
                selectedNodeId={selectedNode}
                {...data}
              />
            )}
          </div>
          {/* render child nodes */}
          {data?.children?.map((currentNodeData, index) => {
            const ChildNodeComponent: React.FC<BaseReactComponentProps> = defaultTo(
              getNode?.(currentNodeData?.type)?.component,
              defaultNode
            ) as React.FC<BaseReactComponentProps>;
            const lastChildIndex = defaultTo(data.children?.length, 0) - 1;
            const indexRelativeToParent = index + 1; // counting parent as 0 and children from 1
            const isCurrentChildLast = index === lastChildIndex;
            const attachRef = shouldAttachRef(intersectingIndex, isCurrentChildLast, indexRelativeToParent);
            return !collapseOnIntersect ? (
              <ChildNodeComponent
                parentIdentifier={parentIdentifier}
                {...currentNodeData}
                getNode={getNode}
                fireEvent={fireEvent}
                getDefaultNode={getDefaultNode}
                className={classNames(css.graphNode, className)}
                isSelected={selectedNode === currentNodeData?.identifier}
                isParallelNode={true}
                key={currentNodeData?.identifier}
                allowAdd={indexRelativeToParent === data?.children?.length}
                isFirstParallelNode={true}
                prevNodeIdentifier={prevNodeIdentifier}
                prevNode={prevNode}
                nextNode={nextNode}
                readonly={readOnlyValue}
                updateGraphLinks={updateGraphLinks}
                selectedNodeId={selectedNode}
              />
            ) : (
              <div
                ref={attachRef ? ref : null}
                data-index={indexRelativeToParent}
                id={`ref_${currentNodeData?.identifier}`}
                key={currentNodeData?.identifier}
              >
                {shouldRenderGroupNode(attachRef, isCurrentChildLast) ? (
                  <GroupNode
                    {...data}
                    id={currentNodeData.id}
                    fireEvent={fireEvent}
                    getNode={getNode}
                    className={classNames(css.graphNode, className)}
                    isSelected={selectedNode === currentNodeData?.identifier}
                    isParallelNode={true}
                    key={currentNodeData?.identifier}
                    allowAdd={true}
                    prevNodeIdentifier={prevNodeIdentifier}
                    identifier={currentNodeData.identifier}
                    intersectingIndex={intersectingIndex}
                    readonly={readOnlyValue}
                    selectedNodeId={selectedNode}
                    updateGraphLinks={updateGraphLinks}
                  />
                ) : showChildNode(indexRelativeToParent, intersectingIndex) ? (
                  <ChildNodeComponent
                    parentIdentifier={parentIdentifier}
                    {...currentNodeData}
                    getNode={getNode}
                    fireEvent={fireEvent}
                    getDefaultNode={getDefaultNode}
                    className={classNames(css.graphNode, className)}
                    isSelected={selectedNode === currentNodeData?.identifier}
                    isParallelNode={true}
                    key={currentNodeData?.identifier}
                    allowAdd={index + 1 === data?.children?.length}
                    prevNodeIdentifier={prevNodeIdentifier}
                    prevNode={prevNode}
                    nextNode={nextNode}
                    readonly={readOnlyValue}
                    updateGraphLinks={updateGraphLinks}
                    selectedNodeId={selectedNode}
                  />
                ) : null}
              </div>
            );
          })}
        </>
      </div>
    );
  }
);
PipelineGraphNodeWithoutCollapse.displayName = 'PipelineGraphNodeWithoutCollapse';

function PipelineGraphNodeWithCollapse(
  props: PipelineGraphNodeWithoutCollapseProps & {
    collapsibleProps?: NodeCollapsibleProps;
    parentSelector?: string;
  }
): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const resizeState = useNodeResizeObserver(ref?.current, props.collapsibleProps, props.parentSelector);
  const [intersectingIndex, setIntersectingIndex] = useState<number>(-1);

  useLayoutEffect(() => {
    const element = defaultTo(ref?.current, ref) as HTMLElement;
    if (resizeState.shouldCollapse) {
      const indexToGroupFrom = Number(defaultTo(element?.dataset.index, -1));
      Number.isInteger(indexToGroupFrom) && indexToGroupFrom > 0 && setIntersectingIndex(indexToGroupFrom - 1);
    }

    if (resizeState.shouldExpand) {
      if (intersectingIndex < (props.data?.children?.length as number)) {
        const indexToGroupFrom = Number(defaultTo(element?.dataset.index, -1));
        Number.isInteger(indexToGroupFrom) &&
          indexToGroupFrom < (props.data.children as unknown as [])?.length &&
          setIntersectingIndex(indexToGroupFrom + 1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizeState]);

  useLayoutEffect(() => {
    props.updateGraphLinks?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intersectingIndex]);

  return (
    <PipelineGraphNodeWithoutCollapse
      {...props}
      ref={ref}
      intersectingIndex={intersectingIndex}
      collapseOnIntersect={true}
    />
  );
}
interface PipelineGraphNodeBasicProps extends PipelineGraphNodeWithoutCollapseProps {
  collapsibleProps?: NodeCollapsibleProps;
}
function PipelineGraphNodeBasic(props: PipelineGraphNodeBasicProps): React.ReactElement {
  return props?.collapsibleProps ? (
    <PipelineGraphNodeWithCollapse {...props} />
  ) : (
    <PipelineGraphNodeWithoutCollapse {...props} />
  );
}
const PipelineGraphNode = React.memo(PipelineGraphNodeBasic);

function PipelineGraphNodeObserved(
  props: PipelineGraphNodeBasicProps & { index: number; isDragging?: boolean }
): React.ReactElement {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateVisibleState = React.useCallback(throttle(setVisible, 200), []);
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);
  React.useEffect(() => {
    let observer: IntersectionObserver;
    if (ref && props?.parentSelector && IS_RENDER_OPTIMIZATION_ENABLED) {
      const rootElement = document.querySelector(props?.parentSelector as string);

      observer = new IntersectionObserver(
        (entries, _observer) => {
          entries.forEach((entry: IntersectionObserverEntry) => {
            const computedEntryEl = getRelativeBounds(rootElement as HTMLDivElement, document.body);
            const computedEntryRoot = getRelativeBounds(entry.target as HTMLElement, document.body);
            if (computedEntryEl.right > computedEntryRoot.right || computedEntryEl.left < computedEntryRoot.left) {
              if (entry.isIntersecting) {
                updateVisibleState(true);
              } else {
                !props.isDragging && updateVisibleState(false);
              }
            } else {
              updateVisibleState(true);
            }
          });
        },
        { threshold: 0.5, root: rootElement }
      );
      observer.observe(ref as HTMLDivElement);
    }
    return () => {
      if (observer && ref && IS_RENDER_OPTIMIZATION_ENABLED) observer.unobserve(ref as HTMLDivElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, elementRect]);

  React.useEffect(() => {
    if (!elementRect && ref !== null) {
      const elementDOMRect = ref?.getBoundingClientRect() as DOMRect;
      setElementRect(elementDOMRect);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  return (
    <div data-graph-node={props.index} ref={setRef}>
      {IS_RENDER_OPTIMIZATION_ENABLED && <div style={{ width: elementRect?.width, visibility: 'hidden' }} />}
      {visible ? <PipelineGraphNode {...props} /> : null}
    </div>
  );
}
export { PipelineGraphNode };
