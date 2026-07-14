import { Layout, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import React from 'react';
import CopyButton from '@components/CopyButton';
import css from './CodeBlock.module.scss';

interface CodeBlockProps {
  text: string;
  isCopyButtonEnabled?: boolean;
}

export default function CodeBlock({ text, isCopyButtonEnabled }: CodeBlockProps): React.ReactElement {
  return (
    <Layout.Horizontal className={css.codeBlockWrapper}>
      <div className={css.codeBlock}>
        <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.SMALL }} className={css.textMargin}>
          {text}
        </Text>
        {isCopyButtonEnabled && <CopyButton stringToCopy={text} />}
      </div>
    </Layout.Horizontal>
  );
}
