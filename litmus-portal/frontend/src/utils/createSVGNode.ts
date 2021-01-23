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

export { getNode };
