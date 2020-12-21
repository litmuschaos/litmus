interface Attributes {
  [index: string]: Object;
}

function getNode(type: string, attr?: Attributes) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', type);
  for (const p in attr) {
    if (Object.prototype.hasOwnProperty.call(attr, p)) {
      node.setAttributeNS(
        null,
        p.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`),
        attr[p] as any
      );
    }
  }
  return node;
}

interface CreateLabelProps {
  label: string;
  tooltip?: string;
  horizontal: boolean;
}

interface CreateLabel {
  (props: CreateLabelProps): SVGElement;
}

const createLabel: CreateLabel = ({ label, tooltip, horizontal }) => {
  const g = getNode('g');
  document.body.appendChild(g);

  const circle = getNode('circle', {
    cx: 0,
    cy: horizontal ? 0 : -10,
    r: 20,
    fill: 'green',
  });
  g.appendChild(circle);

  if (tooltip) {
    const title = getNode('title');
    title.innerHTML = tooltip;
    circle.appendChild(title);
  }

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
