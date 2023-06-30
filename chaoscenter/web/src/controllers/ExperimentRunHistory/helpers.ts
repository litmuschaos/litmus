import type { Weightages, Nodes, ExperimentRun, ExecutionData } from '@api/entities';
import { calculateTotalProbeStatusFromChaosData, handleTimestampAmbiguity, isValidNodeType } from '@utils';
import type { ExperimentRunFaultDetails, ExperimentRunDetails } from './types';

export function generateFaultTableContent(
  weightages: Array<Weightages>,
  nodes: Nodes
): Array<ExperimentRunFaultDetails> {
  const weightMap: {
    [x: string]: number;
  } = {};

  weightages?.map((exp: Weightages) => {
    weightMap[exp.experimentName] = exp.weightage; // TODO: Change to faultName with backend change
  });

  const content: Array<ExperimentRunFaultDetails> = nodes
    ? Object.entries(nodes)
        .filter(([_, node]) => isValidNodeType(node.type))
        .map(([key, node]) => {
          const [passedProbes, failedProbes, naProbes] = calculateTotalProbeStatusFromChaosData(node.chaosData);
          return {
            faultID: key,
            faultName: node.name,
            faultStatus: node.phase,
            probeStatus: {
              passed: passedProbes,
              failed: failedProbes,
              na: naProbes
            },
            faultWeight: weightMap[node.name],
            startedAt: node.startedAt ? parseInt(handleTimestampAmbiguity(node.startedAt)) : undefined,
            finishedAt: node.finishedAt ? parseInt(handleTimestampAmbiguity(node.finishedAt)) : undefined
          };
        })
    : [];
  return content;
}

export function generateExperimentRunTableContent(
  experimentRunsWithExecutionData: Array<ExperimentRun>
): Array<ExperimentRunDetails> {
  const experimentRunsWithNonEmptyExecutionData = experimentRunsWithExecutionData.filter(
    individualRun => individualRun.executionData !== ''
  );
  const content: Array<ExperimentRunDetails> = experimentRunsWithNonEmptyExecutionData.map(individualRun => {
    const experimentRunExecutionData = JSON.parse(individualRun.executionData) as ExecutionData;
    return {
      experimentID: individualRun.experimentID,
      experimentRunName: experimentRunExecutionData.name,
      experimentRunID: individualRun.experimentRunID,
      experimentStatus: individualRun.phase,
      executedBy: individualRun.updatedBy,
      resilienceScore: individualRun.resiliencyScore,
      startedAt: parseInt(handleTimestampAmbiguity(experimentRunExecutionData?.startedAt)),
      finishedAt: parseInt(handleTimestampAmbiguity(experimentRunExecutionData?.finishedAt)),
      executedAt: parseInt(individualRun.updatedAt ?? ''),
      faultTableData: {
        experimentID: individualRun.experimentID,
        experimentRunID: individualRun.experimentRunID,
        content: generateFaultTableContent(individualRun.weightages, experimentRunExecutionData.nodes)
      }
    };
  });
  return content;
}
