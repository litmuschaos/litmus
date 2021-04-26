import { DraggableLocation } from 'react-beautiful-dnd';

interface ManifestSteps {
  name: string;
  template: string;
}

interface StepType {
  [key: string]: ManifestSteps[];
}

/**
 * Function for reordering the result
 */
export const reorder = (
  list: ManifestSteps[],
  startIndex: number,
  endIndex: number
): ManifestSteps[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export const reorderSteps = (
  steps: StepType,
  source: DraggableLocation,
  destination: DraggableLocation
) => {
  const current = [...steps[source.droppableId]];
  const next = [...steps[destination.droppableId]];
  const target = current[source.index];
  /**
   * Moving data to same list
   */
  if (source.droppableId === destination.droppableId) {
    const reordered = reorder(current, source.index, destination.index);
    return {
      ...steps,
      [source.droppableId]: reordered,
    };
  }

  /**
   * Moving to different list
   */
  current.splice(source.index, 1); // Remove from original list
  next.splice(destination.index, 0, target); // Insert into the new list

  return {
    ...steps,
    [source.droppableId]: current,
    [destination.droppableId]: next,
  };
};
