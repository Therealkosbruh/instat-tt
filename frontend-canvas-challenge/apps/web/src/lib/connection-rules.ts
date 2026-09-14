import type { AppEdge, AppNode, AppNodeType } from './graph-types';

const ALLOWED_CONNECTIONS: ReadonlyMap<AppNodeType, AppNodeType> = new Map([
  ['prompt', 'generator'],
  ['generator', 'result'],
]);

export interface ConnectionCandidate {
  source: string;
  target: string;
}

export interface ConnectionValidation {
  valid: boolean;
  reason?: string;
}

export function buildNodeTypeIndex(nodes: readonly AppNode[]): Map<string, AppNodeType> {
  const index = new Map<string, AppNodeType>();
  for (const node of nodes) index.set(node.id, node.type);
  return index;
}

export function getEdgesForNode(edges: readonly AppEdge[], nodeId: string): AppEdge[] {
  const connected: AppEdge[] = [];
  for (const edge of edges) {
    if (edge.source === nodeId || edge.target === nodeId) connected.push(edge);
  }
  return connected;
}

export function validateConnection(
  candidate: ConnectionCandidate,
  nodeTypes: ReadonlyMap<string, AppNodeType>,
  edges: readonly AppEdge[],
): ConnectionValidation {
  if (candidate.source === candidate.target) {
    return { valid: false, reason: 'Нельзя соединить ноду саму с собой.' };
  }

  const sourceType = nodeTypes.get(candidate.source);
  const targetType = nodeTypes.get(candidate.target);
  if (!sourceType || !targetType) {
    return { valid: false, reason: 'Одна из нод не найдена.' };
  }

  if (ALLOWED_CONNECTIONS.get(sourceType) !== targetType) {
    return { valid: false, reason: 'Допустимы только связи текст → генератор → результат.' };
  }

  if (edges.some((edge) => edge.target === candidate.target)) {
    return { valid: false, reason: 'У этого входа уже есть соединение.' };
  }

  if (sourceType === 'generator' && edges.some((edge) => edge.source === candidate.source)) {
    return { valid: false, reason: 'У генератора уже есть один выход.' };
  }

  return { valid: true };
}

export interface GeneratorReadiness {
  ready: boolean;
  reason?: string;
  promptText?: string;
  resultNodeId?: string;
}

export function getGeneratorReadiness(
  generatorId: string,
  nodes: readonly AppNode[],
  edges: readonly AppEdge[],
): GeneratorReadiness {
  const nodeById = new Map(nodes.map((node) => [node.id, node] as const));
  const generator = nodeById.get(generatorId);
  if (!generator || generator.type !== 'generator') {
    return { ready: false, reason: 'Нода не найдена.' };
  }

  const incoming = edges.find((edge) => edge.target === generatorId);
  const promptNode = incoming ? nodeById.get(incoming.source) : undefined;
  const promptText = promptNode?.type === 'prompt' ? promptNode.data.text.trim() : '';
  if (!promptText) {
    return { ready: false, reason: 'Подключите текстовую ноду с непустым описанием.' };
  }

  const outgoing = edges.find((edge) => edge.source === generatorId);
  const resultNode = outgoing ? nodeById.get(outgoing.target) : undefined;
  if (!resultNode || resultNode.type !== 'result') {
    return { ready: false, reason: 'Подключите ноду результата.' };
  }

  return { ready: true, promptText, resultNodeId: resultNode.id };
}
