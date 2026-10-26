import React, { useState } from 'react';
import cx from 'classnames';
import { useLocation, matchPath } from 'react-router-dom';
import { Layout, Text } from '@harnessio/uicore';
import type { IconName } from '@harnessio/icons';
import css from './NavExpandable.module.scss';

interface NavExpandableProps {
  title: string;
  route: string;
  className?: string;
  withoutBorder?: boolean;
  defaultExpanded?: boolean;
}

const NavExpandable: React.FC<React.PropsWithChildren<NavExpandableProps>> = ({
  title,
  route,
  children,
  className,
  withoutBorder = false,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const { pathname } = useLocation();
  const isSelected = matchPath(pathname, route);
  const timerRef = React.useRef<number | null>(null);

  const handleMouseEvent = (val: boolean): void => {
    if (defaultExpanded) {
      return;
    }
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setIsExpanded(val);
    }, 300);
  };

  let rightIcon: IconName | undefined;
  if (!defaultExpanded) {
    rightIcon = isSelected || isExpanded ? 'chevron-up' : 'chevron-down';
  }

  return (
    <div>
      {!withoutBorder && <div className={css.border} />}
      <Layout.Vertical
        className={cx(className, css.main)}
        onMouseEnter={() => handleMouseEvent(true)}
        onMouseLeave={() => handleMouseEvent(false)}
      >
        <Text
          rightIcon={rightIcon}
          className={css.text}
          font="xsmall"
          flex={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
        >
          {title}
        </Text>
        {isSelected || isExpanded ? children : null}
      </Layout.Vertical>
    </div>
  );
};

export default NavExpandable;
