import React from 'react';
import { Drawer as BlueprintJSDrawer, Position } from '@blueprintjs/core';
import classNames from 'classnames';
import { Button, Container, Layout } from '@harnessio/uicore';
import css from './Drawer.module.scss';

export enum DrawerTypes {
  ChaosHub = 'ChaosHub',
  TuneFault = 'TuneFault',
  AdvacedOptions = 'AdvacedOptions',
  AddProbe = 'AddProbe',
  ViewManifest = 'ViewManifest',
  SelectMode = 'SelectMode'
}

export const DrawerSizes: Record<DrawerTypes, React.CSSProperties['width']> = {
  [DrawerTypes.ChaosHub]: 1200,
  [DrawerTypes.TuneFault]: 760,
  [DrawerTypes.AddProbe]: 760,
  [DrawerTypes.SelectMode]: 760,
  [DrawerTypes.AdvacedOptions]: 580,
  [DrawerTypes.ViewManifest]: 580
};

export const DrawerSizesWithHelpPanel: Record<DrawerTypes, React.CSSProperties['width']> = {
  [DrawerTypes.ChaosHub]: 1200 + 400,
  [DrawerTypes.TuneFault]: 760 + 400,
  [DrawerTypes.AddProbe]: 760 + 400,
  [DrawerTypes.SelectMode]: 760 + 400,
  [DrawerTypes.AdvacedOptions]: 580 + 400,
  [DrawerTypes.ViewManifest]: 580 + 400
};

export interface DrawerProps {
  isOpen?: boolean;
  handleClose: () => void;
  type: DrawerTypes;
  title: React.ReactNode;
  headerOptions?: React.ReactNode;
  leftPanel: React.ReactNode;
  rightPanel?: React.ReactNode;
  isCloseButtonShown?: boolean;
  helpPanel?: React.ReactNode;
}

export default function Drawer({
  handleClose,
  isOpen,
  type,
  title,
  headerOptions,
  leftPanel,
  rightPanel,
  isCloseButtonShown = false,
  helpPanel
}: DrawerProps): React.ReactElement {
  return (
    <div className={css.wrapper}>
      <BlueprintJSDrawer
        data-testid="drawer"
        onClose={handleClose}
        usePortal
        autoFocus
        canEscapeKeyClose
        canOutsideClickClose
        enforceFocus={false}
        hasBackdrop
        size={helpPanel ? DrawerSizesWithHelpPanel[type] : DrawerSizes[type]}
        isOpen={isOpen}
        position={Position.RIGHT}
        data-type={type}
        className={classNames(css.main, css.almostFullScreen, css.fullScreen)}
        isCloseButtonShown={isCloseButtonShown}
      >
        <Button
          minimal
          className={css.closeBtn}
          icon="cross"
          withoutBoxShadow
          onClick={() => {
            handleClose();
          }}
        />
        {helpPanel ? (
          <div className={css.root}>
            <Container className={classNames(css.leftPanel, css.dividehelpPanel)}>
              <Layout.Vertical height={'100%'}>
                {headerOptions ? (
                  <Layout.Horizontal className={css.title} flex>
                    <div data-testid="title" className={css.title}>
                      {title}
                    </div>
                    <div>{headerOptions}</div>
                  </Layout.Horizontal>
                ) : (
                  <div data-testid="title" className={css.title}>
                    {title}
                  </div>
                )}
                {leftPanel}
              </Layout.Vertical>
            </Container>
            <Container className={css.helpPanel}>{helpPanel}</Container>
          </div>
        ) : rightPanel ? (
          <Layout.Vertical height={'100%'}>
            {headerOptions ? (
              <Layout.Horizontal className={css.title} flex>
                <div data-testid="title" className={css.title}>
                  {title}
                </div>
                <div>{headerOptions}</div>
              </Layout.Horizontal>
            ) : (
              <div data-testid="title" className={css.title}>
                {title}
              </div>
            )}
            <div className={css.root}>
              <Container className={classNames(css.leftPanel, css.divide)}>{leftPanel}</Container>
              <Container className={css.rightPanel}>{rightPanel}</Container>
            </div>
          </Layout.Vertical>
        ) : (
          <Container className={classNames(css.leftPanel, css.fullWidth)}>
            <Layout.Vertical height={'100%'}>
              {headerOptions ? (
                <Layout.Horizontal className={css.title} flex>
                  <div>{title}</div>
                  <div>{headerOptions}</div>
                </Layout.Horizontal>
              ) : (
                <div data-testid="title" className={css.title}>
                  {title}
                </div>
              )}
              {leftPanel}
            </Layout.Vertical>
          </Container>
        )}
      </BlueprintJSDrawer>
    </div>
  );
}
