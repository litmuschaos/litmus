import type { MutationFunction } from '@apollo/client';
import { Classes, Menu, MenuDivider } from '@blueprintjs/core';
import { Color, FontVariation, Intent } from '@harnessio/design-system';
import { CardBody, ConfirmationDialog, Container, Layout, Text, useToaster, useToggleOpen } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import pendingTime from '@images/pendingTime.svg';
import {
  DeleteKubernetesChaosInfraRequest,
  DeleteKubernetesChaosInfraResponse,
  getKubernetesChaosInfrastructureManifest
} from '@api/core';
import { InfraScope, KubernetesChaosInfrastructure, InfrastructureUpdateStatus } from '@api/entities';
import CopyButton from '@components/CopyButton';
import StatusBadgeV2, { StatusBadgeEntity } from '@components/StatusBadgeV2';
import { useRouteWithBaseUrl } from '@hooks';
import {
  ChaosInfrastructureStatus,
  getChaosInfrastructureStatus,
  kubernetesChaosInfrastructureCRDsEndpoint,
  PermissionGroup
} from '@models';
import { useStrings } from '@strings';
import { downloadYamlAsFile, getDetailedTime, getScope } from '@utils';
import CodeBlock from '@components/CodeBlock';
import KubernetesChaosInfrastructureUpgradeController from '@controllers/KubernetesChaosInfrastructureUpgrade';
import RbacMenuItem from '@components/RbacMenuItem';
import css from './KubernetesChaosInfrastructureTable.module.scss';
export interface KubernetesChaosInfrastructureTableViewProps {
  data?: Array<KubernetesChaosInfrastructure> | undefined;
  deleteChaosInfrastructureMutation: MutationFunction<
    DeleteKubernetesChaosInfraResponse,
    DeleteKubernetesChaosInfraRequest
  >;
}

interface RenderChaosInfrastructureOptionsProps {
  chaosInfrastructureName: string;
  chaosInfrastructureID: string;
  status: string;
  deleteChaosInfrastructureMutation: MutationFunction<
    DeleteKubernetesChaosInfraResponse,
    DeleteKubernetesChaosInfraRequest
  >;
  chaosInfrastructureScope: InfraScope;
  chaosInfrastructureNamespace: string | undefined;
}

export function RenderChaosInfrastructureOptions({
  chaosInfrastructureName,
  chaosInfrastructureID,
  chaosInfrastructureScope,
  chaosInfrastructureNamespace,
  deleteChaosInfrastructureMutation
}: RenderChaosInfrastructureOptionsProps): React.ReactElement {
  const { getString } = useStrings();
  const { showError, showSuccess } = useToaster();
  const scope = getScope();
  const { isOpen, open: openDeleteDialog, close: closeConfirmationModal } = useToggleOpen();

  const confirmationDialogProps = {
    usePortal: true,
    contentText: (
      <Layout.Vertical spacing="small">
        <Text>{getString('deleteChaosInfrastructure')}</Text>
        <Layout.Horizontal spacing="small" className={css.kubernetesInfrastructureDeleteNoteSection}>
          <Icon name="main-info" size={12} className={css.mainInfo} />
          <Text font={{ variation: FontVariation.BODY2, weight: 'light' }} color={Color.GREY_1000}>
            {getString('kubernetesInfrastructureDeleteNote')}
          </Text>
        </Layout.Horizontal>
        <Text font={{ variation: FontVariation.BODY2, weight: 'light' }} color={Color.GREY_1000}>
          {getString('kubernetesChaosInfrastructureDeleteStepOne')}
        </Text>
        <Container>
          <CodeBlock
            text={`kubectl delete chaosexperiment chaosengine chaosresult --all -n ${chaosInfrastructureNamespace}`}
            isCopyButtonEnabled
          />
        </Container>
        {chaosInfrastructureScope === InfraScope.NAMESPACE && (
          <Layout.Vertical spacing="small">
            <Layout.Horizontal spacing="small" className={css.kubernetesInfrastructureCrDsNoteSection}>
              <Icon name="main-info" size={12} className={css.mainInfo} />
              <Text font={{ variation: FontVariation.BODY2, weight: 'light' }} color={Color.GREY_1000}>
                {getString('kubernetesInfrastructureDeleteCRDSNote')}
              </Text>
            </Layout.Horizontal>
            <Text font={{ variation: FontVariation.BODY2, weight: 'light' }} color={Color.GREY_1000}>
              {getString('kubernetesChaosInfrastructureNamespaceScopeDeleteStepTwo')}
            </Text>
            <Container>
              <CodeBlock text={`kubectl delete -f ${kubernetesChaosInfrastructureCRDsEndpoint}`} isCopyButtonEnabled />
            </Container>
          </Layout.Vertical>
        )}
        <Text font={{ variation: FontVariation.BODY2, weight: 'light' }} color={Color.GREY_1000}>
          {chaosInfrastructureScope === InfraScope.NAMESPACE
            ? getString('kubernetesChaosInfrastructureNamespaceScopeDeleteStepThree')
            : getString('kubernetesChaosInfrastructureClusterScopeDeleteStepTwo')}
        </Text>
        <Container>
          <CodeBlock
            text={`kubectl delete -f ${chaosInfrastructureName}-litmus-chaos-enable.yml`}
            isCopyButtonEnabled
          />
        </Container>
        {chaosInfrastructureScope === InfraScope.NAMESPACE && (
          <Layout.Vertical spacing="small">
            <Text font={{ variation: FontVariation.BODY2, weight: 'light' }} color={Color.GREY_1000}>
              {getString('kubernetesChaosInfrastructureNamespaceScopeDeleteStepFour')}
            </Text>
            <Container>
              <CodeBlock text={`kubectl delete ns ${chaosInfrastructureNamespace}`} isCopyButtonEnabled />
            </Container>
          </Layout.Vertical>
        )}
      </Layout.Vertical>
    ),
    titleText: getString('confirmText'),
    cancelButtonText: getString('cancel'),
    confirmButtonText: getString('confirm'),
    intent: Intent.DANGER,
    onClose: (isConfirmed: boolean) => {
      if (isConfirmed) {
        deleteChaosInfrastructureMutation({
          variables: {
            projectID: scope.projectID,
            infraID: chaosInfrastructureID
          }
        });
      }
      closeConfirmationModal();
    }
  };

  const confirmationDialog = <ConfirmationDialog isOpen={isOpen} {...confirmationDialogProps} />;

  const [getChaosInfrastructureManifestQuery] = getKubernetesChaosInfrastructureManifest({
    ...scope,
    infraID: chaosInfrastructureID,
    upgrade: true,
    options: {
      onCompleted: data => {
        if (data) {
          showSuccess(getString('downloadSuccess'));
          downloadYamlAsFile(data.getInfraManifest, `${chaosInfrastructureName}-litmus-chaos-enable.yml`);
        }
      },
      onError: err => {
        showError(err.message);
      }
    }
  });

  return (
    <React.Fragment>
      <CardBody.Menu
        menuPopoverProps={{
          className: Classes.DARK
        }}
        style={{ marginBottom: '13px', marginTop: '15px' }}
        menuContent={
          <Menu>
            <RbacMenuItem
              icon="download"
              className={css.menuItem}
              text={getString('downloadChaosInfrastructureManifest')}
              onClick={() => {
                getChaosInfrastructureManifestQuery({
                  variables: {
                    projectID: scope.projectID,
                    infraID: chaosInfrastructureID,
                    upgrade: true
                  }
                });
              }}
              permission={PermissionGroup.EDITOR}
            />
            <MenuDivider />
            <RbacMenuItem
              icon="delete"
              text={getString('disable')}
              className={css.menuItem}
              onClick={openDeleteDialog}
              permission={PermissionGroup.EDITOR}
            />
          </Menu>
        }
      />
      {confirmationDialog}
    </React.Fragment>
  );
}

function PendingToolTip(): React.ReactElement {
  const { getString } = useStrings();
  return (
    <Layout.Horizontal spacing="medium" style={{ padding: '24px 15px' }} flex={{ alignItems: 'center' }}>
      <Layout.Vertical spacing="small" style={{ maxWidth: '232px' }}>
        <Text color={Color.WHITE}>{getString('pendingTime')}</Text>
      </Layout.Vertical>
      <img src={pendingTime} alt="pendingState" />
    </Layout.Horizontal>
  );
}

export default function KubernetesChaosInfrastructureTableView({
  data,
  deleteChaosInfrastructureMutation
}: KubernetesChaosInfrastructureTableViewProps): React.ReactElement {
  const { environmentID } = useParams<{ environmentID: string }>();
  const { getString } = useStrings();
  const paths = useRouteWithBaseUrl();

  return data ? (
    <div className={css.parentContainer}>
      <Text style={{ marginBottom: '12px' }} font={{ variation: FontVariation.CARD_TITLE }} color={Color.GREY_700}>
        {getString('allChaosEnabled')}
      </Text>
      {data.map(item => {
        const chaosInfrastructureStatus = getChaosInfrastructureStatus(
          item.isActive,
          item.isInfraConfirmed,
          item.updateStatus
        );
        return (
          <Container className={css.cardContainer} key={item.infraID}>
            <Layout.Vertical>
              <Layout.Horizontal flex={{ justifyContent: 'space-between' }} className={css.upperSection}>
                <Layout.Vertical style={{ minWidth: 215 }}>
                  <Layout.Horizontal style={{ alignItems: 'center', marginBottom: '8px' }} spacing="small">
                    <Link
                      to={paths.toKubernetesChaosInfrastructureDetails({
                        environmentID: environmentID,
                        chaosInfrastructureID: item.infraID
                      })}
                    >
                      <Text
                        style={{ minWidth: 50 }}
                        lineClamp={1}
                        className={css.maxWidth}
                        font={{ variation: FontVariation.CARD_TITLE }}
                        color={Color.PRIMARY_7}
                      >
                        {item.name}
                      </Text>
                    </Link>
                    <StatusBadgeV2
                      status={chaosInfrastructureStatus}
                      entity={StatusBadgeEntity.Infrastructure}
                      tooltip={
                        chaosInfrastructureStatus === ChaosInfrastructureStatus.PENDING ? (
                          <PendingToolTip />
                        ) : chaosInfrastructureStatus === ChaosInfrastructureStatus.INACTIVE ? (
                          getString('inactiveTooltip')
                        ) : undefined
                      }
                    />
                  </Layout.Horizontal>
                  <Layout.Horizontal className={css.idInfoSection}>
                    <Text>{getString('idlowerCase')}: </Text>
                    <Text
                      className={css.chaosInfrastructureIdBlock}
                      lineClamp={1}
                      font={{ variation: FontVariation.SMALL, weight: 'light' }}
                    >
                      {item.infraID}
                    </Text>
                    <CopyButton stringToCopy={item.infraID ?? ''} />
                  </Layout.Horizontal>
                </Layout.Vertical>
                <Layout.Vertical>
                  <Text
                    font={{ variation: FontVariation.SMALL }}
                    color={Color.GREY_500}
                    style={{ marginBottom: '12px' }}
                  >
                    {getString('accessType')}
                  </Text>
                  <Text
                    lineClamp={1}
                    className={css.maxWidth}
                    font={{ variation: FontVariation.TINY_SEMI, weight: 'bold' }}
                    color={item.infraScope === InfraScope.NAMESPACE ? Color.PURPLE_600 : Color.GREY_500}
                    style={{ letterSpacing: '2px' }}
                  >
                    {item.infraScope.toUpperCase()}
                  </Text>
                </Layout.Vertical>
                <Layout.Vertical spacing="small">
                  <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_500}>
                    {getString('namespace')}
                  </Text>
                  <Text
                    lineClamp={1}
                    className={css.maxWidth}
                    font={{ variation: FontVariation.BODY2 }}
                    color={Color.GREY_700}
                  >
                    {item.infraNamespace}
                  </Text>
                </Layout.Vertical>
                <Layout.Vertical spacing="small">
                  <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_500}>
                    {getString('serviceAccount')}
                  </Text>
                  <Text
                    lineClamp={1}
                    className={css.maxWidth}
                    font={{ variation: FontVariation.BODY2 }}
                    color={Color.GREY_700}
                  >
                    {item.serviceAccount}
                  </Text>
                </Layout.Vertical>
                <RenderChaosInfrastructureOptions
                  chaosInfrastructureName={item.name}
                  chaosInfrastructureID={item.infraID}
                  chaosInfrastructureScope={item.infraScope}
                  chaosInfrastructureNamespace={item.infraNamespace}
                  status={chaosInfrastructureStatus}
                  deleteChaosInfrastructureMutation={deleteChaosInfrastructureMutation}
                />
              </Layout.Horizontal>
              <Layout.Horizontal
                flex={{ alignItems: 'center', justifyContent: 'space-between' }}
                className={css.lowerSection}
              >
                <Layout.Horizontal spacing="small" flex={{ alignItems: 'center' }}>
                  <Icon name="calendar" size={12} />
                  <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
                    {getString('createdOn')}
                  </Text>
                  <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_900}>
                    {item.createdAt && getDetailedTime(parseInt(item.createdAt))}
                  </Text>
                </Layout.Horizontal>
                <Layout.Horizontal spacing="small" flex={{ alignItems: 'center' }}>
                  <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
                    {getString('version')}
                  </Text>
                  <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_900}>
                    {item.version ? item.version : '--'}
                  </Text>
                  {item.updateStatus !== InfrastructureUpdateStatus.NOT_REQUIRED && (
                    <KubernetesChaosInfrastructureUpgradeController kubernetesChaosInfrastructureItem={item} />
                  )}
                </Layout.Horizontal>
              </Layout.Horizontal>
            </Layout.Vertical>
          </Container>
        );
      })}
    </div>
  ) : (
    <></>
  );
}
