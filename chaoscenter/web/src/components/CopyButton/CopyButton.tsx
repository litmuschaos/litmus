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
    // eslint-disable-next-line no-alert
    window.prompt('Copy to clipboard: Ctrl+C, Enter', text);
  }

  function copyTextToClipboard(text: string): void {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    setCopying(true);
    // eslint-disable-next-line no-console
    navigator.clipboard
      .writeText(text)
      .then(() => showSuccess('Copied to clipboard'))
      .catch(err => showError('Could not copy text: ', err));
    setTimeout(() => setCopying(false), 3000);
  }

  return copying ? (
    <Icon size={12} data-testid="success-tick" name="success-tick" />
  ) : (
    <Icon
      style={{ cursor: 'pointer', color: 'var(--primary-7)' }}
      onClick={() => copyTextToClipboard(stringToCopy)}
      name="duplicate"
      size={12}
      data-testid="copy-button"
    />
  );
}
