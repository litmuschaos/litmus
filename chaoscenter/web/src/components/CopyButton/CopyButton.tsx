import React from 'react';
import { useToaster } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';

interface CopyButtonProps {
  stringToCopy: string;
}

export default function CopyButton({ stringToCopy }: CopyButtonProps): React.ReactElement {
  const [copying, setCopying] = React.useState<boolean>(false);
  const { showSuccess, showError } = useToaster();

  function fallbackCopyTextToClipboard(text: string): void {
    window.prompt('Copy to clipboard: Ctrl+C, Enter', text);
  }

  function copyTextToClipboard(text: string): void {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    setCopying(true);

    navigator.clipboard
      .writeText(text)
      .then(() => showSuccess('Copied to clipboard'))
      .catch(err => showError('Could not copy text: ', err));
    setTimeout(() => setCopying(false), 3000);
  }

  return copying ? (
    <span style={{ width: 12, height: 12, display: 'inline-flex', alignItems: 'center' }} data-testid="success-tick">
      <Icon name="success-tick" />
    </span>
  ) : (
    <span
      role="button"
      tabIndex={0}
      style={{
        cursor: 'pointer',
        color: 'var(--primary-7)',
        width: 12,
        height: 12,
        display: 'inline-flex',
        alignItems: 'center'
      }}
      onClick={() => copyTextToClipboard(stringToCopy)}
      onKeyPress={e => {
        if (e.key === 'Enter' || e.key === ' ') copyTextToClipboard(stringToCopy);
      }}
      data-testid="copy-button"
    >
      <Icon name="duplicate" />
    </span>
  );
}
