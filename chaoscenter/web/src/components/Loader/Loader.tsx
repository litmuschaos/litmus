import { Text, Layout, Container, NoDataCardProps, Page } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import React from 'react';
import cx from 'classnames';
import { Color } from '@harnessio/design-system';
import { useStrings } from '@strings';
import css from './Loader.module.scss';

export interface LoaderProps {
  message?: string;
  color?: string;
  height?: string | number;
  width?: string | number;
  className?: string;
  style?: React.CSSProperties;
  loading: boolean | undefined;
  small?: boolean;
  noData?: NoDataCardProps & { when: () => boolean };
  children: React.ReactNode;
  testId?: string;
}

export function Loader({
  height,
  width,
  color,
  loading,
  small,
  className,
  message,
  noData,
  children,
  testId,
  style
}: LoaderProps): React.ReactElement {
  const { getString } = useStrings();

  return loading ? (
    <Container
      data-testid={testId}
      style={{ ...style, position: 'relative', zIndex: 1 }}
      height={height || '100%'}
      width={width || '100%'}
    >
      <Container className={css.spinner} flex={{ align: 'center-center' }}>
        <Layout.Vertical
          spacing={small ? 'small' : 'medium'}
          style={{ alignItems: 'center' }}
          className={cx(className, css.content)}
        >
          <Icon name="steps-spinner" size={small ? 26 : 32} color={color ?? Color.GREY_600} />
          <Text font={{ size: small ? 'normal' : 'medium', align: 'center' }} color={color ?? Color.GREY_600}>
            {message || getString('loading')}
          </Text>
        </Layout.Vertical>
      </Container>
    </Container>
  ) : noData?.when?.() ? (
    <Container
      data-testid={testId}
      style={{ ...style, position: 'relative', zIndex: 1 }}
      height={height || '100%'}
      width={width || '100%'}
    >
      <Page.NoDataCard {...noData} containerClassName={css.noDataCardContainer} className={css.noDataCard} />
    </Container>
  ) : (
    <>{children}</>
  );
}
