import React from 'react';
import { useToaster } from '@harnessio/uicore';
import { parse } from 'yaml';
import type { FaultData } from '@models';
import { getScope } from '@utils';
import { listProbes, getProbeYAML } from '@api/core';
import { Mode, Probe } from '@api/entities';

interface SelectProbesTabControllerProps {
  faultData: FaultData | undefined;
  onSave: (data: Omit<FaultData, 'experimentCR'>) => void;
}

export default function SelectProbesTabController({
  faultData,
  onSave
}: SelectProbesTabControllerProps): React.ReactElement {
  const scope = getScope();
  const { showError } = useToaster();

  const { data, loading } = listProbes({
    ...scope,
    options: {
      onError: err => showError(err.message)
    }
  });

  // Second View stuff
  const [mode, setMode] = React.useState<Mode>(Mode.SoT);
  const [probeID, setProbeID] = React.useState<string>();

  const [getProbeYAMLQuery] = getProbeYAML({
    ...scope,
    probeID: probeID ?? '',
    mode: mode,
    options: {
      onError: err => showError(err.message)
    }
  });

  React.useEffect(() => {
    getProbeYAMLQuery({
      variables: {
        identifiers: scope,
        request: {
          probeID: probeID ?? '',
          mode: mode
        }
      }
    }).then(probeYAMLData => {
      if (probeYAMLData.data) {
        if (faultData) {
          faultData.engineCR?.spec?.experiments?.[0]?.spec?.probe?.push(parse(probeYAMLData.data?.getProbeYAML));
          onSave({ faultName: faultData.faultName, engineCR: faultData.engineCR });
        }

        window.alert('Added');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [probeID]);

  return (
    <div style={{ width: '100%' }}>
      {!loading && data?.listProbes ? (
        <div>
          {data.listProbes.map((probe: Probe) => (
            <div
              style={{ boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)', margin: '2rem', padding: '2rem' }}
              key={probe.probeId}
            >
              <h3>{probe.name}</h3>
              <p>{probe.probeId}</p>
              <select onChange={e => setMode(e.target.value as Mode)}>
                <option value={Mode.SoT}>{Mode.SoT}</option>
                <option value={Mode.EoT}>{Mode.EoT}</option>
                <option value={Mode.Edge}>{Mode.Edge}</option>
                <option value={Mode.OnChaos}>{Mode.OnChaos}</option>
                <option value={Mode.Continuous}>{Mode.Continuous}</option>
              </select>
              <button
                onClick={() => {
                  setProbeID(probe.probeId);
                }}
              >
                Add to manifest
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
