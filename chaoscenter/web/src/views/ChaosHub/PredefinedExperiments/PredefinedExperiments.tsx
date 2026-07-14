import React from 'react';
import { parse } from 'yaml';
import { Layout, Pagination, Text } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import { Color, FontVariation } from '@harnessio/design-system';
import { withErrorBoundary } from 'react-error-boundary';
import type { PredefinedExperiment } from '@api/entities';
import { toTitleCase } from '@utils';
import { useStrings } from '@strings';
import PredefinedExperimentCard from '@components/PredefinedExperimentCard';
import NoExperiments from '@images/NoExperiments.svg';
import Loader from '@components/Loader';
import { Fallback } from '@errors';
import css from './PredefinedExperiments.module.scss';

interface PredefinedExperimentsProps {
  predefinedExperiments?: PredefinedExperiment[];
  predefinedCategories: Map<string, number>;
  searchValue: string;
  loading: {
    listPredefinedExperiment: boolean;
  };
}
interface TagProps {
  name: string;
  count: number;
}

function PredefinedExperiments({
  predefinedExperiments,
  predefinedCategories,
  searchValue,
  loading
}: PredefinedExperimentsProps): React.ReactElement {
  const tags: TagProps[] = [];
  const [activeTag, setActiveTag] = React.useState<string>('All');
  const { getString } = useStrings();
  const [limit, setLimit] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(0);

  [...predefinedCategories].forEach(category =>
    tags.push({
      name: category[0],
      count: category[1]
    })
  );

  React.useEffect(() => {
    setCurrentPage(0);
  }, [searchValue]);

  React.useEffect(() => {
    if (limit * currentPage > (filteredExperiments(activeTag)?.length ?? 0))
      setCurrentPage(Math.ceil((filteredExperiments(activeTag)?.length ?? 0) / limit) - 1);
  }, [limit, activeTag]);

  const filteredExperiments = (tag: string): PredefinedExperiment[] | undefined => {
    if (tag === 'All' && searchValue === '') {
      return predefinedExperiments;
    } else if (tag === 'All' && searchValue !== '') {
      return predefinedExperiments?.filter(experiment => {
        const parsedCSV = parse(experiment.experimentCSV);
        if (
          toTitleCase({
            text: parsedCSV?.spec.displayName,
            separator: '-',
            noCasing: true
          }).includes(
            toTitleCase({
              text: searchValue,
              separator: '-',
              noCasing: true
            })
          )
        )
          return experiment;
      });
    }
    return predefinedExperiments?.filter(experiment => {
      const parsedCSV = parse(experiment.experimentCSV);
      if (
        parsedCSV?.spec.keywords.includes(tag) &&
        toTitleCase({
          text: parsedCSV?.spec.displayName,
          separator: '-',
          noCasing: true
        }).includes(
          toTitleCase({
            text: searchValue,
            separator: '-',
            noCasing: true
          })
        )
      )
        return experiment;
    });
  };

  return (
    <Layout.Horizontal className={css.centerContainer} background={Color.PRIMARY_BG}>
      <Layout.Vertical width="236px" height="100%" padding="medium" background={Color.WHITE} className={css.tagsCont}>
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
            {loading.listPredefinedExperiment ? (
              <Icon name="steps-spinner" size={12} color={Color.WHITE} />
            ) : (
              filteredExperiments('All')?.length ?? 0
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
              {filteredExperiments(tag.name)?.length ?? 0}
            </Text>
          </Layout.Horizontal>
        ))}
      </Layout.Vertical>
      <Loader loading={loading.listPredefinedExperiment}>
        {filteredExperiments(activeTag) && filteredExperiments(activeTag)?.length !== 0 ? (
          <Layout.Vertical
            width="calc(100% - 236px)"
            height="100%"
            padding={{ top: 'medium', bottom: 'medium', left: 'xxlarge', right: 'xxlarge' }}
          >
            <div className={css.listContainer}>
              {filteredExperiments(activeTag)
                ?.slice(currentPage * limit, currentPage * limit + limit)
                .map(experiment => {
                  return (
                    <PredefinedExperimentCard
                      key={`${experiment.experimentName}-${currentPage}`}
                      predefinedExperiment={experiment}
                    />
                  );
                })}
            </div>
            <Pagination
              itemCount={filteredExperiments(activeTag)?.length ?? 0}
              className={css.paginationContainer}
              pageSize={limit}
              pageCount={Math.ceil((filteredExperiments(activeTag)?.length ?? 0) / limit)}
              pageIndex={currentPage}
              gotoPage={pageNumber => setCurrentPage(pageNumber)}
              pageSizeOptions={[10, 15, 20]}
              onPageSizeChange={event => setLimit(parseInt(event.toString()))}
            />
          </Layout.Vertical>
        ) : (
          <Layout.Vertical
            width="calc(100% - 236px)"
            height={'100%'}
            flex={{ justifyContent: 'center', alignItems: 'center' }}
            background={Color.PRIMARY_BG}
          >
            <img className={css.center} src={NoExperiments} alt={getString('latestRun')} />
            <Text
              className={css.center}
              font={{ variation: FontVariation.BODY1 }}
              padding={{ top: 'large' }}
              color={Color.GREY_500}
            >
              {searchValue === ''
                ? getString('chaosHubNoExp')
                : getString('chaosHubNoSearchExperiment', { searchTerm: searchValue })}
            </Text>
          </Layout.Vertical>
        )}
      </Loader>
    </Layout.Horizontal>
  );
}

export default withErrorBoundary(PredefinedExperiments, { FallbackComponent: Fallback });
