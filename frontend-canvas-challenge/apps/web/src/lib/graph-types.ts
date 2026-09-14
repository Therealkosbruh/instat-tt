import type { Edge as RFEdge, Node as RFNode, Viewport } from '@xyflow/react';

export type PromptData = { text: string };
export type GeneratorData = { label: string };
export type ResultData = { label: string };

export type PromptNode = RFNode<PromptData, 'prompt'>;
export type GeneratorNode = RFNode<GeneratorData, 'generator'>;
export type ResultNode = RFNode<ResultData, 'result'>;
export type AppNode = PromptNode | GeneratorNode | ResultNode;
export type AppNodeType = AppNode['type'];
export type AppEdge = RFEdge;

export type { Viewport };
