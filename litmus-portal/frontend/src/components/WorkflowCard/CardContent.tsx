/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect, useState } from 'react';
import { preDefinedWorkflowData } from '../../models/predefinedWorkflow';
import useStyles from './styles';
import parsed from '../../utils/yamlUtils';

const CardContent: React.FC<preDefinedWorkflowData> = ({
  title,
  urlToIcon,
  provider,
  handleClick,
  description,
  chaosWkfCRDLink,
}) => {
  const classes = useStyles();

  const [yamlText, setYamlText] = useState<string>('');
  const [exptCount, setExptCount] = useState<number>(0);

  // Function to fetch yaml and convert them to text
  // to set the experiment count based on the parsed text

  const fetchYaml = (link: string) => {
    fetch(link)
      .then((data) => {
        data.text().then((yamlText) => {
          setYamlText(yamlText);
        });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // Fetch the YAML through the CRD Link from data.ts
  // and get the experiment count by passing the parsed text
  // into parsed() yaml function
  useEffect(() => {
    fetchYaml(chaosWkfCRDLink as string);
    const tests = parsed(yamlText);
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
  }, [yamlText, exptCount]);

  return (
    <div className={classes.card}>
      <div className={classes.cardContent} onClick={handleClick}>
        <div className={classes.cardAnalytics}>
          {/* {totalRuns ? (
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
          )} */}
          <span className={classes.expCount}>{exptCount} Experiment</span>
        </div>
        <div>
          {urlToIcon ? (
            <div className={classes.cardMedia}>
              <img src={urlToIcon} alt="chart provider logo" />
            </div>
          ) : (
            <div className={classes.noImage}>Image</div>
          )}
          <div>
            <div className={classes.title}>{title}</div>
            <div className={classes.provider}>Contributed by {provider}</div>
          </div>
          {description ? (
            <div className={classes.description}>{description}</div>
          ) : (
            <span />
          )}
        </div>
        {/* <Divider variant="fullWidth" className={classes.horizontalLine} />
        <div className={classes.details}>
          <Link href={gitLink} underline="none" className={classes.moreDetails}>
            <div className={classes.detailsText}> See details </div>
          </Link>
        </div> */}
      </div>
    </div>
  );
};
export default CardContent;
