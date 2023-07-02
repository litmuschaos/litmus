import React from 'react';
import { Icon, IconName } from '@harness/icons';
import { Color } from '@harness/design-system';
import cx from 'classnames';
import SVGMarker from '../SVGMarker';
import css from '../Nodes.module.scss';

const DEFAULT_ICON: IconName = 'play';

function StartNodeStage(props: any): React.ReactElement {
  return (
    <div id={props?.id} className={cx({ [props.className]: props.className }, css.stageNode)}>
      <div className={cx(css.nodeStart)} style={{ backgroundColor: '#f3f3fa', border: '1px solid #b0b1c4' }}>
        <div className={css.markerStartNode}>
          <SVGMarker />
        </div>
        <div>
          <Icon name={DEFAULT_ICON} color={Color.GREEN_400} className={css.icon} />
        </div>
      </div>
    </div>
  );
}

export default StartNodeStage;
