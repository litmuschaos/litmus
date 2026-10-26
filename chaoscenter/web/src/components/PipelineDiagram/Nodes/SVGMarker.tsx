import React from 'react';
import cx from 'classnames';
import css from './Nodes.module.scss';
function SVGMarker({ className }: { className?: string }): React.ReactElement {
  return (
    <svg id="link-port" viewBox="0 0 10 10">
      <circle className={cx(css.marker, className)} r="2" cy="5" cx="5" />
    </svg>
  );
}
export default SVGMarker;
