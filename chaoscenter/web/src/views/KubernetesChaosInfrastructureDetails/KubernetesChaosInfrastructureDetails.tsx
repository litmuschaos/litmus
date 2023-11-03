import React from 'react';
import { CodeBlock, ConfirmationDialog, Container, Layout, Tabs, Text, useToggleOpen } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import { Color, FontVariation, Intent } from '@harnessio/design-system';
import type { MutationFunction } from '@apollo/client';
import type { DeleteKubernetesChaosInfraRequest, DeleteKubernetesChaosInfraResponse } from '@api/core';
import { InfraScope, KubernetesChaosInfrastructure } from '@api/entities';
import { getChaosInfrastructureStatus, PermissionGroup } from '@models';
import { useStrings } from '@strings';
import { getScope } from '@utils';
import { useRouteWithBaseUrl } from '@hooks';
import Loader from '@components/Loader';
import ChaosInfrastructureDetailsHeader from '@components/ChaosInfrastructureDetailsHeader';
import { ParentComponentErrorWrapper, GenericErrorHandler } from '@errors';
import StatusBadgeV2, { StatusBadgeEntity } from '@components/StatusBadgeV2';
import RbacButton from '@components/RbacButton';
import css from './KubernetesChaosInfrastructureDetails.module.scss';

interface KubernetesChaosInfrastructureDetailsViewProps {
  chaosInfrastructureID: string;
  chaosInfrastructureDetails: KubernetesChaosInfrastructure | undefined;
  deleteChaosInfrastructureMutation: MutationFunction<
    DeleteKubernetesChaosInfraResponse,
    DeleteKubernetesChaosInfraRequest
  >;
  environmentID: string;
  infraExists: boolean | undefined;
  loading: {
    listChaosInfrastructureDetails: boolean;
  };
}

interface LogsTroubleShootingProps {
  chaosInfrastructureDetails: KubernetesChaosInfrastructure | undefined;
}

function LogsTroubleShooting({ chaosInfrastructureDetails }: LogsTroubleShootingProps): React.ReactElement {
  const { getString } = useStrings();
  return (
    <Container style={{ background: `var(--primary-10)`, overflow: 'scroll', padding: '65px', height: '100%' }}>
      <Layout.Vertical spacing="xxxlarge">
        <Container style={{ background: `var(--primary-bg)`, padding: '20px 30px', borderRadius: '4px' }}>
          <Layout.Vertical spacing="medium">
            <Text font={{ variation: FontVariation.CARD_TITLE }}>{getString('suggestion1')}</Text>
            <hr className={css.horizontalRule} />
            <Text font={{ variation: FontVariation.FORM_SUB_SECTION }}>{getString('checkStatus')}</Text>
            <CodeBlock
              allowCopy
              format="pre"
              snippet={`watch kubectl get pods -n ${chaosInfrastructureDetails?.infraNamespace}`}
            />
            <Text font={{ variation: FontVariation.FORM_SUB_SECTION }}>{getString('checkLogs')}</Text>
            <CodeBlock
              allowCopy
              format="pre"
              snippet={`kubectl logs -f <pod-name> -n ${chaosInfrastructureDetails?.infraNamespace}`}
            />
            <Text font={{ variation: FontVariation.FORM_SUB_SECTION }}>{getString('noHealthyState')}</Text>
            <CodeBlock
              allowCopy
              format="pre"
              snippet={`kubectl describe pods <pod-name> -n ${chaosInfrastructureDetails?.infraNamespace}`}
            />
            <Text font={{ variation: FontVariation.BODY }}>{getString('issueSupport')}</Text>
          </Layout.Vertical>
        </Container>
      </Layout.Vertical>
    </Container>
  );
}

export default function KubernetesChaosInfrastructureDetailsView({
  chaosInfrastructureID,
  chaosInfrastructureDetails,
  deleteChaosInfrastructureMutation,
  environmentID,
  infraExists,
  loading
}: KubernetesChaosInfrastructureDetailsViewProps): React.ReactElement {
  const scope = getScope();
  const { getString } = useStrings();
  const paths = useRouteWithBaseUrl();
  const { isOpen, open: openDeleteDialog, close: closeConfirmationModal } = useToggleOpen();

  const breadcrumbs = [
    {
      label: getString('environments'),
      url: paths.toEnvironments()
    },
    {
      label: `${environmentID}`,
      url: paths.toChaosInfrastructures({ environmentID })
    }
  ];

  const confirmationDialogProps = {
    usePortal: true,
    contentText: getString('deleteChaosInfrastructure'),
    titleText: getString('confirmText'),
    cancelButtonText: getString('cancel'),
    confirmButtonText: getString('confirm'),
    intent: Intent.DANGER,
    onClose: (isConfirmed: boolean) => {
      if (isConfirmed && chaosInfrastructureDetails?.infraID) {
        deleteChaosInfrastructureMutation({
          variables: {
            projectID: scope.projectID,
            infraID: chaosInfrastructureDetails?.infraID
          }
        });
      }
      closeConfirmationModal();
    }
  };

  const confirmationDialog = <ConfirmationDialog isOpen={isOpen} {...confirmationDialogProps} />;

  const isNamespaceMode = chaosInfrastructureDetails?.infraScope === InfraScope.NAMESPACE;

  if (infraExists !== undefined && !infraExists) {
    return (
      <GenericErrorHandler
        errStatusCode={400}
        errorMessage={getString('genericResourceNotFoundError', {
          resource: getString('infrastructure'),
          resourceID: chaosInfrastructureDetails?.name ?? chaosInfrastructureID,
          projectID: scope.projectID
        })}
      />
    );
  }

  return (
    <React.Fragment>
      <ChaosInfrastructureDetailsHeader
        createdAt={chaosInfrastructureDetails?.createdAt}
        tags={chaosInfrastructureDetails?.tags}
        description={chaosInfrastructureDetails?.description}
        breadcrumbs={breadcrumbs}
        chaosInfrastructureID={chaosInfrastructureID}
        title={chaosInfrastructureDetails?.name}
      >
        <Loader loading={loading.listChaosInfrastructureDetails}>
          <Layout.Horizontal height={'100%'}>
            <Layout.Vertical style={{ width: '30%', padding: '27px' }} spacing="xxlarge" background={Color.WHITE}>
              <div>
                <Text style={{ marginBottom: '8px' }} font={{ variation: FontVariation.BODY2 }}>
                  {getString('connectionStatus')}
                </Text>
                <StatusBadgeV2
                  status={getChaosInfrastructureStatus(
                    chaosInfrastructureDetails?.isActive,
                    chaosInfrastructureDetails?.isInfraConfirmed,
                    chaosInfrastructureDetails?.updateStatus
                  )}
                  entity={StatusBadgeEntity.Infrastructure}
                />
              </div>
              <div>
                <Text font={{ variation: FontVariation.BODY2 }}>{getString('accessType')}</Text>
                <Container
                  style={{
                    margin: '8px 0px',
                    padding: '8px 16px',
                    maxWidth: '175px',
                    background: isNamespaceMode ? `var(--purple-50)` : `var(--primary-2)`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon
                      color={isNamespaceMode ? Color.PURPLE_500 : Color.GREY_600}
                      name={isNamespaceMode ? 'insight-view' : 'gitops-clusters'}
                    />
                    <Text className={css.scopeText} color={isNamespaceMode ? Color.PURPLE_500 : Color.TEAL_900}>
                      {isNamespaceMode ? getString('namespaceWide') : getString('clusterWide')}
                    </Text>
                  </div>
                </Container>
                {isNamespaceMode ? (
                  <Text>{getString('monitorNamespace')}</Text>
                ) : (
                  <Text>{getString('monitorCluster')}</Text>
                )}
              </div>
              <div>
                <Text font={{ variation: FontVariation.BODY2 }}>{getString('version')}</Text>
                <Text style={{ marginTop: '8px' }}>
                  {chaosInfrastructureDetails?.version === '' ? '--' : chaosInfrastructureDetails?.version}
                </Text>
              </div>
              <div>
                <Text font={{ variation: FontVariation.BODY2 }}>{getString('namespace')}</Text>
                <Text style={{ marginTop: '8px' }}>{chaosInfrastructureDetails?.infraNamespace}</Text>
              </div>
              <div>
                <Text font={{ variation: FontVariation.BODY2 }}>{getString('serviceAccount')}</Text>
                <Text style={{ marginTop: '8px' }}>{chaosInfrastructureDetails?.serviceAccount}</Text>
              </div>
              <hr className={css.horizontalRule} />
              <Layout.Horizontal>
                <ParentComponentErrorWrapper>
                  <RbacButton
                    noStyling
                    className={css.rbacDelete}
                    permission={PermissionGroup.EDITOR}
                    onClick={openDeleteDialog}
                  >
                    <Icon name="main-trash" color={Color.RED_700} size={32} />
                    <Layout.Vertical spacing={'xsmall'}>
                      <Text font={{ variation: FontVariation.CARD_TITLE, align: 'left' }} color={Color.RED_500}>
                        {getString('disableChaosInfrastructure')}
                      </Text>
                      <Text style={{ maxWidth: '300px' }} font={{ align: 'left' }}>
                        {isNamespaceMode
                          ? getString('disconnectDescriptionNamespaceMode')
                          : getString('disconnectDescriptionClusterMode')}
                      </Text>
                    </Layout.Vertical>
                  </RbacButton>
                </ParentComponentErrorWrapper>
              </Layout.Horizontal>
            </Layout.Vertical>
            <Layout.Vertical className={css.tabs}>
              <Tabs
                id={'logsTabs'}
                defaultSelectedTabId={'troubleshooting'}
                tabList={[
                  {
                    id: 'troubleshooting',
                    title: getString('troubleshooting'),
                    panel: <LogsTroubleShooting chaosInfrastructureDetails={chaosInfrastructureDetails} />
                  }
                ]}
              />
            </Layout.Vertical>
          </Layout.Horizontal>
        </Loader>
      </ChaosInfrastructureDetailsHeader>
      {confirmationDialog}
    </React.Fragment>
  );
}
