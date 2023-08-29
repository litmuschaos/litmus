import React, { useState } from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import { Fallback } from '@errors';
import { useStrings } from '@strings';
import css from './ReadMore.module.scss';

const ReadMore = ({ text, trimLength }: { text: string; trimLength?: number }): React.ReactElement => {
  const { getString } = useStrings();
  const [isReadMore, setIsReadMore] = useState(true);
  const toggleReadMore = (): void => {
    setIsReadMore(!isReadMore);
  };
  return (
    <div className={css.text}>
      {text.length > (trimLength ?? 150) ? (
        <>
          {isReadMore ? `${text.slice(0, trimLength ?? 150)}...` : text}
          <span onClick={toggleReadMore} className={css.readOrHide}>
            {isReadMore ? getString('readMore') : getString('showLess')}
          </span>
        </>
      ) : (
        text
      )}
    </div>
  );
};

export default withErrorBoundary(ReadMore, { FallbackComponent: Fallback });
