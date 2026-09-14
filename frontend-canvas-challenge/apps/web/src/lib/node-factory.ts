import type { AppNode, AppNodeType } from './graph-types';

const COLUMN_X: Record<AppNodeType, number> = { prompt: 40, generator: 400, result: 760 };

const NODE_BUILDERS: Record<
  AppNodeType,
  (id: string, position: { x: number; y: number }) => AppNode
> = {
  prompt: (id, position) => ({ id, type: 'prompt', position, data: { text: '' } }),
  generator: (id, position) => ({ id, type: 'generator', position, data: { label: 'Генератор' } }),
  result: (id, position) => ({ id, type: 'result', position, data: { label: 'Результат' } }),
};

function nextPosition(nodes: readonly AppNode[], type: AppNodeType): { x: number; y: number } {
  let countOfType = 0;
  for (const node of nodes) if (node.type === type) countOfType += 1;
  return { x: COLUMN_X[type], y: 40 + countOfType * 140 };
}

export function createNode(type: AppNodeType, existingNodes: readonly AppNode[]): AppNode {
  const id = crypto.randomUUID();
  return NODE_BUILDERS[type](id, nextPosition(existingNodes, type));
}
