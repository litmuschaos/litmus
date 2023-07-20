import React from 'react';
import { Card, Layout, Pagination, Text } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import { FontVariation, Color } from '@harnessio/design-system';
import { Link, useParams } from 'react-router-dom';
import { withErrorBoundary } from 'react-error-boundary';
import { toTitleCase } from '@utils';
import { useStrings } from '@strings';
import NoExperiments from '@images/NoExperiments.svg';
import { Fallback } from '@errors';
import Loader from '@components/Loader';
import { useSearchParams, useRouteWithBaseUrl } from '@hooks';
import type { ListFaultResponse } from '@api/core';
import css from './ChaosFaults.module.scss';

interface ChaosFaultsProps {
  hubDetails: ListFaultResponse | undefined;
  faultCategories: Map<string, number>;
  searchValue: string;
  loading: {
    listChart: boolean;
  };
}
interface TagProps {
  name: string;
  // icon: IconName;
  count: number;
}

interface Fault {
  name: string;
  displayName: string;
  description: string;
  chartName: string;
  tag: string;
}

function ChaosFaults({ hubDetails, faultCategories, loading, searchValue }: ChaosFaultsProps): React.ReactElement {
  const { hubID } = useParams<{ hubID: string }>();
  const paths = useRouteWithBaseUrl();
  const searchParams = useSearchParams();
  const hubName = searchParams.get('hubName');
  const isDefault = searchParams.get('isDefault');
  const tags: TagProps[] = [];
  const faultsArray: Fault[] = [];
  const [activeTag, setActiveTag] = React.useState<string>('All');
  const [limit, setLimit] = React.useState<number>(24);
  const [currentPage, setCurrentPage] = React.useState<number>(0);
  const { getString } = useStrings();

  React.useEffect(() => {
    setCurrentPage(0);
  }, [searchValue]);

  React.useEffect(() => {
    if (limit * currentPage > (filteredFaults(activeTag)?.length ?? 0))
      setCurrentPage(Math.ceil((filteredFaults(activeTag)?.length ?? 0) / limit) - 1);
  }, [limit, activeTag]);

  [...faultCategories].forEach(category =>
    tags.push({
      name: category[0],
      count: category[1]
    })
  );

  hubDetails?.listChaosFaults.map(chart => {
    const chartName = chart.metadata.name;
    const tag = chart.spec.displayName;
    chart.spec.faults.forEach(fault => {
      const obj = { ...fault, chartName: chartName, tag: tag };
      faultsArray.push(obj);
    });
  });

  const filteredFaults = (tag: string): Fault[] => {
    const match = (fault: string, search: string): boolean =>
      toTitleCase({ text: fault, separator: '-', noCasing: true }).includes(
        toTitleCase({ text: search, separator: '-', noCasing: true })
      );
    if (tag === 'All' && searchValue === '') return faultsArray;
    else if (tag === 'All' && searchValue !== '') {
      return faultsArray.filter(fault => match(fault.name, searchValue));
    } else {
      return faultsArray.filter(
        fault => match(fault.name, searchValue) && fault.tag.toLowerCase() === tag.toLowerCase()
      );
    }
  };

  const FaultCard = (fault: Fault): React.ReactElement => {
    return (
      <Link
        to={{
          pathname: paths.toChaosFault({ hubID: hubID, faultName: fault.name }),
          search: `?hubName=${hubName}&isDefault=${isDefault}&chartName=${fault.chartName}`
        }}
      >
        <Card key={fault.name} interactive className={css.insideCard}>
          <Layout.Vertical spacing="medium">
            <Layout.Horizontal spacing="small">
              <Icon size={23} name="chaos-litmuschaos" />
              <Text font={{ variation: FontVariation.BODY, weight: 'semi-bold' }} color={Color.PRIMARY_7}>
                {fault.displayName === ''
                  ? toTitleCase({
                      text: fault.name,
                      separator: '-'
                    })
                  : fault.displayName}
              </Text>
            </Layout.Horizontal>
            <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_450}>
              {fault.description}
            </Text>
          </Layout.Vertical>
        </Card>
      </Link>
    );
  };

  return (
    <Layout.Horizontal className={css.centerContainer}>
      <Layout.Vertical width="236px" height="100%" padding="medium" background={Color.WHITE} className={css.gap4}>
        <Layout.Horizontal
          flex
          padding={{ left: 'small', right: 'small', top: 'medium', bottom: 'medium' }}
          className={`${css.tagCard} ${activeTag === 'All' && css.activeTag}`}
          onClick={() => setActiveTag('All')}
        >
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} className={css.gap1}>
            <Icon name="nav-settings" size={22} />
            <Text className={css.tagText} font={{ variation: FontVariation.SMALL }}>
              {getString('all')}
            </Text>
          </Layout.Horizontal>
          <Text
            font={{ variation: FontVariation.TINY }}
            color={activeTag === 'All' ? Color.WHITE : Color.PRIMARY_7}
            background={activeTag === 'All' ? Color.PRIMARY_7 : Color.PRIMARY_BG}
            height={25}
            width={25}
            flex={{ alignItems: 'center', justifyContent: 'center' }}
            className={css.rounded}
          >
            {loading.listChart ? (
              <Icon name="steps-spinner" size={12} color={Color.WHITE} />
            ) : (
              filteredFaults('All').length
            )}
          </Text>
        </Layout.Horizontal>
        {tags.map(tag => (
          <Layout.Horizontal
            key={tag.name}
            flex
            padding={{ left: 'small', right: 'small', top: 'medium', bottom: 'medium' }}
            className={`${css.tagCard} ${activeTag === tag.name && css.activeTag}`}
            onClick={() => setActiveTag(tag.name)}
          >
            <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} className={css.gap1}>
              <Text className={css.tagText} font={{ variation: FontVariation.SMALL }} lineClamp={1}>
                {tag.name}
              </Text>
            </Layout.Horizontal>
            <Text
              font={{ variation: FontVariation.TINY }}
              color={activeTag === tag.name ? Color.WHITE : Color.PRIMARY_7}
              background={activeTag === tag.name ? Color.PRIMARY_7 : Color.PRIMARY_BG}
              height={25}
              width={25}
              flex={{ alignItems: 'center', justifyContent: 'center' }}
              className={css.rounded}
            >
              {filteredFaults(tag.name).length}
            </Text>
          </Layout.Horizontal>
        ))}
      </Layout.Vertical>
      <Loader loading={loading.listChart}>
        {filteredFaults(activeTag) && filteredFaults(activeTag)?.length !== 0 ? (
          <div className={css.listContainer}>
            <div className={css.listContainerWithoutLoader}>
              {filteredFaults(activeTag)
                ?.slice(currentPage * limit, currentPage * limit + limit)
                .map((fault: Fault) => FaultCard(fault))}
            </div>
            <Pagination
              itemCount={filteredFaults(activeTag).length}
              className={css.paginationContainer}
              pageSize={limit}
              pageCount={Math.ceil(filteredFaults(activeTag).length / limit)}
              pageIndex={currentPage}
              gotoPage={pageNumber => setCurrentPage(pageNumber)}
              pageSizeOptions={[12, 24, 48]}
              onPageSizeChange={event => setLimit(parseInt(event.toString()))}
            />
          </div>
        ) : (
          <Layout.Vertical
            width="calc(100% - 236px)"
            height={'100%'}
            flex={{ justifyContent: 'center', alignItems: 'center' }}
            background={Color.PRIMARY_BG}
          >
            <img src={NoExperiments} alt={getString('latestRun')} />
            <Text font={{ variation: FontVariation.BODY1 }} padding={{ top: 'large' }} color={Color.GREY_500}>
              {searchValue === ''
                ? getString('chaosHubNoFault')
                : getString('chaosHubNoSearchFault', { searchTerm: searchValue })}
            </Text>
          </Layout.Vertical>
        )}
      </Loader>
    </Layout.Horizontal>
  );
}

export default withErrorBoundary(ChaosFaults, { FallbackComponent: Fallback });
