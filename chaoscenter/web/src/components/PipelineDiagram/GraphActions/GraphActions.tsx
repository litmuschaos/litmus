import React from 'react';
import { ButtonVariation, ButtonGroup, Button, Layout } from '@harnessio/uicore';
import cx from 'classnames';
import { ZOOM_INC_DEC_LEVEL } from './constants';
import css from './GraphActions.module.scss';

interface GraphActionProps {
  setGraphScale: (data: number) => void;
  graphScale: number;
  handleScaleToFit: () => void;
  resetGraphState: () => void;
  graphActionsLayout?: 'horizontal' | 'vertical';
}
function GraphActions({
  setGraphScale,
  graphScale,
  handleScaleToFit,
  resetGraphState,
  graphActionsLayout
}: GraphActionProps): React.ReactElement {
  const renderButtons = (): React.ReactElement => (
    <>
      <ButtonGroup>
        <Button
          variation={ButtonVariation.TERTIARY}
          icon="canvas-position"
          tooltip="Zoom to Fit"
          onClick={handleScaleToFit}
        />
      </ButtonGroup>
      <ButtonGroup>
        <Button variation={ButtonVariation.TERTIARY} icon="canvas-selector" tooltip="Reset" onClick={resetGraphState} />
      </ButtonGroup>
      <span className={graphActionsLayout === 'vertical' ? css.verticalButtons : ''}>
        <ButtonGroup>
          <Button
            variation={ButtonVariation.TERTIARY}
            icon="zoom-in"
            tooltip="Zoom In"
            onClick={e => {
              e.stopPropagation();
              Number(graphScale.toFixed(1)) < 2 && setGraphScale(graphScale + ZOOM_INC_DEC_LEVEL);
            }}
          />
          <Button
            variation={ButtonVariation.TERTIARY}
            icon="zoom-out"
            tooltip="Zoom Out"
            onClick={e => {
              e.stopPropagation();
              Number(graphScale.toFixed(1)) > 0.3 && setGraphScale(graphScale - ZOOM_INC_DEC_LEVEL);
            }}
          />
        </ButtonGroup>
      </span>
    </>
  );

  return (
    <span className={cx(css.canvasButtons, 'graphActions')}>
      {graphActionsLayout === 'horizontal' ? (
        <Layout.Horizontal spacing="medium" id="button-group">
          {renderButtons()}
        </Layout.Horizontal>
      ) : (
        <Layout.Vertical spacing="medium" id="button-group">
          {renderButtons()}
        </Layout.Vertical>
      )}
    </span>
  );
}
export default GraphActions;
