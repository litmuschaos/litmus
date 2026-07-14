import React from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import { Fallback } from '@errors';
import Loader from '@components/Loader';
import type { Mode, Probe } from '@api/entities';
import ProbeDescription from '../SelectProbesDetail/ProbeDescription';

export interface ProbePropertiesViewProps {
  probeDetails: Probe | undefined;
  mode: Mode;
  loading: boolean;
  isModeSelected: boolean;
}

function ProbePropertiesView({
  loading,
  probeDetails,
  mode,
  isModeSelected
}: ProbePropertiesViewProps): React.ReactElement {
  return (
    <Loader
      loading={loading}
      height="fit-content"
      style={{
        minHeight: loading ? 'calc(var(--page-min-height) - var(--spacing-xxlarge))' : 'initial'
      }}
    >
      {probeDetails && (
        <ProbeDescription probeDetail={probeDetails} mode={mode} inStudio={false} isModeSelected={isModeSelected} />
      )}
    </Loader>
  );
}

export default withErrorBoundary(ProbePropertiesView, { FallbackComponent: Fallback });
