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
  useToaster
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
import { Environment } from '@api/entities';
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
  setEnvID,
  loading,
  pagination
}: ChaosInfrastructureReferenceFieldViewProps): JSX.Element {
  const [isOpen, setOpen] = React.useState(false);
  const paths = useRouteWithBaseUrl();
  const history = useHistory();

  const [selectedInfrastructure, setSelectedInfrastructure] = React.useState<InfrastructureDetails | undefined>(
    preSelectedInfrastructure
  );
  const [activeEnv, setactiveEnv] = React.useState<string>('all');
  // const searchParams = useSearchParams();
  // const infrastructureType =
  //   (searchParams.get('infrastructureType') as InfrastructureType | undefined) ?? InfrastructureType.KUBERNETES;
  const { showError } = useToaster();
  const { getString } = useStrings();

  const listingEnvironment = ({ env }: { env: Environment }): JSX.Element => {
    return (
      <Container
        key={env.environmentID}
        flex
        padding={{ left: 'small', right: 'medium', top: 'small', bottom: 'small' }}
        className={`${css.listEnvContainer} ${activeEnv === env.name && css.activeEnv}`}
        onClick={() => {
          setEnvID(env.environmentID);
          setactiveEnv(env.name);
        }}
      >
        <div className={css.itemEnv}>
          <Layout.Horizontal padding={{ left: 'small' }} spacing="medium">
            <Text lineClamp={1}>{env.name}</Text>
          </Layout.Horizontal>
        </div>
        <Text
          font={{ variation: FontVariation.SMALL }}
          color={activeEnv === env.name ? Color.WHITE : Color.PRIMARY_7}
          background={activeEnv === env.name ? Color.PRIMARY_7 : Color.PRIMARY_BG}
          height={25}
          width={25}
          flex={{ alignItems: 'center', justifyContent: 'center' }}
          className={css.rounded}
        >
          {env.infraIDs.length}
        </Text>
      </Container>
    );
  };

  const listItem = ({ infrastructure }: { infrastructure: InfrastructureDetails }): JSX.Element => {
    return (
      <Container
        key={infrastructure.id}
        padding="small"
        background={Color.WHITE}
        className={selectedInfrastructure?.id === infrastructure.id ? css.selected : css.notSelected}
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
            {/* <Icon name={`service-${infrastructureType.toLocaleLowerCase()}` as IconName} size={23} /> */}
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

  return (
    <FormGroup label={getString('selectChaosInfrastructureFormLabel')}>
      <Button
        minimal
        className={css.container}
        style={{ width: 340 }}
        withoutCurrentColor={true}
        rightIcon="chevron-down"
        iconProps={{ size: 14 }}
        onClick={() => setOpen(true)}
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
          setOpen(false);
          setSearchInfrastructure('');
        }}
        className={cx(css.referenceSelect, css.dialog)}
        title={
          <Layout.Horizontal>
            <Text font={{ variation: FontVariation.H3 }}>{getString('selectChaosInfrastructure')}</Text>
          </Layout.Horizontal>
        }
      >
        <Layout.Horizontal flex width={'100%'} padding={{ bottom: 'small' }} border={{ bottom: true }}>
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
            onChange={e => setSearchInfrastructure(e)}
          />
        </Layout.Horizontal>
        {environmentList && environmentList.length > 0 ? (
          <Layout.Vertical
            height={'calc(88% - 32px)'}
            padding={{ bottom: 'medium', top: 'small' }}
            className={css.gap4}
          >
            <Layout.Horizontal width={'100%'}>
              <Layout.Vertical
                width={'30%'}
                padding={{ left: 'medium', right: 'medium', top: 'small' }}
                className={css.agentList}
              >
                <Container
                  className={`${css.listEnvContainer} ${activeEnv === 'all' && css.activeEnv}`}
                  onClick={() => {
                    setEnvID('all');
                    setactiveEnv('all');
                  }}
                >
                  <Container flex padding={{ left: 'small', right: 'medium', bottom: 'small', top: 'small' }}>
                    <div className={css.itemEnv}>
                      <Layout.Horizontal padding={{ left: 'small' }} spacing="medium">
                        <Text lineClamp={1}>{getString('all')}</Text>
                      </Layout.Horizontal>
                    </div>
                    <Text
                      font={{ variation: FontVariation.SMALL }}
                      color={activeEnv === 'all' ? Color.WHITE : Color.PRIMARY_7}
                      background={activeEnv === 'all' ? Color.PRIMARY_7 : Color.PRIMARY_BG}
                      height={25}
                      width={25}
                      flex={{ alignItems: 'center', justifyContent: 'center' }}
                      className={css.rounded}
                    >
                      {allInfrastructureLength}
                    </Text>
                  </Container>
                </Container>
                {environmentList.map(env => listingEnvironment({ env: env }))}
              </Layout.Vertical>
              <Layout.Vertical width={'70%'} padding={{ top: 'small', left: 'medium' }} className={css.agentList}>
                <Layout.Vertical className={css.agentListInnerContainer}>
                  <Loader
                    loading={loading.listChaosInfra}
                    noData={{
                      when: () => !infrastructureList,
                      messageTitle: getString('noData.title'),
                      message: getString('noData.message')
                    }}
                  >
                    {infrastructureList && infrastructureList.length > 0 ? (
                      infrastructureList.map(infrastructure => listItem({ infrastructure: infrastructure }))
                    ) : (
                      <Layout.Vertical flex={{ justifyContent: 'center' }} spacing="medium" padding={{ top: 'xlarge' }}>
                        <img src={FallbackBox} alt={getString('latestRun')} />
                        <Text font={{ variation: FontVariation.BODY1 }} color={Color.GREY_500}>
                          {searchInfrastructure === ''
                            ? getString('newUserNoInfra.title')
                            : getString('noFilteredActiveInfra')}
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
                    )}
                  </Loader>
                </Layout.Vertical>
                <Container className={css.paginationContainer}>{pagination}</Container>
              </Layout.Vertical>
            </Layout.Horizontal>
          </Layout.Vertical>
        ) : (
          <Layout.Vertical
            height={'calc(88% - 32px)'}
            flex={{
              justifyContent: 'center'
            }}
            spacing="medium"
            background={Color.PRIMARY_BG}
          >
            <img src={FallbackBox} alt={getString('latestRun')} />
            <Text font={{ variation: FontVariation.BODY1 }} color={Color.GREY_500}>
              {searchInfrastructure === ''
                ? getString('newUserNoExperiments.title')
                : getString('noFilteredActiveInfra')}
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
        )}
        <Layout.Horizontal
          className={css.gap4}
          padding={{ right: 'medium', top: 'small' }}
          flex={{ justifyContent: 'flex-end' }}
        >
          <Button
            variation={ButtonVariation.PRIMARY}
            text={getString('apply')}
            onClick={() => {
              setOpen(false);
              setInfrastructureValue(selectedInfrastructure);
            }}
            disabled={!selectedInfrastructure}
          />
          <Button
            variation={ButtonVariation.TERTIARY}
            text={getString('cancel')}
            onClick={() => {
              setOpen(false);
            }}
          />
        </Layout.Horizontal>
      </Dialog>
    </FormGroup>
  );
}

export default ChaosInfrastructureReferenceFieldView;
