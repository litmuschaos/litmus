import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Layout, Heading, Text, Container } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import { useRouteWithBaseUrl } from '@hooks';
import { useStrings } from '@strings';

interface ErrorType {
  errorMessage?: string;
  errStatusCode?: number | string;
  allowUserToGoBack?: boolean;
}

export function GenericErrorHandler({ errorMessage, errStatusCode, allowUserToGoBack }: ErrorType): JSX.Element {
  const history = useHistory();
  const paths = useRouteWithBaseUrl();
  const { getString } = useStrings();
  return (
    <Container height="var(--page-min-height)" flex={{ align: 'center-center' }}>
      <Layout.Vertical spacing="large" flex={{ align: 'center-center' }}>
        <Heading>{errStatusCode || 404}</Heading>
        <Text>{errorMessage || getString('404Error')}</Text>
        {allowUserToGoBack ? (
          <Text onClick={() => history.goBack()}>
            <a>{getString('goBack')}</a>
          </Text>
        ) : (
          <Link to={paths.toRoot()}>{getString('goChaosHome')}</Link>
        )}
        <Icon name="chaos-litmuschaos" size={200} />
      </Layout.Vertical>
    </Container>
  );
}
