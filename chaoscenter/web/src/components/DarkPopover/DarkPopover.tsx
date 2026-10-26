import { Popover } from '@harnessio/uicore';
import type { PopoverProps } from '@harnessio/uicore/dist/components/Popover/Popover';
import React from 'react';
import cx from 'classnames';
import css from './DarkPopover.module.scss';

const DarkPopover = (props: PopoverProps): React.ReactElement => (
  <Popover popoverClassName={cx(css.darkPopover, props.popoverClassName)} {...props} />
);

export default DarkPopover;
