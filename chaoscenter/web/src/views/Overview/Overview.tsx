import type { IDialogProps } from '@blueprintjs/core';
import { Color, FontVariation } from '@harnessio/design-system';
import { Button, ButtonVariation, Layout, Text, useToggleOpen, Dialog } from '@harnessio/uicore';
import { Dialog as BluePrintDialog } from '@blueprintjs/core';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { isEmpty } from 'lodash-es';
import DefaultLayoutTemplate from '@components/DefaultLayout';
import { useDocumentTitle, useRouteWithBaseUrl } from '@hooks';
import Environment from '@images/Environment.svg';
import { useStrings } from '@strings';
import type { ChaosHubStatsData, ExperimentStatsData, InfraStatsData } from '@api/entities';
import { ParentComponentErrorWrapper } from '@errors';
import NewUserLanding from '@components/NewUserLanding';
import type { ExperimentDashboardTableProps, RefetchExperiments } from '@controllers/ExperimentDashboardV2';
import { MemoisedExperimentDashboardV2Table } from '@views/ExperimentDashboardV2/ExperimentDashboardV2Table';
import NewExperimentButton from '@components/NewExperimentButton';
import RbacButton from '@components/RbacButton';
import { PermissionGroup } from '@models';
import { getUserDetails } from '@utils';
import AccountPasswordChangeController from '@controllers/AccountPasswordChange';
import { User } from '@api/auth';
import TotalChaosHubsCard from './TotalChaosHubsCard';
import TotalExperimentCard from './TotalExperimentCard';
import TotalInfrastructureCard from './TotalInfrastructureCard';
import css from './Overview.module.scss';

interface OverviewViewProps {
  chaosHubStats: ChaosHubStatsData | undefined;
  infraStats: InfraStatsData | undefined;
  experimentStats: ExperimentStatsData | undefined;
  experimentDashboardTableData: ExperimentDashboardTableProps | undefined;
  loading: {
    chaosHubStats: boolean;
    infraStats: boolean;
    experimentStats: boolean;
    recentExperimentsTable: boolean;
    getUser: boolean;
  };
  currentUserData: User | undefined;
}

export default function OverviewView({
  loading,
  chaosHubStats,
  infraStats,
  experimentDashboardTableData,
  experimentStats,
  refetchExperiments,
  currentUserData
}: OverviewViewProps & RefetchExperiments): React.ReactElement {
  const { getString } = useStrings();
  const paths = useRouteWithBaseUrl();
  const history = useHistory();
  const {
    isOpen: isPasswordResetModalOpen,
    close: closePasswordResetModal,
    open: openPasswordResetModal
  } = useToggleOpen();

  const [isEnableChaosModalOpen, setIsEnableChaosModalOpen] = React.useState(false);
  const userDetails = getUserDetails();

  React.useEffect(() => {
    if (userDetails?.isInitialLogin) {
      openPasswordResetModal();
    }
    if (infraStats?.totalInfrastructures === 0 && !isPasswordResetModalOpen) setIsEnableChaosModalOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infraStats?.totalInfrastructures, userDetails?.isInitialLogin]);

  useDocumentTitle(getString('overview'));

  const modalProps: IDialogProps = {
    isOpen: isEnableChaosModalOpen,
    style: {
      width: 600,
      minHeight: 300,
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'hidden',
      display: 'grid'
    },
    enforceFocus: false,
    onClose: () => setIsEnableChaosModalOpen(false)
  };

  return (
    <DefaultLayoutTemplate
      title={getString('overview')}
      breadcrumbs={[]}
      noPadding
      loading={
        (loading.experimentStats && loading.infraStats && loading.chaosHubStats) || loading.recentExperimentsTable
      }
    >
      <Layout.Vertical
        padding={{ top: 'medium', right: 'xlarge', left: 'xlarge', bottom: 'medium' }}
        className={css.fullHeight}
        color={Color.PRIMARY_BG}
        spacing="xlarge"
      >
        <BluePrintDialog
          isOpen={isPasswordResetModalOpen}
          canOutsideClickClose={false}
          canEscapeKeyClose={false}
          onClose={closePasswordResetModal}
          style={{
            paddingBottom: 0
          }}
        >
          <AccountPasswordChangeController
            handleClose={closePasswordResetModal}
            username={currentUserData?.username}
            initialMode={true}
          />
        </BluePrintDialog>
        <Layout.Vertical spacing="medium">
          <Text font={{ variation: FontVariation.H5 }}>{getString('atAGlance')}</Text>
          <Layout.Horizontal spacing="medium">
            <TotalExperimentCard experimentStats={experimentStats} loading={loading.experimentStats} />
            <TotalInfrastructureCard infraStats={infraStats} loading={loading.infraStats} />
            <TotalChaosHubsCard chaosHubStats={chaosHubStats} loading={loading.chaosHubStats} />
          </Layout.Horizontal>
        </Layout.Vertical>
        <Layout.Vertical spacing="large" className={css.flexGrow}>
          <Layout.Horizontal spacing="medium" flex>
            <Text font={{ variation: FontVariation.H5 }}>{getString('recentExperimentRuns')}</Text>
            <Layout.Horizontal flex={{ alignItems: 'center' }} spacing="medium">
              <NewExperimentButton />
              <ParentComponentErrorWrapper>
                <RbacButton
                  permission={PermissionGroup.VIEWER}
                  variation={ButtonVariation.SECONDARY}
                  text={getString('viewAllExperiments')}
                  onClick={() => history.push(paths.toExperiments())}
                />
              </ParentComponentErrorWrapper>
            </Layout.Horizontal>
          </Layout.Horizontal>
          {experimentDashboardTableData?.content && !isEmpty(experimentDashboardTableData?.content) ? (
            <MemoisedExperimentDashboardV2Table
              {...experimentDashboardTableData}
              refetchExperiments={refetchExperiments}
            />
          ) : (
            <NewUserLanding height={'100%'} />
          )}
        </Layout.Vertical>
      </Layout.Vertical>
      <Dialog {...modalProps}>
        <Layout.Horizontal className={css.environmentModal} flex>
          <div className={css.leftView}>
            <Text className={css.headingText} margin={{ bottom: 'medium' }} color={Color.GREY_700}>
              {getString('enableChaosInfrastructure')}
            </Text>
            <Text font={{ size: 'normal' }} margin={{ bottom: 'medium' }} color={Color.GREY_800}>
              {getString('enableChaosInfrastructureDesc')}
            </Text>
            <Button
              className={css.btn}
              variation={ButtonVariation.PRIMARY}
              text={getString('enableChaosInfraButton')}
              onClick={() => {
                history.push(paths.toEnvironments());
              }}
            />
          </div>
          <div className={css.rightView}>
            <img src={Environment} alt="chaos infrastructure" />
          </div>
        </Layout.Horizontal>
      </Dialog>
    </DefaultLayoutTemplate>
  );
}
