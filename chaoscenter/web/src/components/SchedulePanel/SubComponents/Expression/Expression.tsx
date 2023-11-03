import React from 'react';
import { Text, Container } from '@harnessio/uicore';
import cx from 'classnames';
import { useStrings } from '@strings';
import { scheduleTabsId, isCronValid } from '../utils';
import css from './Expression.module.scss';

interface ExpressionInterface {
  formikProps: any;
  validateCron?: boolean;
}

export default function Expression(props: ExpressionInterface): JSX.Element {
  const {
    formikProps: {
      values: { expression, selectedScheduleTab }
    },
    validateCron = false
  } = props;
  const { getString } = useStrings();
  const showError = validateCron && selectedScheduleTab === scheduleTabsId.CUSTOM && !isCronValid(expression);
  return (
    <Container data-name="expression" className={css.expression}>
      <Text className={css.label} data-tooltip-id="cronExpression">
        {getString('cronExpression')}
      </Text>
      <Container className={cx(css.field, (showError && css.errorField) || '')}>
        <Text data-testid="cron-expression">{expression}</Text>
      </Container>
    </Container>
  );
}
