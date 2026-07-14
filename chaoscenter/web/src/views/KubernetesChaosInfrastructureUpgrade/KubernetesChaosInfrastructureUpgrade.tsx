import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Container,
  FlexExpander,
  Layout,
  Text,
  useToaster
} from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { Dialog } from '@blueprintjs/core';
import { isEqual } from 'lodash-es';
import cx from 'classnames';
import { useStrings } from '@strings';
import type { LazyQueryFunction } from '@api/types';
import { generateUpgradeInfrastructureFileName, getScope } from '@utils';
import type {
  GetKubernetesChaosInfrastructureManifestRequest,
  GetKubernetesChaosManifestManifestResponse
} from '@api/core';
import CodeBlock from '@components/CodeBlock';
import css from './KubernetesChaosInfrastructureUpgrade.module.scss';

interface KubernetesChaosInfrastructureUpgradeViewProps {
  kubernetesChaosInfrastructureName: string;
  kubernetesChaosInfrastructureID: string;
  latestVersion: string;
  isUpgradeAvailable: boolean;
  getChaosInfrastructureManifestQuery: LazyQueryFunction<
    GetKubernetesChaosManifestManifestResponse,
    GetKubernetesChaosInfrastructureManifestRequest
  >;
}

interface UpgradeModalProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  latestVersion: string;
  kubernetesChaosInfrastructureName: string;
  kubernetesChaosInfrastructureID: string;
  getChaosInfrastructureManifestQuery: LazyQueryFunction<
    GetKubernetesChaosManifestManifestResponse,
    GetKubernetesChaosInfrastructureManifestRequest
  >;
}

export const MemoizedSelectChaosInfrastructureDeploymentMethod = React.memo(
  function UpgradeModal({
    setIsOpen,
    latestVersion,
    kubernetesChaosInfrastructureName,
    kubernetesChaosInfrastructureID,
    getChaosInfrastructureManifestQuery
  }: UpgradeModalProps): React.ReactElement {
    const { getString } = useStrings();
    const scope = getScope();
    const [isDownloaded, setIsDownloaded] = React.useState(false);
    const [isDownloadTextShown, setIsDownloadTextShown] = React.useState(false);
    const { showSuccess } = useToaster();
    React.useEffect(() => {
      if (isDownloaded) {
        const timer = setTimeout(() => {
          setIsDownloadTextShown(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }, [isDownloaded]);

    return (
      <Layout.Vertical className={cx(css.modalMainContainer, css.gap4)} padding={{ left: 'large', right: 'large' }}>
        <Container className={css.updateContainer} padding="medium">
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} className={css.gap4}>
            <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} className={css.gap}>
              <Text font={{ variation: FontVariation.BODY, weight: 'semi-bold' }} color={Color.BLACK}>
                {getString('newUpdates')}
              </Text>
            </Layout.Horizontal>
            <Text font={{ variation: FontVariation.BODY }} color={Color.BLACK}>
              {getString('chaosInfraVersionAvailable', { version: latestVersion })}
            </Text>
          </Layout.Horizontal>
        </Container>
        <Container padding="large" className={css.stepsContainer}>
          <Container padding={{ bottom: 'medium' }} border={{ bottom: true }}>
            <Text font={{ variation: FontVariation.BODY, weight: 'semi-bold' }}>{getString('downloadYAMLFile')}</Text>
            <Text font={{ variation: FontVariation.BODY }} margin={{ top: 'xsmall', bottom: 'small' }}>
              {getString('clickDownload')}
            </Text>
            <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} className={css.gap4}>
              <Button
                text={getString('download')}
                intent="primary"
                variation={ButtonVariation.PRIMARY}
                size={ButtonSize.SMALL}
                onClick={() => {
                  getChaosInfrastructureManifestQuery({
                    variables: {
                      projectID: scope.projectID,
                      infraID: kubernetesChaosInfrastructureID,
                      upgrade: true
                    }
                  });
                  setIsDownloaded(true);
                  setIsDownloadTextShown(true);
                }}
              />
              {isDownloadTextShown && (
                <Text
                  icon="tick"
                  iconProps={{ color: Color.GREEN_600, size: 10 }}
                  color={Color.GREEN_600}
                  font={{ variation: FontVariation.SMALL }}
                >
                  {getString('downloadedSuccessfully')}
                </Text>
              )}
            </Layout.Horizontal>
          </Container>
          <Container padding={{ top: 'medium' }}>
            <Text font={{ variation: FontVariation.BODY, weight: 'semi-bold' }}>{getString('runCommand')}</Text>
            <Text font={{ variation: FontVariation.BODY }} margin={{ top: 'xsmall', bottom: 'small' }}>
              {getString('connectInfraKubernetes')}
            </Text>
            <CodeBlock
              text={generateUpgradeInfrastructureFileName({
                infrastructureName: kubernetesChaosInfrastructureName,
                latestVersion
              })}
              isCopyButtonEnabled
            />
          </Container>
        </Container>
        <FlexExpander />
        <Layout.Horizontal className={css.gap2}>
          <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={() => setIsOpen(false)} />
          <Button
            onClick={() => {
              showSuccess(getString('upgradeManifestDownloadedSuccessfully'));
              setIsOpen(false);
            }}
            text={getString('done')}
            intent="primary"
            variation={ButtonVariation.PRIMARY}
            disabled={!isDownloaded}
          />
        </Layout.Horizontal>
      </Layout.Vertical>
    );
  },
  (oldProps, newProps) => isEqual(oldProps.setIsOpen, newProps.setIsOpen)
);

export default function KubernetesChaosInfrastructureUpgradeView({
  kubernetesChaosInfrastructureName,
  kubernetesChaosInfrastructureID,
  latestVersion,
  isUpgradeAvailable,
  getChaosInfrastructureManifestQuery
}: KubernetesChaosInfrastructureUpgradeViewProps): React.ReactElement {
  const { getString } = useStrings();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  return (
    <>
      <Dialog
        enforceFocus={false}
        title={getString('upgradeChaosInfrastructure')}
        onClose={() => setIsOpen(false)}
        isOpen={isOpen}
        style={{ height: '596px', width: '735px' }}
      >
        <MemoizedSelectChaosInfrastructureDeploymentMethod
          setIsOpen={setIsOpen}
          kubernetesChaosInfrastructureName={kubernetesChaosInfrastructureName}
          latestVersion={latestVersion}
          kubernetesChaosInfrastructureID={kubernetesChaosInfrastructureID}
          getChaosInfrastructureManifestQuery={getChaosInfrastructureManifestQuery}
        />
      </Dialog>
      <Button
        size={ButtonSize.SMALL}
        disabled={!isUpgradeAvailable}
        intent="primary"
        minimal
        round={false}
        withoutBoxShadow
        icon="upgrade-bolt"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <Text font={{ variation: FontVariation.SMALL }} color={Color.PRIMARY_7}>
          {getString('update')}
        </Text>
      </Button>
    </>
  );
}
