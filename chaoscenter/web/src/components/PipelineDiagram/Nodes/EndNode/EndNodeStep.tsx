import React from 'react';
import { Icon, IconName } from '@harnessio/icons';
import cx from 'classnames';
import { NodeType } from '../../types';
import SVGMarker from '../SVGMarker';
import css from '../Nodes.module.scss';

const DEFAULT_ICON: IconName = 'stop';
const SELECTED_COLOUR = 'var(--diagram-stop-node)';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EndNodeStep(props: any): React.ReactElement {
  return (
    <div id={props?.id} className={cx({ [props.className]: props.className }, css.stepNode)}>
      <div
        id={NodeType.EndNode.toString()}
        className={cx(css.nodeStart)}
        style={{ backgroundColor: '#f3f3fa', border: '1px solid #b0b1c4' }}
      >
        <div>
          <Icon name={DEFAULT_ICON} style={{ color: SELECTED_COLOUR }} className={css.icon} />
        </div>
        <div className={css.markerEndNode}>
          <SVGMarker />
        </div>
      </div>
    </div>
  );
}

export default EndNodeStep;
