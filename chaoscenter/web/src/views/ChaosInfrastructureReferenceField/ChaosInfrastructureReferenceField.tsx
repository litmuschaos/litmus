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
  preSelectedInfrastructure?: InfrastructureDetails;
  setInfrastructureValue: (infrastructure: InfrastructureDetails | undefined) => void;
  searchInfrastructure: string;
  setSearchInfrastructure: React.Dispatch<React.SetStateAction<string>>;
  loading: {
    listChaosInfra: boolean;
  };
  pagination: JSX.Element;
}

function ChaosInfrastructureReferenceFieldView({
  infrastructureList,
  preSelectedInfrastructure,
  setInfrastructureValue,
  searchInfrastructure,
  setSearchInfrastructure,
  loading,
  pagination
}: ChaosInfrastructureReferenceFieldViewProps): JSX.Element {
  const [isOpen, setOpen] = React.useState(false);
  const paths = useRouteWithBaseUrl();
  const history = useHistory();
  const [selectedInfrastructure, setSelectedInfrastructure] = React.useState<InfrastructureDetails | undefined>(
    preSelectedInfrastructure
  );
  // const searchParams = useSearchParams();
  // const infrastructureType =
  //   (searchParams.get('infrastructureType') as InfrastructureType | undefined) ?? InfrastructureType.KUBERNETES;
  const { showError } = useToaster();
  const { getString } = useStrings();

  const listItem = ({ infrastructure }: { infrastructure: InfrastructureDetails }): JSX.Element => {
    return (
      <Container
        key={infrastructure.id}
        padding="medium"
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
          <Layout.Horizontal spacing={'small'} flex={{ distribution: 'space-between' }}>
            <Text font={{ variation: FontVariation.H3 }}>{getString('selectChaosInfrastructure')}</Text>
          </Layout.Horizontal>
        }
      >
        <Layout.Vertical
          flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
          padding={{ bottom: 'medium' }}
          height={'calc(100% - 32px)'}
          className={css.gap4}
        >
          <Container width={'100%'}>
            <ExpandingSearchInput
              alwaysExpanded
              throttle={500}
              placeholder={getString('search')}
              onChange={e => setSearchInfrastructure(e)}
            />
          </Container>
          <Loader
            loading={loading.listChaosInfra}
            noData={{
              when: () => !infrastructureList,
              messageTitle: getString('noData.title'),
              message: getString('noData.message')
            }}
          >
            <Layout.Vertical width="100%" className={css.agentList}>
              <Layout.Vertical width="100%" className={css.agentListInnerContainer}>
                {infrastructureList && infrastructureList.length > 0 ? (
                  infrastructureList.map(infrastructure => listItem({ infrastructure: infrastructure }))
                ) : (
                  <Layout.Vertical flex={{ justifyContent: 'center' }} spacing="medium" height={'100%'}>
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
              </Layout.Vertical>
              <Container className={css.paginationContainer}>{pagination}</Container>
            </Layout.Vertical>
          </Loader>
        </Layout.Vertical>
        <Layout.Horizontal className={cx(css.gap4, css.fixed)}>
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
