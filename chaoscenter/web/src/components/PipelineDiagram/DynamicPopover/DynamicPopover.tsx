import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';
import cx from 'classnames';
import type * as PopperJS from '@popperjs/core';
import { useGlobalEventListener } from '../PipelineGraph/utils';
import css from './DynamicPopover.module.scss';

declare global {
  interface WindowEventMap {
    UPDATE_POPOVER_POSITION: CustomEvent<string>;
  }
}
export interface DynamicPopoverHandlerBinding<T> {
  show: (
    ref: Element | PopperJS.VirtualElement | string,
    data?: T,
    options?: { darkMode?: boolean; useArrows?: boolean; fixedPosition?: boolean; placement?: PopperJS.Placement },
    onHideCallBack?: () => void,
    isHoverView?: boolean
  ) => void;
  hide: () => void;
  isHoverView?: () => boolean;
}

export interface DynamicPopoverProps<T> {
  render: (data: T) => JSX.Element;
  className?: string;
  darkMode?: boolean;
  useArrows?: boolean;
  fixedPosition?: boolean;
  bind: (dynamicPopoverHandler: DynamicPopoverHandlerBinding<T>) => void;
  closeOnMouseOut?: boolean;
  hoverShowDelay?: number;
  hoverHideDelay?: number;
  usePortal?: boolean;
  parentElement?: HTMLElement | null;
  portalClassName?: string;
}

export function DynamicPopover<T>(props: DynamicPopoverProps<T>): JSX.Element {
  const {
    bind,
    render,
    className = '',
    darkMode = false,
    useArrows = true,
    fixedPosition = false,
    closeOnMouseOut,
    hoverShowDelay = 0,
    hoverHideDelay = 300,
    usePortal,
    parentElement = null,
    portalClassName = ''
  } = props;
  const [darkModeState, setDarkMode] = useState<boolean>(darkMode);
  const [useArrowsState, setArrowVisibility] = useState<boolean>(useArrows);
  const [fixedPositionState, setFixedPosition] = useState<boolean>(fixedPosition);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
  const [data, setData] = useState<T>();
  const [arrowElement, setArrowElement] = useState<HTMLElement | null>(null);
  const [referenceElement, setReferenceElement] = useState<Element | PopperJS.VirtualElement | null>(null);
  const [visible, setVisibility] = useState<boolean>(false);
  const [hideCallback, setHideCallBack] = useState<() => void | undefined>();
  const [placement, setPlacement] = useState<PopperJS.Placement>('auto');
  const showTimerRef = React.useRef<number | null>(null);
  const hideTimerRef = React.useRef<number | null>(null);
  const mouseInRef = React.useRef<boolean>(false);
  const [isHoverView, setIsHoverView] = React.useState<boolean>();

  const { styles, attributes, forceUpdate } = usePopper(referenceElement, popperElement, {
    modifiers: [
      { name: 'arrow', options: { element: arrowElement } },
      {
        name: 'offset',
        options: {
          offset: [0, 12]
        }
      }
    ],
    placement
  });

  useGlobalEventListener('UPDATE_POPOVER_POSITION', () => {
    forceUpdate?.();
  });

  const handler = useMemo(
    () =>
      ({
        show: (ref, dataTemp, options, callback, hoverView) => {
          if (hideTimerRef.current) {
            window.clearTimeout(hideTimerRef.current);
          }
          showTimerRef.current = window.setTimeout(() => {
            setVisibility(true);
            setData(dataTemp);
            setIsHoverView(hoverView);
            if (typeof ref === 'string') {
              setReferenceElement(document.querySelector(ref));
            } else {
              setReferenceElement(ref);
            }

            if (options) {
              typeof options.darkMode === 'boolean' && setDarkMode(options.darkMode);
              typeof options.useArrows === 'boolean' && setArrowVisibility(options.useArrows);
              typeof options.fixedPosition === 'boolean' && setFixedPosition(options.fixedPosition);
              options.placement ? setPlacement(options.placement) : setPlacement('auto');
            }
            setHideCallBack(prev => {
              prev?.();
              return callback;
            });
          }, hoverShowDelay);
        },
        hide: () => {
          if (showTimerRef.current) {
            window.clearTimeout(showTimerRef.current);
          }

          if (hideTimerRef.current) {
            window.clearTimeout(hideTimerRef.current);
          }

          if (!mouseInRef.current) {
            hideTimerRef.current = window.setTimeout(() => setVisibility(false), hoverHideDelay);
          }
        },
        isHoverView: () => isHoverView
      } as DynamicPopoverHandlerBinding<T>),
    [setVisibility, isHoverView, hoverHideDelay, hoverShowDelay]
  );

  React.useEffect(() => {
    if (!visible && hideCallback) {
      hideCallback();
      setHideCallBack(undefined);
    }
  }, [hideCallback, visible]);

  React.useEffect(() => {
    bind(handler);
  }, [bind, handler]);

  React.useEffect(() => {
    let portalDiv: HTMLElement | null = null;
    if (usePortal) {
      if (parentElement) {
        portalDiv = parentElement; // assuming here that consumer will apply the className, if required
      } else {
        portalDiv = document.createElement('div');
        portalDiv.className = portalClassName;
      }
      document.body.appendChild(portalDiv);
      setPortalEl(portalDiv);
    }
    return () => {
      portalDiv?.remove();
    };
  }, [usePortal, parentElement, portalClassName]);

  React.useEffect(() => {
    return () => {
      if (showTimerRef.current) {
        window.clearTimeout(showTimerRef.current);
      }

      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  const popperStyle = fixedPositionState ? { ...styles.popper, transform: 'initial' } : styles.popper;
  const renderPopover = (): React.ReactElement => (
    <>
      {visible && (
        <span
          ref={setPopperElement}
          className={cx(css.dynamicPopover, { [css.dark]: darkModeState }, className)}
          style={popperStyle}
          {...attributes.popper}
          onMouseEnter={() => {
            if (closeOnMouseOut) {
              mouseInRef.current = true;
              if (hideTimerRef.current) {
                window.clearTimeout(hideTimerRef.current);
              }
              setVisibility(true);
            }
          }}
          onMouseLeave={() => {
            if (closeOnMouseOut) {
              mouseInRef.current = false;
              handler.hide();
            }
          }}
        >
          {data && render(data)}
          {useArrowsState && (
            <div className={css.arrow} data-popper-arrow="true" ref={setArrowElement} style={styles.arrow} />
          )}
        </span>
      )}
    </>
  );
  return usePortal && portalEl ? createPortal(renderPopover(), portalEl) : renderPopover();
}
