import { getNode } from '../../../utils/createSVGNode';
import { getIcon } from './icons';

interface CreateLabelProps {
  label: string;
  tooltip?: string;
  phase: string;
  horizontal: boolean;
}

interface CreateLabel {
  (props: CreateLabelProps): SVGElement;
}

const createLabel: CreateLabel = ({ label, tooltip, phase, horizontal }) => {
  const g = getNode('g');

  const circle = getNode('circle', {
    cx: 0,
    cy: 0,
    r: 15,
  });
  g.appendChild(circle);

  if (tooltip) {
    const title = getNode('title');
    title.innerHTML = tooltip;
    circle.appendChild(title);
  }

  g.appendChild(getIcon(phase));

  const text = getNode('text');
  g.appendChild(text);

  const increment = horizontal ? 10 : 25;
  for (let i = 0; i < label.length; i += increment) {
    const tspan = getNode('tspan', {
      x: horizontal || label.length > 25 ? -3 * increment : -label.length * 3,
      y: 20 + i * (horizontal ? 1.2 : 0.6),
      dy: '1rem',
    });
    tspan.innerHTML =
      i + increment < label.length - 1
        ? label.slice(i, i + increment)
        : label.slice(i);
    text.appendChild(tspan);
  }

  return g;
};
export { createLabel };
