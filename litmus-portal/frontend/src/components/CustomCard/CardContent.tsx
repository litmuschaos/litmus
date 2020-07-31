/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Divider, Link } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import formatCount from '../../utils/formatCount';
import { preDefinedWorkflowData } from '../../models/predefinedWorkflow';
import useStyles from './styles';
import parsed from '../../utils/yamlUtils';

const CardContent: React.FC<preDefinedWorkflowData> = ({
  title,
  urlToIcon,
  provider,
  handleClick,
  description,
  totalRuns,
  gitLink,
  selectedID,
  workflowID,
  chaosWkfCRDLink,
}) => {
  const classes = useStyles();

  const [retText, setRetText] = useState('');

  const [exptCount, setExptCount] = useState(0);

  const fetchYaml = (link: string) => {
    fetch(link)
      .then((data) => {
        data.text().then((yamlText) => {
          setRetText(yamlText);
        });
      })
      .then()
      .catch((err) => {
        console.error(`Unable to fetch the yaml text${err}`);
        setRetText('error');
      });
  };

  useEffect(() => {
    fetchYaml(chaosWkfCRDLink as string);
    const tests = parsed(retText);
    if (
      tests[0] === 'none' ||
      tests[0] === 'Invalid CRD' ||
      tests[0] === 'Yaml Error'
    ) {
      setExptCount(0);
    } else {
      setExptCount(tests.length);
    }
    // Fetch and Set exptCount from backend via GQL if workflow CRDs are categorized in types.
  }, [retText, exptCount]);

  return (
    <div
      className={
        selectedID === workflowID ? classes.cardSelected : classes.card
      }
    >
      <div className={classes.cardContent} onClick={handleClick}>
        <div className={classes.cardAnalytics}>
          {totalRuns ? (
            <span
              className={
                selectedID === workflowID
                  ? classes.totalRunsSelected
                  : classes.totalRuns
              }
            >
              {formatCount(totalRuns)}+
            </span>
          ) : (
            <span />
          )}

          {(exptCount as number) === 0 ? (
            <div />
          ) : (
            <span
              className={
                selectedID === workflowID
                  ? classes.expCountSelected
                  : classes.expCount
              }
            >
              {exptCount}{' '}
              {(exptCount as number) > 1 ? (
                <span>Experiments</span>
              ) : (
                <span>Experiment</span>
              )}
            </span>
          )}
        </div>
        <div className={classes.cardBody}>
          {urlToIcon ? (
            <div className={classes.cardMedia}>
              <img src={urlToIcon} alt="chart provider logo" />
            </div>
          ) : (
            <div className={classes.noImage}>Image</div>
          )}
          <div className={classes.cardInfo}>
            <div className={classes.title}>{title}</div>
            <div className={classes.provider}>Contributed by {provider}</div>
          </div>
          {description ? (
            <div className={classes.description}>{description}</div>
          ) : (
            <span />
          )}
        </div>
        <Divider variant="fullWidth" className={classes.horizontalLine} />
        <div className={classes.details}>
          <Link href={gitLink} underline="none" className={classes.moreDetails}>
            <div className={classes.detailsText}> See details </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default CardContent;
