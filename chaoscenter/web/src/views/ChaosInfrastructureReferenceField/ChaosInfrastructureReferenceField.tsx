import { FormGroup } from '@blueprintjs/core';
import { Color, FontVariation } from '@harnessio/design-system';
import {
  Button,
  ButtonVariation,
  Container,
  Dialog,
  ExpandingSearchInput,
  Layout,
  Text,
  useToaster,
  useToggleOpen
} from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import cx from 'classnames';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useStrings } from '@strings';
import FallbackBox from '@images/FallbackBox.svg';
import CustomTagsPopover from '@components/CustomTagsPopover';
import Loader from '@components/Loader';
import { useRouteWithBaseUrl } from '@hooks';
import { Environment, EnvironmentDetail } from '@api/entities';
import css from './ChaosInfrastructureReferenceField.module.scss';

export interface InfrastructureDetails {
  id: string;
  name: string;
  tags?: string[];
  noOfExperiments?: number;
  noOfExperimentsRuns?: number;
  isActive: boolean;
  namespace?: string;
  environmentID?: string;
}

interface ChaosInfrastructureReferenceFieldViewProps {
  infrastructureList: InfrastructureDetails[] | undefined;
  allInfrastructureLength: number | null;
  environmentList: Environment[] | undefined;
  preSelectedInfrastructure?: InfrastructureDetails;
  setInfrastructureValue: (infrastructure: InfrastructureDetails | undefined) => void;
  searchInfrastructure: string;
  setSearchInfrastructure: React.Dispatch<React.SetStateAction<string>>;
  setEnvID: (id: string) => void;
  envID: string | undefined;
  loading: {
    listChaosInfra: boolean;
  };
  pagination: JSX.Element;
}

function ChaosInfrastructureReferenceFieldView({
  infrastructureList,
  environmentList,
  allInfrastructureLength,
  preSelectedInfrastructure,
  setInfrastructureValue,
  searchInfrastructure,
  setSearchInfrastructure,
  envID,
  setEnvID,
  loading,
  pagination
}: ChaosInfrastructureReferenceFieldViewProps): JSX.Element {
  const paths = useRouteWithBaseUrl();
  const history = useHistory();

  const [selectedInfrastructure, setSelectedInfrastructure] = React.useState<InfrastructureDetails | undefined>(
    preSelectedInfrastructure
  );
  const { isOpen, open, close } = useToggleOpen();

  const { showError } = useToaster();
  const { getString } = useStrings();

  const EnvListItem = ({ envDetail }: { envDetail: EnvironmentDetail }): JSX.Element => {
    return (
      <Container
        key={envDetail.envID}
        flex
        padding="small"
        className={cx(css.listEnvContainer, { [css.activeEnv]: envID === envDetail.envID })}
        onClick={() => {
          setEnvID(envDetail.envID);
        }}
      >
        <div className={css.itemEnv}>
          <Layout.Horizontal padding={{ left: 'small' }} spacing="medium" className={css.leftInfo}>
            <Text lineClamp={1} color={Color.GREY_800} font={{ variation: FontVariation.H6 }}>
              {envDetail.envName}
            </Text>
          </Layout.Horizontal>
          <Text
            font={{ variation: FontVariation.SMALL }}
            color={envID === envDetail.envID ? Color.WHITE : Color.PRIMARY_7}
            background={envID === envDetail.envID ? Color.PRIMARY_7 : Color.PRIMARY_BG}
            height={24}
            width={24}
            flex={{ alignItems: 'center', justifyContent: 'center' }}
            className={css.rounded}
          >
            {envDetail.totalInfra ?? 0}
          </Text>
        </div>
      </Container>
    );
  };

  const EnvironmentList = ({ env }: { env: Environment }): JSX.Element => {
    return (
      <EnvListItem
        envDetail={{
          envName: env.name,
          envID: env.environmentID,
          totalInfra: env.infraIDs.length
        }}
      />
    );
  };

  const InfrastructureListItem = ({ infrastructure }: { infrastructure: InfrastructureDetails }): JSX.Element => {
    const isSelected =
      selectedInfrastructure?.id === infrastructure.id || preSelectedInfrastructure?.id === infrastructure.id;

    return (
      <Container
        key={infrastructure.id}
        padding="small"
        background={Color.WHITE}
        className={cx({ [css.selected]: isSelected, [css.notSelected]: !isSelected })}
        onClick={() => {
          infrastructure.isActive
            ? setSelectedInfrastructure(infrastructure)
            : showError(getString('degelateNotActive'));
        }}
      >
        <div className={css.item}>
          <Layout.Horizontal padding={{ left: 'small' }} spacing="medium" className={css.leftInfo}>
            <Icon
              className={cx(css.iconCheck, { [css.iconChecked]: selectedInfrastructure?.id === infrastructure.id })}
              size={12}
              name="pipeline-approval"
            />
            <Text lineClamp={1} color={Color.GREY_800} font={{ variation: FontVariation.H6 }}>
              {infrastructure.name}
            </Text>
            {infrastructure.tags && <CustomTagsPopover tags={infrastructure.tags} />}
          </Layout.Horizontal>
          <div className={css.gitInfo}>
            <Text
              lineClamp={1}
              font={{ size: 'small', weight: 'light' }}
              color={Color.GREY_700}
              icon="chaos-scenario-builder"
              iconProps={{ size: 15 }}
            >
              {getString('experiments')}: {infrastructure.noOfExperiments ?? 0}
            </Text>
            <Text
              lineClamp={1}
              font={{ size: 'small', weight: 'light' }}
              color={Color.GREY_700}
              icon="list"
              iconProps={{ size: 12 }}
              className={cx(css.gitBranchIcon)}
            >
              {getString('experimentRuns')}: {infrastructure.noOfExperimentsRuns ?? 0}
            </Text>
          </div>
          <Icon
            className={css.status}
            name="full-circle"
            size={10}
            width={30}
            color={infrastructure.isActive ? Color.GREEN_500 : Color.RED_500}
          />
        </div>
      </Container>
    );
  };

  const NoInfraComponent = (): JSX.Element => {
    return (
      <Layout.Vertical flex={{ justifyContent: 'center' }} spacing="medium" padding={{ top: 'xlarge' }}>
        <img src={FallbackBox} alt={getString('latestRun')} />
        <Text font={{ variation: FontVariation.BODY1 }} color={Color.GREY_500}>
          {searchInfrastructure === '' ? getString('newUserNoInfra.title') : getString('noFilteredActiveInfra')}
        </Text>
        {searchInfrastructure === '' && (
          <Button
            variation={ButtonVariation.PRIMARY}
            text={getString('enableChaosInfraButton')}
            onClick={() => {
              history.push(paths.toEnvironments());
            }}
          />
        )}
      </Layout.Vertical>
    );
  };

  return (
    <FormGroup label={getString('selectChaosInfrastructureFormLabel')}>
      <Button
        minimal
        className={css.container}
        style={{ width: 340 }}
        withoutCurrentColor={true}
        rightIcon="chevron-down"
        iconProps={{ size: 14 }}
        onClick={open}
        disabled={loading.listChaosInfra}
      >
        <span className={css.placeholder}>
          {preSelectedInfrastructure?.name ?? (
            <span className={css.placeholder}>{getString('selectChaosInfrastructure')}</span>
          )}
        </span>
      </Button>
      <Dialog
        isOpen={isOpen}
        enforceFocus={false}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={() => {
          close();
          setSearchInfrastructure('');
        }}
        className={cx(css.referenceSelect, css.dialog)}
        title={
          <Layout.Horizontal>
            <Text font={{ variation: FontVariation.H3 }}>{getString('selectChaosInfrastructure')}</Text>
          </Layout.Horizontal>
        }
      >
        {environmentList && environmentList.length > 0 ? (
          <Layout.Vertical height={'100%'}>
            <Layout.Horizontal flex padding={{ bottom: 'small' }} border={{ bottom: true }}>
              <Container
                width={'50%'}
                padding={{ left: 'medium', right: 'medium' }}
                flex={{ justifyContent: 'space-between' }}
              >
                <Text color={Color.GREY_800} font={{ variation: FontVariation.H5 }}>
                  {getString('environments')}
                </Text>
                <Text color={Color.GREY_800} font={{ variation: FontVariation.H5 }}>
                  {getString('infrastructures')}
                </Text>
              </Container>
              <ExpandingSearchInput
                alwaysExpanded
                throttle={500}
                placeholder={getString('search')}
                onChange={setSearchInfrastructure}
              />
            </Layout.Horizontal>
            <Layout.Horizontal height={'calc(100% - 80px)'}>
              <Layout.Horizontal width={'30%'} padding={{ top: 'small' }} border={{ right: true }}>
                <Layout.Vertical
                  width={'30%'}
                  padding={{ left: 'medium', right: 'small', top: 'small', bottom: 'medium' }}
                  className={cx(css.agentList, css.agentListInnerContainer)}
                >
                  <EnvListItem
                    envDetail={{
                      envName: getString('all'),
                      envID: getString('all'),
                      totalInfra: allInfrastructureLength
                    }}
                  />
                  {environmentList.map(env => (
                    <EnvironmentList key={env.environmentID} env={env} />
                  ))}
                </Layout.Vertical>
              </Layout.Horizontal>
              <Layout.Horizontal width={'70%'} padding={{ top: 'small' }}>
                <Layout.Vertical width={'70%'} className={css.agentList}>
                  <Layout.Vertical
                    height={'80%'}
                    width={'100%'}
                    padding={'small'}
                    className={cx(css.agentList, css.agentListInnerContainer)}
                  >
                    <Loader
                      loading={loading.listChaosInfra}
                      noData={{
                        when: () => !infrastructureList,
                        messageTitle: getString('noData.title'),
                        message: getString('noData.message')
                      }}
                    >
                      {infrastructureList && infrastructureList.length > 0 ? (
                        infrastructureList.map(infrastructure => (
                          <InfrastructureListItem key={infrastructure.id} infrastructure={infrastructure} />
                        ))
                      ) : (
                        <NoInfraComponent />
                      )}
                    </Loader>
                  </Layout.Vertical>
                  <Layout.Horizontal flex={{ justifyContent: 'center' }}>
                    {pagination && <Container className={css.paginationContainer}>{pagination}</Container>}
                  </Layout.Horizontal>
                </Layout.Vertical>
              </Layout.Horizontal>
            </Layout.Horizontal>
            <Layout.Horizontal spacing="small" padding={{ right: 'medium' }} flex={{ justifyContent: 'flex-end' }}>
              <Button
                variation={ButtonVariation.PRIMARY}
                text={getString('apply')}
                onClick={() => {
                  close();
                  setInfrastructureValue(selectedInfrastructure);
                }}
                disabled={!selectedInfrastructure}
              />
              <Button variation={ButtonVariation.TERTIARY} text={getString('cancel')} onClick={close} />
            </Layout.Horizontal>
          </Layout.Vertical>
        ) : (
          <NoInfraComponent />
        )}
      </Dialog>
    </FormGroup>
  );
}

export default ChaosInfrastructureReferenceFieldView;
