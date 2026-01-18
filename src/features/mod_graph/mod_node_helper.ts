import {
  modNodeRegistry,
  type ModNodeInstance,
  type ModNodeSpec,
} from './mod_node_registry';

export const calcNodes = (nodes: ModNodeInstance[], forIndex: number) => {
  if (nodes.length === 0) {
    return 0;
  }

  const [firstNode, ...restNodes] = nodes;
  const firstNodeSpec = modNodeRegistry[firstNode.type];
  if (firstNodeSpec.pipe.input !== 'void') {
    throw new Error('First node must have void input');
  }

  let acc = firstNodeSpec.pipe.transform({
    state: firstNode.state,
    input: undefined,
  });

  for (const [index, node] of restNodes.entries()) {
    if (index >= forIndex) {
      break;
    }
    const spec = modNodeRegistry[node.type];

    const prevNode = nodes[index - 1];
    if (prevNode) {
      const prevSpec = modNodeRegistry[prevNode.type];

      if (spec.pipe.input !== prevSpec.pipe.output) {
        throw new Error(
          `Type mismatch: node ${index} input "${spec.type}:${spec.pipe.input}" does not match previous node output "${prevSpec.type}:${prevSpec.pipe.output}"`,
        );
      }
    }

    acc = spec.pipe.transform({ state: node.state, input: acc });
  }

  return acc;
};

export const canAddNode = (nodes: ModNodeInstance[], spec: ModNodeSpec) => {
  const isFirst = nodes.length === 0;
  const isSelfVoid = spec.pipe.input === 'void';
  if (isFirst) {
    return isSelfVoid;
  }

  const prevNode = nodes[nodes.length - 1];
  const prevNodeSpec = prevNode ? modNodeRegistry[prevNode.type] : null;
  const matchesPrevOutput = spec.pipe.input === prevNodeSpec?.pipe.output;

  return matchesPrevOutput;
};
