import type { GraphData, NodeData } from '@canvas/contracts';
import type { AppEdge, AppNode, AppNodeType, Viewport } from './graph-types';

function copyPosition(position: { x: number; y: number }): { x: number; y: number } {
  return { x: position.x, y: position.y };
}

const toApiConverters: Record<AppNodeType, (node: AppNode) => NodeData> = {
  prompt: (node) => {
    if (node.type !== 'prompt') throw new Error('Некорректный тип ноды.');
    return {
      id: node.id,
      type: 'prompt',
      position: copyPosition(node.position),
      data: { text: node.data.text },
    };
  },
  generator: (node) => {
    if (node.type !== 'generator') throw new Error('Некорректный тип ноды.');
    return {
      id: node.id,
      type: 'generator',
      position: copyPosition(node.position),
      data: { label: node.data.label },
    };
  },
  result: (node) => {
    if (node.type !== 'result') throw new Error('Некорректный тип ноды.');
    return {
      id: node.id,
      type: 'result',
      position: copyPosition(node.position),
      data: { label: node.data.label },
    };
  },
};

const fromApiConverters: Record<AppNodeType, (node: NodeData) => AppNode> = {
  prompt: (node) => {
    if (node.type !== 'prompt') throw new Error('Некорректный тип ноды.');
    return {
      id: node.id,
      type: 'prompt',
      position: copyPosition(node.position),
      data: { text: node.data.text },
    };
  },
  generator: (node) => {
    if (node.type !== 'generator') throw new Error('Некорректный тип ноды.');
    return {
      id: node.id,
      type: 'generator',
      position: copyPosition(node.position),
      data: { label: node.data.label },
    };
  },
  result: (node) => {
    if (node.type !== 'result') throw new Error('Некорректный тип ноды.');
    return {
      id: node.id,
      type: 'result',
      position: copyPosition(node.position),
      data: { label: node.data.label },
    };
  },
};

function toApiNode(node: AppNode): NodeData {
  return toApiConverters[node.type](node);
}

function fromApiNode(node: NodeData): AppNode {
  return fromApiConverters[node.type](node);
}

export function toApiGraph(nodes: AppNode[], edges: AppEdge[], viewport: Viewport): GraphData {
  const apiNodes: NodeData[] = [];
  for (const node of nodes) apiNodes.push(toApiNode(node));

  const apiEdges: GraphData['edges'] = [];
  for (const edge of edges)
    apiEdges.push({ id: edge.id, source: edge.source, target: edge.target });

  return {
    nodes: apiNodes,
    edges: apiEdges,
    viewport: { x: viewport.x, y: viewport.y, zoom: viewport.zoom },
  };
}

export function fromApiGraph(graph: GraphData): {
  nodes: AppNode[];
  edges: AppEdge[];
  viewport: Viewport;
} {
  const nodes: AppNode[] = [];
  for (const node of graph.nodes) nodes.push(fromApiNode(node));

  const edges: AppEdge[] = [];
  for (const edge of graph.edges)
    edges.push({ id: edge.id, source: edge.source, target: edge.target });

  return { nodes, edges, viewport: { ...graph.viewport } };
}
